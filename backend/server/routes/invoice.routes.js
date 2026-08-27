import { Router } from 'express'
import {
  createInvoicePaymentRecord,
  createInvoiceRecord,
  getInvoiceRecord,
  getInvoiceRecords,
  updateInvoiceRecord,
} from '../controllers/workflow.controller.js'
import { ROLES } from '../constants/roles.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorizeRoles } from '../middleware/role.middleware.js'
import { validateRequest } from '../middleware/validateRequest.middleware.js'
import {
  createInvoiceSchema,
  createPaymentSchema,
  idParamSchema,
  updateInvoiceSchema,
} from '../validators/workflow.validation.js'

const router = Router()

router.use(authenticate)

router.get('/', getInvoiceRecords)
router.post(
  '/',
  authorizeRoles(ROLES.ADMIN, ROLES.LANDLORD),
  validateRequest(createInvoiceSchema),
  createInvoiceRecord
)
router.get('/:id', validateRequest(idParamSchema), getInvoiceRecord)
router.patch(
  '/:id',
  authorizeRoles(ROLES.ADMIN, ROLES.LANDLORD),
  validateRequest(updateInvoiceSchema),
  updateInvoiceRecord
)
router.post(
  '/:id/payments',
  authorizeRoles(ROLES.ADMIN, ROLES.TENANT),
  validateRequest(createPaymentSchema),
  createInvoicePaymentRecord
)

export default router
