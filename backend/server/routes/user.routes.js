import { Router } from 'express'
import {
  changeUserRole,
  createUserAccount,
  getUsers,
  removeUser,
} from '../controllers/user.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorizeRoles } from '../middleware/role.middleware.js'
import { validateRequest } from '../middleware/validateRequest.middleware.js'
import {
  createUserSchema,
  updateUserRoleSchema,
  userIdParamSchema,
} from '../validators/user.validation.js'
import { ROLES } from '../constants/roles.js'

const router = Router()

router.use(authenticate, authorizeRoles(ROLES.ADMIN))

router.route('/').get(getUsers).post(validateRequest(createUserSchema), createUserAccount)
router.patch('/:id/role', validateRequest(updateUserRoleSchema), changeUserRole)
router.delete('/:id', validateRequest(userIdParamSchema), removeUser)

export default router
