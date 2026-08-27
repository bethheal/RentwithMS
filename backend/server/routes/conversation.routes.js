import { Router } from 'express'
import {
  createConversationRecord,
  getConversationRecord,
  getConversationRecords,
  readConversationMessage,
  sendConversationMessage,
} from '../controllers/workflow.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { validateRequest } from '../middleware/validateRequest.middleware.js'
import {
  conversationMessageParamSchema,
  createConversationSchema,
  idParamSchema,
  sendMessageSchema,
} from '../validators/workflow.validation.js'

const router = Router()

router.use(authenticate)

router.get('/', getConversationRecords)
router.post('/', validateRequest(createConversationSchema), createConversationRecord)
router.get('/:id', validateRequest(idParamSchema), getConversationRecord)
router.post('/:id/messages', validateRequest(sendMessageSchema), sendConversationMessage)
router.patch(
  '/:id/messages/:messageId/read',
  validateRequest(conversationMessageParamSchema),
  readConversationMessage
)

export default router
