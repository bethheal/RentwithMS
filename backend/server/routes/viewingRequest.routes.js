import { Router } from 'express'
import {
  createViewingRequestRecord,
  getViewingRequestRecord,
  getViewingRequestRecords,
  respondToViewingRequestRecord,
} from '../controllers/workflow.controller.js'
import { ROLES } from '../constants/roles.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorizeRoles } from '../middleware/role.middleware.js'
import { validateRequest } from '../middleware/validateRequest.middleware.js'
import {
  createViewingRequestSchema,
  idParamSchema,
  respondToViewingRequestSchema,
} from '../validators/workflow.validation.js'

const router = Router()

router.use(authenticate)

router.get('/', getViewingRequestRecords)
router.post(
  '/',
  authorizeRoles(ROLES.TENANT),
  validateRequest(createViewingRequestSchema),
  createViewingRequestRecord
)
router.get('/:id', validateRequest(idParamSchema), getViewingRequestRecord)
router.patch(
  '/:id/respond',
  authorizeRoles(ROLES.ADMIN, ROLES.LANDLORD),
  validateRequest(respondToViewingRequestSchema),
  respondToViewingRequestRecord
)

export default router
