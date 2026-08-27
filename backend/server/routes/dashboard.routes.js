import { Router } from 'express'
import { getDashboardSummaryRecord } from '../controllers/workflow.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authenticate)

router.get('/summary', getDashboardSummaryRecord)

export default router
