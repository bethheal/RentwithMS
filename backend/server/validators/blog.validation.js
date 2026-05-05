import { z } from 'zod'

function emptyStringToUndefined(value) {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined
  }

  return value
}

function booleanFromForm(value) {
  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  return value
}

const optionalImageUrlSchema = z.preprocess(
  emptyStringToUndefined,
  z.string().url('imageUrl must be a valid URL.').optional()
)

const optionalImagePublicIdSchema = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().min(1, 'imagePublicId cannot be empty.').optional()
)

const optionalRemoveImageSchema = z.preprocess(
  booleanFromForm,
  z.boolean().optional()
)

const blogBodySchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, 'Title must be at least 3 characters long.')
      .max(160, 'Title must be 160 characters or fewer.'),
    content: z
      .string()
      .trim()
      .min(20, 'Content must be at least 20 characters long.')
      .max(20000, 'Content must be 20000 characters or fewer.'),
    imageUrl: optionalImageUrlSchema,
    imagePublicId: optionalImagePublicIdSchema,
  })
  .strict()
  .refine(
    (value) =>
      (value.imageUrl && value.imagePublicId) ||
      (!value.imageUrl && !value.imagePublicId),
    {
      message: 'imageUrl and imagePublicId must be provided together.',
      path: ['imageUrl'],
    }
  )

export const createBlogSchema = {
  body: blogBodySchema,
}

export const blogIdParamSchema = {
  params: z
    .object({
      id: z.string().uuid('Blog id must be a valid UUID.'),
    })
    .strict(),
}

export const updateBlogSchema = {
  ...blogIdParamSchema,
  body: z
    .object({
      title: blogBodySchema.shape.title.optional(),
      content: blogBodySchema.shape.content.optional(),
      imageUrl: optionalImageUrlSchema,
      imagePublicId: optionalImagePublicIdSchema,
      removeImage: optionalRemoveImageSchema,
    })
    .strict()
    .refine(
      (value) => Object.values(value).some((entry) => entry !== undefined),
      'Provide at least one blog field to update.'
    )
    .refine(
      (value) =>
        (!value.imageUrl && !value.imagePublicId) ||
        (value.imageUrl && value.imagePublicId),
      {
        message: 'imageUrl and imagePublicId must be provided together.',
        path: ['imageUrl'],
      }
    ),
}
