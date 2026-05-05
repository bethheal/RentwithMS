import { Router } from 'express'
import {
  createBlogPost,
  getBlog,
  getBlogs,
  removeBlogPost,
  updateBlogPost,
} from '../controllers/blog.controller.js'
import { ROLES } from '../constants/roles.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorizeRoles } from '../middleware/role.middleware.js'
import { upload } from '../middleware/upload.middleware.js'
import { validateRequest } from '../middleware/validateRequest.middleware.js'
import {
  blogIdParamSchema,
  createBlogSchema,
  updateBlogSchema,
} from '../validators/blog.validation.js'

const router = Router()

router.get('/', getBlogs)
router.get('/:id', validateRequest(blogIdParamSchema), getBlog)
router.post(
  '/',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  upload.single('image'),
  validateRequest(createBlogSchema),
  createBlogPost
)
router.patch(
  '/:id',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  upload.single('image'),
  validateRequest(updateBlogSchema),
  updateBlogPost
)
router.delete(
  '/:id',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  validateRequest(blogIdParamSchema),
  removeBlogPost
)

export default router
