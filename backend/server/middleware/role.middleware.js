import ApiError from '../utils/apiError.js'

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      next(new ApiError(401, 'Authentication is required to access this route.'))
      return
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new ApiError(403, 'You do not have permission to perform this action.'))
      return
    }

    next()
  }
}
