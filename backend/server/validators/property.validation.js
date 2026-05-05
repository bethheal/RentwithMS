import { z } from 'zod'

function emptyStringToUndefined(value) {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined
  }

  return value
}

const optionalOwnerIdSchema = z.preprocess(
  emptyStringToUndefined,
  z.string().uuid('ownerId must be a valid UUID.').optional()
)

const basePropertyFields = {
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters long.')
    .max(120, 'Title must be 120 characters or fewer.'),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters long.')
    .max(5000, 'Description must be 5000 characters or fewer.'),
  price: z.coerce.number().positive('Price must be greater than zero.'),
  location: z
    .string()
    .trim()
    .min(3, 'Location must be at least 3 characters long.')
    .max(255, 'Location must be 255 characters or fewer.'),
  ownerId: optionalOwnerIdSchema,
}

export const createPropertySchema = {
  body: z.object(basePropertyFields).strict(),
}

export const propertyIdParamSchema = {
  params: z
    .object({
      id: z.string().uuid('Property id must be a valid UUID.'),
    })
    .strict(),
}

export const propertyOwnerParamSchema = {
  params: z
    .object({
      propertyId: z.string().uuid('Property id must be a valid UUID.'),
    })
    .strict(),
}

export const propertyImageParamSchema = {
  params: z
    .object({
      propertyId: z.string().uuid('Property id must be a valid UUID.'),
      imageId: z.string().uuid('Image id must be a valid UUID.'),
    })
    .strict(),
}

export const updatePropertySchema = {
  ...propertyIdParamSchema,
  body: z
    .object(basePropertyFields)
    .partial()
    .strict()
    .refine(
      (value) => Object.values(value).some((entry) => entry !== undefined),
      'Provide at least one property field to update.'
    ),
}
