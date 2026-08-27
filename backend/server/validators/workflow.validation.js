import { z } from 'zod'

const uuid = (label) => z.string().uuid(`${label} must be a valid UUID.`)
const optionalText = z.string().trim().max(5000).optional()
const optionalJson = z.unknown().optional()

export const idParamSchema = {
  params: z
    .object({
      id: uuid('id'),
    })
    .strict(),
}

export const conversationMessageParamSchema = {
  params: z
    .object({
      id: uuid('Conversation id'),
      messageId: uuid('Message id'),
    })
    .strict(),
}

export const createApplicationSchema = {
  body: z
    .object({
      propertyId: uuid('Property id'),
      moveInDate: z.coerce.date().optional(),
      message: optionalText,
      personalDetails: optionalJson,
      employment: optionalJson,
      rentalHistory: optionalText,
      documents: optionalJson,
      details: optionalJson,
    })
    .strict(),
}

export const updateApplicationStatusSchema = {
  ...idParamSchema,
  body: z
    .object({
      status: z.enum(['pending', 'approved', 'rejected', 'withdrawn']),
    })
    .strict(),
}

export const createViewingRequestSchema = {
  body: z
    .object({
      propertyId: uuid('Property id'),
      preferredDateTime: z.coerce.date(),
      notes: optionalText,
      contactPhone: z.string().trim().max(40).optional(),
      contactEmail: z.string().trim().email().max(255).optional(),
    })
    .strict(),
}

export const respondToViewingRequestSchema = {
  ...idParamSchema,
  body: z
    .object({
      status: z.enum([
        'pending',
        'confirmed',
        'declined',
        'cancelled',
        'rescheduled',
        'completed',
      ]),
      response: optionalText,
      scheduledDateTime: z.coerce.date().optional(),
    })
    .strict(),
}

export const createConversationSchema = {
  body: z
    .object({
      tenantId: uuid('Tenant id').optional(),
      landlordId: uuid('Landlord id').optional(),
      propertyId: uuid('Property id').optional(),
      tenancyId: uuid('Tenancy id').optional(),
      topic: z.string().trim().max(160).optional(),
      initialMessage: z.string().trim().min(1).max(5000).optional(),
    })
    .strict()
    .refine(
      (value) => value.propertyId || value.tenancyId || value.landlordId,
      'Provide a propertyId, tenancyId, or landlordId.'
    ),
}

export const sendMessageSchema = {
  ...idParamSchema,
  body: z
    .object({
      body: z.string().trim().min(1).max(5000),
    })
    .strict(),
}

export const createInvoiceSchema = {
  body: z
    .object({
      tenantId: uuid('Tenant id'),
      propertyId: uuid('Property id').optional(),
      tenancyId: uuid('Tenancy id').optional(),
      amount: z.coerce.number().positive('Amount must be greater than zero.'),
      description: z.string().trim().min(1).max(5000),
      dueDate: z.coerce.date(),
      status: z.enum(['draft', 'issued', 'due', 'paid', 'overdue', 'cancelled']).optional(),
      paymentInformation: optionalJson,
    })
    .strict()
    .refine(
      (value) => value.propertyId || value.tenancyId,
      'Provide a propertyId or tenancyId.'
    ),
}

export const updateInvoiceSchema = {
  ...idParamSchema,
  body: z
    .object({
      status: z.enum(['draft', 'issued', 'due', 'paid', 'overdue', 'cancelled']).optional(),
      amount: z.coerce.number().positive().optional(),
      description: z.string().trim().min(1).max(5000).optional(),
      dueDate: z.coerce.date().optional(),
      paymentInformation: optionalJson,
    })
    .strict()
    .refine(
      (value) => Object.values(value).some((entry) => entry !== undefined),
      'Provide at least one invoice field to update.'
    ),
}

export const createPaymentSchema = {
  ...idParamSchema,
  body: z
    .object({
      amount: z.coerce.number().positive('Amount must be greater than zero.'),
      paymentMethod: z.string().trim().max(120).optional(),
      transactionId: z.string().trim().max(160).optional(),
      status: z.enum(['pending', 'successful', 'failed', 'refunded']).optional(),
      paidAt: z.coerce.date().optional(),
    })
    .strict(),
}
