import prisma from '../config/prisma.js'
import ApiError from '../utils/apiError.js'
import asyncHandler from '../utils/asyncHandler.js'
import { verifyToken } from '../utils/jwt.js'

export const authenticate = asyncHandler(async (req, res, next) => {
  const authorizationHeader = req.headers.authorization ?? ''
  const [scheme, token] = authorizationHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'Authentication token is missing or invalid.')
  }

  let decodedToken

  try {
    decodedToken = verifyToken(token)
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Authentication token has expired.')
    }

    throw new ApiError(401, 'Authentication token is invalid.')
  }

  const user = await prisma.user.findUnique({
    where: { id: decodedToken.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!user) {
    throw new ApiError(401, 'The user linked to this token no longer exists.')
  }

  req.user = user
  next()
})
