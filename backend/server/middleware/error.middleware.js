import multer from 'multer'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'
import ApiError from '../utils/apiError.js'

function formatZodIssues(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }))
}

export function errorHandler(error, req, res, next) {
  void next

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.details ?? undefined,
    })
    return
  }

  if (error instanceof ZodError) {
    const issues = formatZodIssues(error)

    res.status(400).json({
      success: false,
      message: issues[0]?.message ?? 'Validation failed.',
      errors: issues,
    })
    return
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const duplicateField = error.meta?.target?.[0] ?? 'field'

      res.status(409).json({
        success: false,
        message: `A record with this ${duplicateField} already exists.`,
      })
      return
    }

    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'The requested record could not be found.',
      })
      return
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      success: false,
      message: 'The request could not be processed with the provided data.',
    })
    return
  }

  if (error instanceof multer.MulterError) {
    const message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'Each uploaded image must be 5MB or smaller.'
        : error.message

    res.status(400).json({
      success: false,
      message,
    })
    return
  }

  if (error.message === 'Not allowed by CORS') {
    res.status(403).json({
      success: false,
      message: 'This origin is not allowed to access the API.',
    })
    return
  }

  console.error(error)

  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server.',
  })
}
