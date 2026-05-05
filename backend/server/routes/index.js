import { Router } from 'express'
import { checkDatabaseConnection } from '../config/prisma.js'
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

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/properties', propertyRoutes)
router.use('/uploads', uploadRoutes)
router.use('/blogs', blogRoutes)

export default router
