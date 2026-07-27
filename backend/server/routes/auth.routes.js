import { Router } from 'express'
import {
  forgotPassword,
  getSignupVerification,
  getCurrentUser,
  googleAuth,
  login,
  deactivateAccount,
  deleteAccount,
  resendSignupCode,
  resetPassword,
  signup,
  verifySignupAccount,
} from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { validateRequest } from '../middleware/validateRequest.middleware.js'
import {
  forgotPasswordSchema,
  googleAuthSchema,
  loginSchema,
  accountPasswordConfirmationSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  signupSchema,
  verificationStatusSchema,
  verifySignupSchema,
} from '../validators/auth.validation.js'

const router = Router()

router.post('/signup', validateRequest(signupSchema), signup)
router.get('/signup/status/:userId', validateRequest(verificationStatusSchema), getSignupVerification)
router.post('/signup/verify', validateRequest(verifySignupSchema), verifySignupAccount)
router.post('/signup/resend', validateRequest(resendVerificationSchema), resendSignupCode)
router.post('/login', validateRequest(loginSchema), login)
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword)
router.post('/reset-password', validateRequest(resetPasswordSchema), resetPassword)
router.post('/google', validateRequest(googleAuthSchema), googleAuth)
router.get('/me', authenticate, getCurrentUser)
router.post(
  '/account/deactivate',
  authenticate,
  validateRequest(accountPasswordConfirmationSchema),
  deactivateAccount
)
router.post(
  '/account/delete',
  authenticate,
  validateRequest(accountPasswordConfirmationSchema),
  deleteAccount
)

export default router
