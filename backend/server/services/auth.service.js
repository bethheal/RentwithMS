import { OAuth2Client } from 'google-auth-library'
import { createHash, randomBytes, randomUUID } from 'node:crypto'
import prisma from '../config/prisma.js'
import env from '../config/env.js'
import { ROLES } from '../constants/roles.js'
import ApiError from '../utils/apiError.js'
import { signToken } from '../utils/jwt.js'
import { comparePassword, hashPassword } from '../utils/password.js'

const googleClient = env.GOOGLE_CLIENT_ID ? new OAuth2Client(env.GOOGLE_CLIENT_ID) : null
const PASSWORD_RESET_TTL_MS = 15 * 60 * 1000

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

function hashResetToken(resetToken) {
  return createHash('sha256').update(resetToken).digest('hex')
}

function buildPasswordResetUrl(resetToken) {
  return `${env.CLIENT_ORIGIN.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(
    resetToken
  )}`
}

function assertPublicRole(role) {
  if (role !== ROLES.LANDLORD && role !== ROLES.TENANT) {
    throw new ApiError(403, 'Public signup is only available for landlords and tenants.')
  }
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

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    throw new ApiError(401, 'Invalid email or password')
  }

  const isPasswordValid = await comparePassword(credentials.password, user.passwordHash)

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password')
  }

  return buildAuthResult(user)
}

export async function signupUser(userData) {
  assertPublicRole(userData.role)

  const email = normalizeEmail(userData.email)

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  if (existingUser) {
    throw new ApiError(409, 'A user with this email address already exists.')
  }

  const passwordHash = await hashPassword(userData.password)
  const user = await prisma.user.create({
    data: {
      name: userData.name.trim(),
      email,
      passwordHash,
      role: userData.role,
    },
  })

  return buildAuthResult(user)
}

export async function authenticateWithGoogle(payload) {
  const googleProfile = await verifyGoogleProfile(payload.idToken)
  const existingUser = await prisma.user.findUnique({
    where: { email: googleProfile.email },
  })

  if (existingUser) {
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
      passwordHash,
      role: nextRole,
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
