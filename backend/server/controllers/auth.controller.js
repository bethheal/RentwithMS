import asyncHandler from '../utils/asyncHandler.js'
import { serializeUser } from '../utils/serializers.js'
import {
  authenticateWithGoogle,
  getAuthenticatedUser,
  loginUser,
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

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await getAuthenticatedUser(req.user.id)

  res.status(200).json({
    success: true,
    data: serializeUser(user),
  })
})
