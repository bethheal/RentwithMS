import { OAuth2Client } from 'google-auth-library'
import { createHash, randomBytes, randomInt, randomUUID } from 'node:crypto'
import prisma from '../config/prisma.js'
import env from '../config/env.js'
import { ROLES } from '../constants/roles.js'
import ApiError from '../utils/apiError.js'
import { signToken } from '../utils/jwt.js'
import { comparePassword, hashPassword } from '../utils/password.js'
import { sendVerificationEmail } from './mailService.js'

const googleClient = env.GOOGLE_CLIENT_ID ? new OAuth2Client(env.GOOGLE_CLIENT_ID) : null
const PASSWORD_RESET_TTL_MS = 15 * 60 * 1000
const EMAIL_OTP_TTL_MS = 10 * 60 * 1000
const PHONE_OTP_TTL_MS = 5 * 60 * 1000
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000
const RESEND_COOLDOWN_MS = 45 * 1000
const MAX_RESEND_ATTEMPTS = 5
const MAX_VERIFICATION_ATTEMPTS = 5
const UNVERIFIED_ACCOUNT_TTL_MS = 48 * 60 * 60 * 1000
const DEACTIVATION_GRACE_PERIOD_MS = 30 * 24 * 60 * 60 * 1000

function buildAuthResult(user) {
  return {
    token: signToken({
      userId: user.id,
      role: user.role,
    }),
    user,
  }
}

function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

function normalizePhoneNumber(phoneNumber) {
  return String(phoneNumber ?? '').replace(/[^\d+]/g, '')
}

function hashResetToken(resetToken) {
  return createHash('sha256').update(resetToken).digest('hex')
}

function hashVerificationSecret(secret) {
  return createHash('sha256').update(secret).digest('hex')
}

function buildPasswordResetUrl(resetToken) {
  return `${getPrimaryClientOrigin()}/reset-password?token=${encodeURIComponent(
    resetToken
  )}`
}

function getPrimaryClientOrigin() {
  return (env.CLIENT_ORIGINS[0] ?? env.CLIENT_ORIGIN).replace(/\/$/, '')
}

function assertPublicRole(role) {
  if (role !== ROLES.LANDLORD && role !== ROLES.TENANT) {
    throw new ApiError(403, 'Public signup is only available for landlords and tenants.')
  }
}

function assertVerificationMethod(method) {
  if (method !== 'email' && method !== 'phone') {
    throw new ApiError(400, 'Choose email or phone verification.')
  }
}

function generateOtp() {
  return String(randomInt(100000, 1000000))
}

function buildVerificationPayload(method) {
  const code = generateOtp()
  const token = randomBytes(32).toString('hex')
  const isPhone = method === 'phone'

  return {
    code,
    token,
    verificationCode: hashVerificationSecret(code),
    verificationToken: hashVerificationSecret(token),
    verificationCodeExpiry: new Date(Date.now() + (isPhone ? PHONE_OTP_TTL_MS : EMAIL_OTP_TTL_MS)),
    verificationTokenExpiry: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
    lastVerificationSentAt: new Date(),
  }
}

function buildVerificationResponse(user, method, delivery) {
  return {
    userId: user.id,
    email: user.email,
    phoneNumber: user.phoneNumber,
    verificationMethod: method,
    expiresAt: user.verificationCodeExpiry,
    cooldownSeconds: Math.ceil(RESEND_COOLDOWN_MS / 1000),
    maxResendAttempts: MAX_RESEND_ATTEMPTS,
    resendAttempts: user.resendAttempts,
    verificationToken: delivery?.token,
    verificationUrl: delivery?.url,
  }
}

async function sendEmailVerification(user, { code, token }) {
  const verificationUrl = `${getPrimaryClientOrigin()}/signup?userId=${encodeURIComponent(
    user.id
  )}&verifyToken=${encodeURIComponent(token)}`

  await sendVerificationEmail(user.email, code, verificationUrl)

  return { code, token, url: verificationUrl }
}

function sendSmsVerification(user, { code }) {
  return { code }
}

async function sendVerification(user, method, payload) {
  return method === 'phone'
    ? sendSmsVerification(user, payload)
    : sendEmailVerification(user, payload)
}

async function deleteExpiredUnverifiedAccounts() {
  const cutoff = new Date(Date.now() - UNVERIFIED_ACCOUNT_TTL_MS)

  await prisma.user.deleteMany({
    where: {
      accountStatus: 'pending_verification',
      createdAt: {
        lt: cutoff,
      },
    },
  })
}

export async function cleanupExpiredInactiveAccounts() {
  await prisma.user.updateMany({
    where: {
      accountStatus: 'deactivated',
      scheduledDeletionDate: {
        lte: new Date(),
      },
    },
    data: {
      accountStatus: 'deleted',
      passwordResetExpiresAt: null,
      passwordResetTokenHash: null,
      verificationCode: null,
      verificationToken: null,
      verificationCodeExpiry: null,
      verificationTokenExpiry: null,
    },
  })
}

async function verifyGoogleProfile(idToken) {
  if (!googleClient || !env.GOOGLE_CLIENT_ID) {
    throw new ApiError(503, 'Google authentication is not configured yet.')
  }

  let ticket

  try {
    ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    })
  } catch {
    throw new ApiError(401, 'Google authentication failed.')
  }

  const payload = ticket.getPayload()
  const email = payload?.email ? normalizeEmail(payload.email) : ''

  if (!email) {
    throw new ApiError(400, 'Google did not return an email address for this account.')
  }

  if (!payload.email_verified) {
    throw new ApiError(400, 'Google account email must be verified before signing in.')
  }

  const fallbackName = email.split('@')[0]
  const name = payload.name?.trim() || payload.given_name?.trim() || fallbackName

  return {
    email,
    name,
  }
}

export async function loginUser(credentials) {
  const email = normalizeEmail(credentials.email)

  let user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    throw new ApiError(401, 'Invalid email or password')
  }

  const isPasswordValid = await comparePassword(credentials.password, user.passwordHash)

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password')
  }

  if (user.accountStatus === 'pending_verification') {
    throw new ApiError(403, 'Please verify your account before logging in.')
  }

  if (user.accountStatus === 'deleted') {
    throw new ApiError(403, 'This account has been permanently removed.')
  }

  if (user.accountStatus === 'deactivated') {
    if (user.scheduledDeletionDate && user.scheduledDeletionDate <= new Date()) {
      await cleanupExpiredInactiveAccounts()
      throw new ApiError(403, 'This account has been permanently removed.')
    }

    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        accountStatus: 'active',
        deactivatedAt: null,
        scheduledDeletionDate: null,
      },
    })
  }

  return buildAuthResult(user)
}

export async function signupUser(userData) {
  await deleteExpiredUnverifiedAccounts()
  assertPublicRole(userData.role)
  assertVerificationMethod(userData.verificationMethod)

  const email = normalizeEmail(userData.email)
  const phoneNumber = normalizePhoneNumber(userData.phoneNumber)

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phoneNumber }],
    },
    select: { id: true },
  })

  if (existingUser) {
    throw new ApiError(409, 'A user with this email address or phone number already exists.')
  }

  const passwordHash = await hashPassword(userData.password)
  const verificationPayload = buildVerificationPayload(userData.verificationMethod)
  const user = await prisma.user.create({
    data: {
      name: userData.name.trim(),
      email,
      phoneNumber,
      passwordHash,
      role: userData.role,
      emailVerified: false,
      phoneVerified: false,
      verificationMethod: userData.verificationMethod,
      verificationCode: verificationPayload.verificationCode,
      verificationToken: verificationPayload.verificationToken,
      verificationCodeExpiry: verificationPayload.verificationCodeExpiry,
      verificationTokenExpiry: verificationPayload.verificationTokenExpiry,
      lastVerificationSentAt: verificationPayload.lastVerificationSentAt,
      verificationAttempts: 0,
      resendAttempts: 0,
      accountStatus: 'pending_verification',
    },
  })
  const delivery = await sendVerification(user, userData.verificationMethod, verificationPayload)

  return buildVerificationResponse(user, userData.verificationMethod, delivery)
}

export async function verifySignup(payload) {
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  })

  if (!user || user.accountStatus !== 'pending_verification') {
    throw new ApiError(400, 'Verification request is invalid or already completed.')
  }

  if (user.verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
    throw new ApiError(429, 'Too many failed verification attempts. Please contact support.')
  }

  const submittedSecret = payload.token || payload.code
  const storedSecret = payload.token ? user.verificationToken : user.verificationCode
  const expiry = payload.token ? user.verificationTokenExpiry : user.verificationCodeExpiry

  if (!submittedSecret || !storedSecret || !expiry || expiry <= new Date()) {
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationAttempts: { increment: 1 } },
    })
    throw new ApiError(400, 'This verification code or link has expired.')
  }

  if (hashVerificationSecret(submittedSecret) !== storedSecret) {
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationAttempts: { increment: 1 } },
    })
    throw new ApiError(400, 'Verification code is incorrect.')
  }

  const verifiedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      accountStatus: 'active',
      emailVerified: user.verificationMethod === 'email' ? true : user.emailVerified,
      phoneVerified: user.verificationMethod === 'phone' ? true : user.phoneVerified,
      verificationCode: null,
      verificationToken: null,
      verificationCodeExpiry: null,
      verificationTokenExpiry: null,
      verificationAttempts: 0,
      resendAttempts: 0,
      lastVerificationSentAt: null,
    },
  })

  return verifiedUser
}

export async function resendSignupVerification(payload) {
  assertVerificationMethod(payload.verificationMethod)

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  })

  if (!user || user.accountStatus !== 'pending_verification') {
    throw new ApiError(400, 'Verification request is invalid or already completed.')
  }

  if (user.resendAttempts >= MAX_RESEND_ATTEMPTS) {
    throw new ApiError(429, 'Maximum resend attempts reached. Please try again later.')
  }

  const lastSentAt = user.lastVerificationSentAt?.getTime() ?? 0
  const nextAllowedAt = lastSentAt + RESEND_COOLDOWN_MS

  if (Date.now() < nextAllowedAt) {
    throw new ApiError(429, `Please wait ${Math.ceil((nextAllowedAt - Date.now()) / 1000)} seconds before requesting another code.`)
  }

  const verificationPayload = buildVerificationPayload(payload.verificationMethod)
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      verificationMethod: payload.verificationMethod,
      verificationCode: verificationPayload.verificationCode,
      verificationToken: verificationPayload.verificationToken,
      verificationCodeExpiry: verificationPayload.verificationCodeExpiry,
      verificationTokenExpiry: verificationPayload.verificationTokenExpiry,
      lastVerificationSentAt: verificationPayload.lastVerificationSentAt,
      verificationAttempts: 0,
      resendAttempts: {
        increment: 1,
      },
    },
  })
  const delivery = await sendVerification(updatedUser, payload.verificationMethod, verificationPayload)

  return buildVerificationResponse(updatedUser, payload.verificationMethod, delivery)
}

export async function authenticateWithGoogle(payload) {
  const googleProfile = await verifyGoogleProfile(payload.idToken)
  const existingUser = await prisma.user.findUnique({
    where: { email: googleProfile.email },
  })

  if (existingUser) {
    if (existingUser.accountStatus === 'deleted') {
      throw new ApiError(403, 'This account has been permanently removed.')
    }

    return {
      ...buildAuthResult(existingUser),
      isNewUser: false,
    }
  }

  const nextRole = payload.role ?? ROLES.TENANT
  assertPublicRole(nextRole)

  const passwordHash = await hashPassword(`google-oauth:${randomUUID()}`)
  const user = await prisma.user.create({
    data: {
      name: googleProfile.name,
      email: googleProfile.email,
      emailVerified: true,
      passwordHash,
      role: nextRole,
      accountStatus: 'active',
    },
  })

  return {
    ...buildAuthResult(user),
    isNewUser: true,
  }
}

export async function requestPasswordReset(emailAddress) {
  const email = normalizeEmail(emailAddress)
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  })

  if (!user) {
    throw new ApiError(404, 'No account was found with that email address.')
  }

  const resetToken = randomBytes(32).toString('hex')
  const passwordResetTokenHash = hashResetToken(resetToken)
  const passwordResetExpiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetTokenHash,
      passwordResetExpiresAt,
    },
  })

  return {
    email: user.email,
    expiresAt: passwordResetExpiresAt,
    resetToken,
    resetUrl: buildPasswordResetUrl(resetToken),
  }
}

export async function resetUserPassword(payload) {
  const passwordResetTokenHash = hashResetToken(payload.token)
  const user = await prisma.user.findFirst({
    where: {
      passwordResetTokenHash,
      passwordResetExpiresAt: {
        gt: new Date(),
      },
    },
  })

  if (!user) {
    throw new ApiError(400, 'This password reset link is invalid or has expired.')
  }

  const passwordHash = await hashPassword(payload.password)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetExpiresAt: null,
      passwordResetTokenHash: null,
    },
  })
}

export async function getAuthenticatedUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new ApiError(404, 'User not found.')
  }

  return user
}

export async function deactivateAuthenticatedAccount(userId, password) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new ApiError(404, 'User not found.')
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash)

  if (!isPasswordValid) {
    throw new ApiError(401, 'Password confirmation failed.')
  }

  return prisma.user.update({
    where: { id: user.id },
    data: {
      accountStatus: 'deactivated',
      deactivatedAt: new Date(),
      scheduledDeletionDate: new Date(Date.now() + DEACTIVATION_GRACE_PERIOD_MS),
    },
  })
}

export async function deleteAuthenticatedAccount(userId, password) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new ApiError(404, 'User not found.')
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash)

  if (!isPasswordValid) {
    throw new ApiError(401, 'Password confirmation failed.')
  }

  return prisma.user.update({
    where: { id: user.id },
    data: {
      accountStatus: 'deleted',
      deactivatedAt: new Date(),
      scheduledDeletionDate: new Date(),
      passwordResetExpiresAt: null,
      passwordResetTokenHash: null,
      verificationCode: null,
      verificationToken: null,
      verificationCodeExpiry: null,
      verificationTokenExpiry: null,
    },
  })
}
