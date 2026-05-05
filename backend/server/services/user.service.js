import prisma from '../config/prisma.js'
import { ROLES } from '../constants/roles.js'
import ApiError from '../utils/apiError.js'
import { hashPassword } from '../utils/password.js'

const userCountInclude = {
  _count: {
    select: {
      properties: true,
      blogPosts: true,
    },
  },
}

export function listUsers() {
  return prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: userCountInclude,
  })
}

export async function createUser(userData) {
  const email = userData.email.trim().toLowerCase()

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  if (existingUser) {
    throw new ApiError(409, 'A user with this email address already exists.')
  }

  const passwordHash = await hashPassword(userData.password)

  return prisma.user.create({
    data: {
      name: userData.name.trim(),
      email,
      passwordHash,
      role: userData.role,
    },
  })
}

export async function deleteUser(userId, currentUserId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: userCountInclude,
  })

  if (!user) {
    throw new ApiError(404, 'User not found.')
  }

  if (user.id === currentUserId) {
    throw new ApiError(400, 'Admins cannot delete their own account.')
  }

  if (user.role === ROLES.ADMIN) {
    const adminCount = await prisma.user.count({
      where: { role: ROLES.ADMIN },
    })

    if (adminCount <= 1) {
      throw new ApiError(400, 'At least one admin account must remain in the system.')
    }
  }

  if (user._count.properties > 0) {
    throw new ApiError(
      400,
      "Delete or reassign this user's properties before deleting the account."
    )
  }

  if (user._count.blogPosts > 0) {
    throw new ApiError(
      400,
      "Delete this user's blog posts before deleting the account."
    )
  }

  await prisma.user.delete({
    where: { id: userId },
  })

  return user
}

export async function updateUserRole(userId, nextRole, currentUserId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: userCountInclude,
  })

  if (!user) {
    throw new ApiError(404, 'User not found.')
  }

  if (user.role === nextRole) {
    return user
  }

  if (
    user.id === currentUserId &&
    user.role === ROLES.ADMIN &&
    nextRole !== ROLES.ADMIN
  ) {
    const adminCount = await prisma.user.count({
      where: { role: ROLES.ADMIN },
    })

    if (adminCount <= 1) {
      throw new ApiError(400, 'At least one admin account must remain in the system.')
    }
  }

  if (user.role === ROLES.LANDLORD && nextRole !== ROLES.LANDLORD && user._count.properties > 0) {
    throw new ApiError(
      400,
      "Reassign or delete this user's properties before changing their role."
    )
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      role: nextRole,
    },
    include: userCountInclude,
  })
}
