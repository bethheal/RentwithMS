import { z } from 'zod'

const roleSchema = z.enum(['admin', 'landlord', 'tenant'])

export const createUserSchema = {
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, 'Name must be at least 2 characters long.')
        .max(80, 'Name must be 80 characters or fewer.'),
      email: z.string().trim().email('Please provide a valid email address.'),
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters long.')
        .max(100, 'Password must be 100 characters or fewer.'),
      role: roleSchema,
    })
    .strict(),
}

export const userIdParamSchema = {
  params: z
    .object({
      id: z.string().uuid('User id must be a valid UUID.'),
    })
    .strict(),
}

export const updateUserRoleSchema = {
  ...userIdParamSchema,
  body: z
    .object({
      role: roleSchema,
    })
    .strict(),
}
