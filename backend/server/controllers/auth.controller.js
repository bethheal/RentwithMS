import asyncHandler from '../utils/asyncHandler.js'
import { serializeUser } from '../utils/serializers.js'
import {
  authenticateWithGoogle,
  deactivateAuthenticatedAccount,
  deleteAuthenticatedAccount,
  getAuthenticatedUser,
  loginUser,
  requestPasswordReset,
  resetUserPassword,
  resendSignupVerification,
  signupUser,
  getSignupVerificationStatus,
  verifySignup,
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
  const verification = await signupUser(req.body)

  res.status(201).json({
    success: true,
    message: 'Verification code sent. Complete verification to activate your account.',
    data: verification,
  })
})

export const verifySignupAccount = asyncHandler(async (req, res) => {
  const user = await verifySignup(req.body)

  res.status(200).json({
    success: true,
    message: 'Account verified successfully. Please log in to continue.',
    data: serializeUser(user),
  })
})

export const getSignupVerification = asyncHandler(async (req, res) => {
  const verification = await getSignupVerificationStatus(req.params.userId)

  res.status(200).json({
    success: true,
    data: verification,
  })
})

export const resendSignupCode = asyncHandler(async (req, res) => {
  const verification = await resendSignupVerification(req.body)

  res.status(200).json({
    success: true,
    message: 'Verification code resent.',
    data: verification,
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

export const deactivateAccount = asyncHandler(async (req, res) => {
  const user = await deactivateAuthenticatedAccount(req.user.id, req.body.password)

  res.status(200).json({
    success: true,
    message: 'Account deactivated. You can restore it by logging in within 30 days.',
    data: serializeUser(user),
  })
})

export const deleteAccount = asyncHandler(async (req, res) => {
  const user = await deleteAuthenticatedAccount(req.user.id, req.body.password)

  res.status(200).json({
    success: true,
    message: 'Account access permanently removed.',
    data: serializeUser(user),
  })
})
