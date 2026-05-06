import { z } from 'zod'

const publicSignupRoleSchema = z.enum(['landlord', 'tenant'])
const passwordStrengthSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long.')
  .max(100, 'Password must be 100 characters or fewer.')
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d).+$/,
    'Password must include at least one letter and one number.'
  )

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function addRequiredFieldIssue(context, field, message) {
  context.addIssue({
    code: z.ZodIssueCode.custom,
    path: [field],
    message,
  })
}

function addValidationIssues(context, issues) {
  for (const issue of issues) {
    addRequiredFieldIssue(context, issue.field, issue.message)
  }
}

export function validateLoginInput(data) {
  const email = normalizeString(data.email)
  const password = normalizeString(data.password)

  if (!email && !password) {
    return [{ field: 'form', message: 'Please fill in all required fields' }]
  }

  if (!email) {
    return [{ field: 'email', message: 'Please enter your email' }]
  }

  if (!password) {
    return [{ field: 'password', message: 'Please enter your password' }]
  }

  return []
}

export function validateSignupInput(data) {
  const name = normalizeString(data.name)
  const email = normalizeString(data.email)
  const password = normalizeString(data.password)
  const confirmPassword = normalizeString(data.confirmPassword)
  const issues = []

  if (!name || !email || !password || !confirmPassword) {
    return [{ field: 'form', message: 'Please fill in all required fields' }]
  }

  if (name.length < 2) {
    issues.push({
      field: 'name',
      message: 'Name must be at least 2 characters long.',
    })
  }

  if (name.length > 80) {
    issues.push({
      field: 'name',
      message: 'Name must be 80 characters or fewer.',
    })
  }

  if (!z.email().safeParse(email).success) {
    issues.push({
      field: 'email',
      message: 'Please provide a valid email address.',
    })
  }

  const passwordResult = passwordStrengthSchema.safeParse(password)
  if (!passwordResult.success) {
    issues.push({
      field: 'password',
      message: passwordResult.error.issues[0].message,
    })
  }

  if (confirmPassword !== password) {
    issues.push({
      field: 'confirmPassword',
      message: 'Passwords do not match.',
    })
  }

  return issues
}

export const loginSchema = {
  body: z
    .object({
      email: z.string().optional(),
      password: z.string().optional(),
    })
    .strict()
    .superRefine((data, context) => {
      addValidationIssues(context, validateLoginInput(data))
    }),
}

export const signupSchema = {
  body: z
    .object({
      name: z.string().optional(),
      email: z.string().optional(),
      password: z.string().optional(),
      confirmPassword: z.string().optional(),
      role: publicSignupRoleSchema,
    })
    .strict()
    .superRefine((data, context) => {
      addValidationIssues(context, validateSignupInput(data))
    }),
}

export const forgotPasswordSchema = {
  body: z
    .object({
      email: z.string().optional(),
    })
    .strict()
    .superRefine((data, context) => {
      const email = normalizeString(data.email)

      if (!email) {
        addRequiredFieldIssue(context, 'email', 'Please enter your email')
        return
      }

      if (!z.email().safeParse(email).success) {
        addRequiredFieldIssue(context, 'email', 'Please provide a valid email address.')
      }
    }),
}

export const resetPasswordSchema = {
  body: z
    .object({
      token: z.string().optional(),
      password: z.string().optional(),
      confirmPassword: z.string().optional(),
    })
    .strict()
    .superRefine((data, context) => {
      const token = normalizeString(data.token)
      const password = normalizeString(data.password)
      const confirmPassword = normalizeString(data.confirmPassword)

      if (!token) {
        addRequiredFieldIssue(context, 'token', 'Password reset token is required.')
        return
      }

      if (!password || !confirmPassword) {
        addRequiredFieldIssue(context, 'form', 'Please fill in all required fields')
        return
      }

      const passwordResult = passwordStrengthSchema.safeParse(password)
      if (!passwordResult.success) {
        addRequiredFieldIssue(context, 'password', passwordResult.error.issues[0].message)
      }

      if (confirmPassword !== password) {
        addRequiredFieldIssue(context, 'confirmPassword', 'Passwords do not match.')
      }
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
