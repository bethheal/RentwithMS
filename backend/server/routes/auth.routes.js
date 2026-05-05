import { Router } from 'express'
import { getCurrentUser, googleAuth, login, signup } from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { validateRequest } from '../middleware/validateRequest.middleware.js'
import { googleAuthSchema, loginSchema, signupSchema } from '../validators/auth.validation.js'

const router = Router()

router.post('/signup', validateRequest(signupSchema), signup)
router.post('/login', validateRequest(loginSchema), login)
router.post('/google', validateRequest(googleAuthSchema), googleAuth)
router.get('/me', authenticate, getCurrentUser)

export default router
