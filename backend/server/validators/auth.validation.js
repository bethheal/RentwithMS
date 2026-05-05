import { z } from 'zod'

const publicSignupRoleSchema = z.enum(['landlord', 'tenant'])

export const loginSchema = {
  body: z
    .object({
      email: z.string().trim().email('Please provide a valid email address.'),
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters long.')
        .max(100, 'Password must be 100 characters or fewer.'),
    })
    .strict(),
}

export const signupSchema = {
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
      confirmPassword: z
        .string()
        .min(8, 'Confirm password must be at least 8 characters long.')
        .max(100, 'Confirm password must be 100 characters or fewer.'),
      role: publicSignupRoleSchema,
    })
    .strict()
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match.',
      path: ['confirmPassword'],
    }),
}

export const googleAuthSchema = {
  body: z
    .object({
      idToken: z.string().trim().min(1, 'Google id token is required.'),
      role: publicSignupRoleSchema.optional(),
    })
    .strict(),
}
