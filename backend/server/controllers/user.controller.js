import asyncHandler from '../utils/asyncHandler.js'
import { serializeUser } from '../utils/serializers.js'
import {
  createUser,
  deleteUser,
  listUsers,
  updateUserRole,
} from '../services/user.service.js'

export const getUsers = asyncHandler(async (req, res) => {
  const users = await listUsers()

  res.status(200).json({
    success: true,
    data: users.map(serializeUser),
  })
})

export const createUserAccount = asyncHandler(async (req, res) => {
  const user = await createUser(req.body)

  res.status(201).json({
    success: true,
    message: 'User account created successfully.',
    data: serializeUser(user),
  })
})

export const changeUserRole = asyncHandler(async (req, res) => {
  const user = await updateUserRole(req.params.id, req.body.role, req.user.id)

  res.status(200).json({
    success: true,
    message: 'User role updated successfully.',
    data: serializeUser(user),
  })
})

export const removeUser = asyncHandler(async (req, res) => {
  const deletedUser = await deleteUser(req.params.id, req.user.id)

  res.status(200).json({
    success: true,
    message: 'User deleted successfully.',
    data: serializeUser(deletedUser),
  })
})
