import { Router } from 'express'
import {
  createPropertyListing,
  getMyProperties,
  getProperties,
  getProperty,
  removePropertyImage,
  removePropertyListing,
  updatePropertyListing,
} from '../controllers/property.controller.js'
import { ROLES } from '../constants/roles.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorizeRoles } from '../middleware/role.middleware.js'
import { validateRequest } from '../middleware/validateRequest.middleware.js'
import {
  createPropertySchema,
  propertyIdParamSchema,
  propertyImageParamSchema,
  updatePropertySchema,
} from '../validators/property.validation.js'

const router = Router()

router.get('/', getProperties)
router.get(
  '/mine',
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.LANDLORD),
  getMyProperties
)
router.post(
  '/',
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.LANDLORD),
  validateRequest(createPropertySchema),
  createPropertyListing
)
router.get('/:id', validateRequest(propertyIdParamSchema), getProperty)
router.put(
  '/:id',
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.LANDLORD),
  validateRequest(updatePropertySchema),
  updatePropertyListing
)
router.delete(
  '/:id',
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.LANDLORD),
  validateRequest(propertyIdParamSchema),
  removePropertyListing
)
router.delete(
  '/:propertyId/images/:imageId',
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.LANDLORD),
  validateRequest(propertyImageParamSchema),
  removePropertyImage
)

export default router
