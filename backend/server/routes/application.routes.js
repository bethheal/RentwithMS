import { Router } from 'express'
import {
  createApplicationRecord,
  getApplicationRecord,
  getApplicationRecords,
  updateApplicationRecordStatus,
} from '../controllers/workflow.controller.js'
import { ROLES } from '../constants/roles.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorizeRoles } from '../middleware/role.middleware.js'
import { validateRequest } from '../middleware/validateRequest.middleware.js'
import {
  createApplicationSchema,
  idParamSchema,
  updateApplicationStatusSchema,
} from '../validators/workflow.validation.js'

const router = Router()

router.use(authenticate)

router.get('/', getApplicationRecords)
router.post(
  '/',
  authorizeRoles(ROLES.TENANT),
  validateRequest(createApplicationSchema),
  createApplicationRecord
)
router.get('/:id', validateRequest(idParamSchema), getApplicationRecord)
router.patch(
  '/:id/status',
  authorizeRoles(ROLES.ADMIN, ROLES.LANDLORD),
  validateRequest(updateApplicationStatusSchema),
  updateApplicationRecordStatus
)

export default router
