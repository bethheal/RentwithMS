import { Router } from 'express'
import { checkDatabaseConnection } from '../config/prisma.js'
import { sendTestEmail } from '../services/mailService.js'
import authRoutes from './auth.routes.js'
import blogRoutes from './blog.routes.js'
import propertyRoutes from './property.routes.js'
import uploadRoutes from './upload.routes.js'
import userRoutes from './user.routes.js'

const router = Router()

router.get('/health', async (req, res) => {
  try {
    await checkDatabaseConnection()

    res.status(200).json({
      success: true,
      message: 'RMS API and database are running.',
      data: {
        server: 'connected',
        database: 'connected',
      },
    })
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'RMS API is running, but the database is unavailable.',
      data: {
        server: 'connected',
        database: 'disconnected',
      },
      errors: [error.message],
    })
  }
})

router.get('/test-email', async (req, res) => {
  const to = String(req.query.to ?? '').trim()

  if (!to) {
    res.status(400).json({
      success: false,
      message: 'Query parameter "to" is required.',
    })
    return
  }

  try {
    const info = await sendTestEmail(to)

    res.status(200).json({
      success: true,
      message: 'Test email sent.',
      data: {
        to,
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
      },
    })
  } catch (error) {
    console.error('[Test Email] Failed:', error.message)

    res.status(500).json({
      success: false,
      message: 'Test email failed.',
      error: error.message,
    })
  }
})

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/properties', propertyRoutes)
router.use('/uploads', uploadRoutes)
router.use('/blogs', blogRoutes)

export default router
