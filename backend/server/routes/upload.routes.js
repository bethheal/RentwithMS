import { Router } from 'express'
import { uploadBlogImage, uploadPropertyImages } from '../controllers/upload.controller.js'
import { ROLES } from '../constants/roles.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorizeRoles } from '../middleware/role.middleware.js'
import { upload } from '../middleware/upload.middleware.js'
import { validateRequest } from '../middleware/validateRequest.middleware.js'
import { propertyOwnerParamSchema } from '../validators/property.validation.js'

const router = Router()

router.post(
  '/properties/:propertyId/images',
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.LANDLORD),
  validateRequest(propertyOwnerParamSchema),
  upload.array('images', 10),
  uploadPropertyImages
)

router.post(
  '/blogs/image',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  upload.single('image'),
  uploadBlogImage
)

export default router
