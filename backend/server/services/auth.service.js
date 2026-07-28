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
const VERIFICATION_RESEND_COOLDOWN_MS = 60 * 1000
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
  const cleaned = String(phoneNumber ?? '').replace(/[^\d+]/g, '')
  if (/^0\d{9}$/.test(cleaned)) {
    return '233' + cleaned.slice(1)
  }
  return cleaned
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
  if (method !== 'email') {
    throw new ApiError(400, 'Email verification is the only supported verification method.')
  }
}

function isVerifiedEnough(user) {
  if (!env.EMAIL_VERIFICATION_ENABLED) {
    return true
  }

  return Boolean(user.emailVerified)
}

function getAccountStatusForVerification(user) {
  return isVerifiedEnough(user) ? 'active' : 'pending_verification'
}

function generateOtp() {
  return String(randomInt(100000, 1000000))
}

function buildVerificationPayload(method) {
  const code = generateOtp()

  return {
    code,
    verificationCode: hashVerificationSecret(code),
    verificationCodeExpiry: new Date(Date.now() + EMAIL_OTP_TTL_MS),
    lastVerificationSentAt: new Date(),
  }
}

function buildVerificationResponse(
  user,
  method,
  delivery,
  { deliveryError = null, reusedPendingAccount = false } = {},
) {
  return {
    userId: user.id,
    email: user.email,
    phoneNumber: user.phoneNumber,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    accountStatus: user.accountStatus,
    activationRequirement: env.ACCOUNT_ACTIVATION_REQUIREMENT,
    verificationMethod: method,
    expiresAt: user.verificationCodeExpiry,
    cooldownSeconds: Math.ceil(VERIFICATION_RESEND_COOLDOWN_MS / 1000),
    resendAttempts: user.resendAttempts,
    deliveryStatus: delivery ? 'sent' : 'failed',
    deliveryError,
    reusedPendingAccount,
  }
}

async function sendEmailVerification(user, { code }) {
  await sendVerificationEmail(user.email, code)

  return { code }
}

async function sendVerification(user, method, payload) {
  assertVerificationMethod(method)
  return sendEmailVerification(user, payload)
}

async function updateVerificationCredentials(
  user,
  method,
  { enforceCooldown = false, reusedPendingAccount = false } = {},
) {
  assertVerificationMethod(method)

  if (user.accountStatus !== 'pending_verification') {
    throw new ApiError(400, 'This account is already verified. Please log in.')
  }

  const lastSentAt = user.lastVerificationSentAt?.getTime() ?? 0
  const nextAllowedAt = lastSentAt + VERIFICATION_RESEND_COOLDOWN_MS

  if (enforceCooldown && Date.now() < nextAllowedAt) {
    const retryAfterSeconds = Math.ceil((nextAllowedAt - Date.now()) / 1000)
    throw new ApiError(
      429,
      `Please wait ${retryAfterSeconds} seconds before requesting another code.`,
      {
        reason: 'resend_cooldown',
        retryAfterSeconds,
        cooldownSeconds: Math.ceil(VERIFICATION_RESEND_COOLDOWN_MS / 1000),
      },
    )
  }

  const verificationPayload = buildVerificationPayload(method)
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      verificationMethod: method,
      verificationCode: verificationPayload.verificationCode,
      verificationCodeExpiry: verificationPayload.verificationCodeExpiry,
      lastVerificationSentAt: verificationPayload.lastVerificationSentAt,
      verificationAttempts: 0,
      resendAttempts: enforceCooldown ? { increment: 1 } : user.resendAttempts,
    },
  })

  let delivery
  let deliveryError = null
  try {
    delivery = await sendVerification(updatedUser, method, verificationPayload)
  } catch (error) {
    deliveryError = error.message
    console.error('[Verification] Failed to send verification:', {
      userId: updatedUser.id,
      email: updatedUser.email,
      method,
      error: error.message,
      cause: error.cause?.message,
    })
    delivery = null
  }

  return buildVerificationResponse(updatedUser, method, delivery, {
    deliveryError,
    reusedPendingAccount,
  })
}

async function activateUserWithoutVerification(user) {
  return prisma.user.update({
    where: { id: user.id },
    data: {
      accountStatus: 'active',
      emailVerified: true,
      phoneVerified: user.phoneVerified,
      verificationMethod: null,
      verificationCode: null,
      verificationToken: null,
      verificationCodeExpiry: null,
      verificationTokenExpiry: null,
      verificationAttempts: 0,
      resendAttempts: 0,
      lastVerificationSentAt: null,
    },
  })
}

function buildVerificationDisabledResponse(user, { reusedPendingAccount = false } = {}) {
  return {
    userId: user.id,
    email: user.email,
    phoneNumber: user.phoneNumber,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    accountStatus: user.accountStatus,
    activationRequirement: env.ACCOUNT_ACTIVATION_REQUIREMENT,
    verificationRequired: false,
    reusedPendingAccount,
  }
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
    if (!env.EMAIL_VERIFICATION_ENABLED) {
      user = await activateUserWithoutVerification(user)
    } else {
    throw new ApiError(403, 'Please verify your account before logging in.', {
      reason: 'pending_verification',
      userId: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      activationRequirement: env.ACCOUNT_ACTIVATION_REQUIREMENT,
    })
    }
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
  })

  if (existingUser) {
    if (existingUser.accountStatus !== 'pending_verification') {
      throw new ApiError(409, 'An account with this email or phone number already exists. Please log in.')
    }

    if (!env.EMAIL_VERIFICATION_ENABLED) {
      const activatedUser = await activateUserWithoutVerification(existingUser)
      return buildVerificationDisabledResponse(activatedUser, {
        reusedPendingAccount: true,
      })
    }

    return updateVerificationCredentials(existingUser, userData.verificationMethod, {
      reusedPendingAccount: true,
    })
  }

  const user = await prisma.user.create({
    data: {
      name: userData.name.trim(),
      email,
      phoneNumber,
      passwordHash: await hashPassword(userData.password),
      role: userData.role,
      emailVerified: !env.EMAIL_VERIFICATION_ENABLED,
      phoneVerified: false,
      verificationAttempts: 0,
      resendAttempts: 0,
      accountStatus: env.EMAIL_VERIFICATION_ENABLED ? 'pending_verification' : 'active',
    },
  })

  if (!env.EMAIL_VERIFICATION_ENABLED) {
    return buildVerificationDisabledResponse(user)
  }

  return updateVerificationCredentials(user, userData.verificationMethod)
}

export async function verifySignup(payload) {
  const submittedSecret = payload.code
  const hashedSecret = submittedSecret ? hashVerificationSecret(submittedSecret) : ''
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  })

  if (!user || user.accountStatus !== 'pending_verification') {
    throw new ApiError(400, 'Verification request is invalid or already completed.')
  }

  if (user.verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
    throw new ApiError(429, 'Too many failed verification attempts. Please contact support.')
  }

  const storedSecret = user.verificationCode
  const expiry = user.verificationCodeExpiry

  if (!submittedSecret || !storedSecret || !expiry || expiry <= new Date()) {
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationAttempts: { increment: 1 } },
    })
    throw new ApiError(400, 'This verification code or link has expired.')
  }

  if (hashedSecret !== storedSecret) {
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationAttempts: { increment: 1 } },
    })
    throw new ApiError(400, 'Verification code is incorrect.')
  }

  const nextUser = {
    ...user,
    emailVerified: true,
    phoneVerified: user.phoneVerified,
  }

  const verifiedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      accountStatus: getAccountStatusForVerification(nextUser),
      emailVerified: nextUser.emailVerified,
      phoneVerified: nextUser.phoneVerified,
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

export async function getSignupVerificationStatus(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      phoneNumber: true,
      emailVerified: true,
      phoneVerified: true,
      accountStatus: true,
      verificationMethod: true,
      verificationCodeExpiry: true,
      resendAttempts: true,
    },
  })

  if (!user) {
    throw new ApiError(404, 'Verification request was not found.')
  }

  return {
    userId: user.id,
    email: user.email,
    phoneNumber: user.phoneNumber,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    accountStatus: user.accountStatus,
    activationRequirement: env.ACCOUNT_ACTIVATION_REQUIREMENT,
    verificationMethod: user.verificationMethod,
    expiresAt: user.verificationCodeExpiry,
    cooldownSeconds: Math.ceil(VERIFICATION_RESEND_COOLDOWN_MS / 1000),
    resendAttempts: user.resendAttempts,
    deliveryStatus: null,
  }
}

export async function resendSignupVerification(payload) {
  const user = payload.email
    ? await prisma.user.findUnique({
        where: { email: normalizeEmail(payload.email) },
      })
    : await prisma.user.findUnique({
        where: { id: payload.userId },
      })

  if (!user || user.accountStatus !== 'pending_verification') {
    throw new ApiError(400, 'Verification request is invalid or already completed.')
  }

  return updateVerificationCredentials(user, payload.verificationMethod ?? 'email', {
    enforceCooldown: true,
  })
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
      accountStatus: getAccountStatusForVerification({
        emailVerified: true,
        phoneVerified: false,
      }),
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
