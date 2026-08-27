import { Router } from 'express'
import {
  getNotificationRecords,
  readNotificationRecord,
} from '../controllers/workflow.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { validateRequest } from '../middleware/validateRequest.middleware.js'
import { idParamSchema } from '../validators/workflow.validation.js'

const router = Router()

router.use(authenticate)

router.get('/', getNotificationRecords)
router.patch('/:id/read', validateRequest(idParamSchema), readNotificationRecord)

export default router
