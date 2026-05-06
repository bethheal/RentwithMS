import asyncHandler from '../utils/asyncHandler.js'
import { serializeUser } from '../utils/serializers.js'
import {
  authenticateWithGoogle,
  getAuthenticatedUser,
  loginUser,
  requestPasswordReset,
  resetUserPassword,
  signupUser,
} from '../services/auth.service.js'

export const login = asyncHandler(async (req, res) => {
  const { token, user } = await loginUser(req.body)

  res.status(200).json({
    success: true,
    message: 'Login successful.',
    data: {
      token,
      user: serializeUser(user),
    },
  })
})

export const signup = asyncHandler(async (req, res) => {
  const { token, user } = await signupUser(req.body)

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    data: {
      token,
      user: serializeUser(user),
    },
  })
})

export const googleAuth = asyncHandler(async (req, res) => {
  const { token, user, isNewUser } = await authenticateWithGoogle(req.body)

  res.status(isNewUser ? 201 : 200).json({
    success: true,
    message: isNewUser
      ? 'Google account linked successfully.'
      : 'Google login successful.',
    data: {
      token,
      user: serializeUser(user),
    },
  })
})

export const forgotPassword = asyncHandler(async (req, res) => {
  const resetDetails = await requestPasswordReset(req.body.email)

  res.status(200).json({
    success: true,
    message: resetDetails.resetUrl
      ? 'Password reset link sent.'
      : 'If an account exists with that email address, reset instructions are ready.',
    data: resetDetails,
  })
})

export const resetPassword = asyncHandler(async (req, res) => {
  await resetUserPassword(req.body)

  res.status(200).json({
    success: true,
    message: 'Password has been reset successfully.',
  })
})

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await getAuthenticatedUser(req.user.id)

  res.status(200).json({
    success: true,
    data: serializeUser(user),
  })
})
