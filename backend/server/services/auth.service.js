import { OAuth2Client } from 'google-auth-library'
import { randomUUID } from 'node:crypto'
import prisma from '../config/prisma.js'
import env from '../config/env.js'
import { ROLES } from '../constants/roles.js'
import ApiError from '../utils/apiError.js'
import { signToken } from '../utils/jwt.js'
import { comparePassword, hashPassword } from '../utils/password.js'

const googleClient = env.GOOGLE_CLIENT_ID ? new OAuth2Client(env.GOOGLE_CLIENT_ID) : null

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
  } catch (error) {
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
    throw new ApiError(401, 'Invalid email or password.')
  }

  const isPasswordValid = await comparePassword(credentials.password, user.passwordHash)

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password.')
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

export async function getAuthenticatedUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new ApiError(404, 'User not found.')
  }

  return user
}
