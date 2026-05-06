import { Router } from 'express'
import {
  forgotPassword,
  getCurrentUser,
  googleAuth,
  login,
  resetPassword,
  signup,
} from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { validateRequest } from '../middleware/validateRequest.middleware.js'
import {
  forgotPasswordSchema,
  googleAuthSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from '../validators/auth.validation.js'

const router = Router()

router.post('/signup', validateRequest(signupSchema), signup)
router.post('/login', validateRequest(loginSchema), login)
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword)
router.post('/reset-password', validateRequest(resetPasswordSchema), resetPassword)
router.post('/google', validateRequest(googleAuthSchema), googleAuth)
router.get('/me', authenticate, getCurrentUser)

export default router
