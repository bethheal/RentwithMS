import prisma from '../config/prisma.js'
import { ROLES } from '../constants/roles.js'
import ApiError from '../utils/apiError.js'

const userSelect = {
  id: true,
  name: true,
  email: true,
  phoneNumber: true,
  role: true,
  emailVerified: true,
  phoneVerified: true,
  accountStatus: true,
  deactivatedAt: true,
  scheduledDeletionDate: true,
  createdAt: true,
  updatedAt: true,
}

const propertyInclude = {
  owner: { select: userSelect },
  images: { orderBy: { createdAt: 'asc' } },
}

const applicationInclude = {
  property: { include: propertyInclude },
  tenant: { select: userSelect },
  landlord: { select: userSelect },
}

const viewingRequestInclude = applicationInclude

const conversationInclude = {
  tenant: { select: userSelect },
  landlord: { select: userSelect },
  property: { include: propertyInclude },
  tenancy: {
    include: {
      property: { include: propertyInclude },
      tenant: { select: userSelect },
      landlord: { select: userSelect },
    },
  },
  messages: {
    include: {
      sender: { select: userSelect },
    },
    orderBy: {
      createdAt: 'asc',
    },
  },
}

const invoiceInclude = {
  landlord: { select: userSelect },
  tenant: { select: userSelect },
  property: { include: propertyInclude },
  tenancy: {
    include: {
      property: { include: propertyInclude },
      tenant: { select: userSelect },
      landlord: { select: userSelect },
    },
  },
  payments: {
    include: {
      tenant: { select: userSelect },
    },
    orderBy: {
      createdAt: 'desc',
    },
  },
}

const notificationInclude = {
  actor: { select: userSelect },
}

function isAdmin(user) {
  return user.role === ROLES.ADMIN
}

function isLandlord(user) {
  return user.role === ROLES.LANDLORD
}

function isTenant(user) {
  return user.role === ROLES.TENANT
}

async function createNotification({
  actorId,
  body,
  entityId,
  entityType,
  recipientId,
  title,
  type,
  data,
}) {
  if (!recipientId || recipientId === actorId) {
    return null
  }

  return prisma.notification.create({
    data: {
      actorId,
      body,
      entityId,
      entityType,
      recipientId,
      title,
      type,
      data,
    },
  })
}

async function getPublishedPropertyOrThrow(propertyId) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: propertyInclude,
  })

  if (!property || property.workflowStatus !== 'published') {
    throw new ApiError(404, 'Published property not found.')
  }

  return property
}

async function getTenantOrThrow(tenantId) {
  if (!tenantId) {
    throw new ApiError(400, 'A tenantId is required for this action.')
  }

  const tenant = await prisma.user.findUnique({
    where: { id: tenantId },
    select: userSelect,
  })

  if (!tenant || tenant.role !== ROLES.TENANT) {
    throw new ApiError(400, 'The selected tenant was not found.')
  }

  return tenant
}

async function getLandlordOrThrow(landlordId) {
  if (!landlordId) {
    throw new ApiError(400, 'A landlordId is required for this action.')
  }

  const landlord = await prisma.user.findUnique({
    where: { id: landlordId },
    select: userSelect,
  })

  if (!landlord || landlord.role !== ROLES.LANDLORD) {
    throw new ApiError(400, 'The selected landlord was not found.')
  }

  return landlord
}

function participantWhere(currentUser) {
  if (isAdmin(currentUser)) {
    return {}
  }

  if (isLandlord(currentUser)) {
    return { landlordId: currentUser.id }
  }

  return { tenantId: currentUser.id }
}

function ensureApplicationAccess(application, currentUser) {
  if (
    isAdmin(currentUser) ||
    application.landlordId === currentUser.id ||
    application.tenantId === currentUser.id
  ) {
    return
  }

  throw new ApiError(403, 'You do not have access to this application.')
}

function ensureViewingAccess(request, currentUser) {
  if (
    isAdmin(currentUser) ||
    request.landlordId === currentUser.id ||
    request.tenantId === currentUser.id
  ) {
    return
  }

  throw new ApiError(403, 'You do not have access to this viewing request.')
}

function ensureConversationAccess(conversation, currentUser) {
  if (
    isAdmin(currentUser) ||
    conversation.landlordId === currentUser.id ||
    conversation.tenantId === currentUser.id
  ) {
    return
  }

  throw new ApiError(403, 'You do not have access to this conversation.')
}

function ensureInvoiceAccess(invoice, currentUser) {
  if (
    isAdmin(currentUser) ||
    invoice.landlordId === currentUser.id ||
    invoice.tenantId === currentUser.id
  ) {
    return
  }

  throw new ApiError(403, 'You do not have access to this invoice.')
}

export async function createApplication(applicationData, currentUser) {
  if (!isTenant(currentUser)) {
    throw new ApiError(403, 'Only tenants can apply for properties.')
  }

  const property = await getPublishedPropertyOrThrow(applicationData.propertyId)

  const application = await prisma.application.create({
    data: {
      propertyId: property.id,
      tenantId: currentUser.id,
      landlordId: property.ownerId,
      moveInDate: applicationData.moveInDate,
      message: applicationData.message,
      personalDetails: applicationData.personalDetails,
      employment: applicationData.employment,
      rentalHistory: applicationData.rentalHistory,
      documents: applicationData.documents,
      details: applicationData.details,
    },
    include: applicationInclude,
  })

  await createNotification({
    actorId: currentUser.id,
    recipientId: property.ownerId,
    type: 'application_created',
    title: 'New tenant application',
    body: `${currentUser.name} applied for ${property.title}.`,
    entityType: 'application',
    entityId: application.id,
    data: { propertyId: property.id },
  })

  return application
}

export function listApplications(currentUser) {
  return prisma.application.findMany({
    where: participantWhere(currentUser),
    include: applicationInclude,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getApplication(applicationId, currentUser) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: applicationInclude,
  })

  if (!application) {
    throw new ApiError(404, 'Application not found.')
  }

  ensureApplicationAccess(application, currentUser)
  return application
}

export async function updateApplicationStatus(applicationId, status, currentUser) {
  const application = await getApplication(applicationId, currentUser)

  if (!isAdmin(currentUser) && application.landlordId !== currentUser.id) {
    throw new ApiError(403, 'Only the property landlord can update application status.')
  }

  const updatedApplication = await prisma.application.update({
    where: { id: application.id },
    data: { status },
    include: applicationInclude,
  })

  await createNotification({
    actorId: currentUser.id,
    recipientId: application.tenantId,
    type: 'application_updated',
    title: 'Application status updated',
    body: `Your application for ${application.property.title} is now ${status}.`,
    entityType: 'application',
    entityId: application.id,
    data: { propertyId: application.propertyId, status },
  })

  return updatedApplication
}

export async function createViewingRequest(requestData, currentUser) {
  if (!isTenant(currentUser)) {
    throw new ApiError(403, 'Only tenants can request property viewings.')
  }

  const property = await getPublishedPropertyOrThrow(requestData.propertyId)

  const request = await prisma.viewingRequest.create({
    data: {
      propertyId: property.id,
      tenantId: currentUser.id,
      landlordId: property.ownerId,
      preferredDateTime: requestData.preferredDateTime,
      notes: requestData.notes,
      contactPhone: requestData.contactPhone,
      contactEmail: requestData.contactEmail,
    },
    include: viewingRequestInclude,
  })

  await createNotification({
    actorId: currentUser.id,
    recipientId: property.ownerId,
    type: 'viewing_created',
    title: 'New viewing request',
    body: `${currentUser.name} requested to view ${property.title}.`,
    entityType: 'viewingRequest',
    entityId: request.id,
    data: { propertyId: property.id },
  })

  return request
}

export function listViewingRequests(currentUser) {
  return prisma.viewingRequest.findMany({
    where: participantWhere(currentUser),
    include: viewingRequestInclude,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getViewingRequest(requestId, currentUser) {
  const request = await prisma.viewingRequest.findUnique({
    where: { id: requestId },
    include: viewingRequestInclude,
  })

  if (!request) {
    throw new ApiError(404, 'Viewing request not found.')
  }

  ensureViewingAccess(request, currentUser)
  return request
}

export async function respondToViewingRequest(requestId, requestData, currentUser) {
  const request = await getViewingRequest(requestId, currentUser)

  if (!isAdmin(currentUser) && request.landlordId !== currentUser.id) {
    throw new ApiError(403, 'Only the property landlord can respond to this viewing request.')
  }

  const updatedRequest = await prisma.viewingRequest.update({
    where: { id: request.id },
    data: {
      status: requestData.status,
      response: requestData.response,
      scheduledDateTime: requestData.scheduledDateTime,
    },
    include: viewingRequestInclude,
  })

  await createNotification({
    actorId: currentUser.id,
    recipientId: request.tenantId,
    type: 'viewing_updated',
    title: 'Viewing request updated',
    body: `Your viewing request for ${request.property.title} is now ${requestData.status}.`,
    entityType: 'viewingRequest',
    entityId: request.id,
    data: { propertyId: request.propertyId, status: requestData.status },
  })

  return updatedRequest
}

export async function createConversation(conversationData, currentUser) {
  let tenantId = conversationData.tenantId
  let landlordId = conversationData.landlordId
  let propertyId = conversationData.propertyId
  let tenancyId = conversationData.tenancyId

  if (tenancyId) {
    const tenancy = await prisma.tenancy.findUnique({ where: { id: tenancyId } })

    if (!tenancy) {
      throw new ApiError(404, 'Tenancy not found.')
    }

    if (!isAdmin(currentUser) && ![tenancy.tenantId, tenancy.landlordId].includes(currentUser.id)) {
      throw new ApiError(403, 'You do not have access to this tenancy.')
    }

    tenantId = tenancy.tenantId
    landlordId = tenancy.landlordId
    propertyId = tenancy.propertyId
  }

  if (propertyId) {
    const property = await getPublishedPropertyOrThrow(propertyId)
    landlordId = property.ownerId

    if (isLandlord(currentUser) && property.ownerId !== currentUser.id) {
      throw new ApiError(403, 'You cannot start conversations for another landlord property.')
    }
  }

  if (isTenant(currentUser)) {
    tenantId = currentUser.id
  }

  if (isLandlord(currentUser)) {
    landlordId = currentUser.id
  }

  await getTenantOrThrow(tenantId)
  await getLandlordOrThrow(landlordId)

  if (!isAdmin(currentUser) && ![tenantId, landlordId].includes(currentUser.id)) {
    throw new ApiError(403, 'You cannot create a conversation for other users.')
  }

  const existingConversation = await prisma.conversation.findFirst({
    where: {
      tenantId,
      landlordId,
      propertyId: propertyId ?? null,
      tenancyId: tenancyId ?? null,
    },
    include: conversationInclude,
  })

  const conversation =
    existingConversation ??
    (await prisma.conversation.create({
      data: {
        tenantId,
        landlordId,
        propertyId,
        tenancyId,
        topic: conversationData.topic,
      },
      include: conversationInclude,
    }))

  if (!conversationData.initialMessage) {
    return conversation
  }

  return sendMessage(conversation.id, { body: conversationData.initialMessage }, currentUser)
}

export function listConversations(currentUser) {
  return prisma.conversation.findMany({
    where: participantWhere(currentUser),
    include: conversationInclude,
    orderBy: { updatedAt: 'desc' },
  })
}

export async function getConversation(conversationId, currentUser) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: conversationInclude,
  })

  if (!conversation) {
    throw new ApiError(404, 'Conversation not found.')
  }

  ensureConversationAccess(conversation, currentUser)
  return conversation
}

export async function sendMessage(conversationId, messageData, currentUser) {
  const conversation = await getConversation(conversationId, currentUser)
  const recipientId =
    conversation.tenantId === currentUser.id
      ? conversation.landlordId
      : conversation.tenantId

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: currentUser.id,
      body: messageData.body,
    },
  })

  const updatedConversation = await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
    include: conversationInclude,
  })

  await createNotification({
    actorId: currentUser.id,
    recipientId,
    type: 'message_created',
    title: 'New message',
    body: `${currentUser.name} sent you a message.`,
    entityType: 'conversation',
    entityId: conversation.id,
    data: { propertyId: conversation.propertyId, tenancyId: conversation.tenancyId },
  })

  return updatedConversation
}

export async function markMessageRead(conversationId, messageId, currentUser) {
  const conversation = await getConversation(conversationId, currentUser)
  const message = conversation.messages.find((entry) => entry.id === messageId)

  if (!message) {
    throw new ApiError(404, 'Message not found.')
  }

  if (message.senderId === currentUser.id) {
    return conversation
  }

  await prisma.message.update({
    where: { id: messageId },
    data: { readAt: new Date() },
  })

  return getConversation(conversationId, currentUser)
}

export async function createInvoice(invoiceData, currentUser) {
  if (!isAdmin(currentUser) && !isLandlord(currentUser)) {
    throw new ApiError(403, 'Only landlords can create invoices.')
  }

  await getTenantOrThrow(invoiceData.tenantId)

  let landlordId = currentUser.id
  let propertyId = invoiceData.propertyId
  let tenancyId = invoiceData.tenancyId

  if (tenancyId) {
    const tenancy = await prisma.tenancy.findUnique({ where: { id: tenancyId } })

    if (!tenancy) {
      throw new ApiError(404, 'Tenancy not found.')
    }

    if (tenancy.tenantId !== invoiceData.tenantId) {
      throw new ApiError(400, 'Invoice tenant does not match the tenancy tenant.')
    }

    if (!isAdmin(currentUser) && tenancy.landlordId !== currentUser.id) {
      throw new ApiError(403, 'You cannot invoice tenants for another landlord tenancy.')
    }

    landlordId = tenancy.landlordId
    propertyId = tenancy.propertyId
  } else {
    const property = await prisma.property.findUnique({ where: { id: propertyId } })

    if (!property) {
      throw new ApiError(404, 'Property not found.')
    }

    if (!isAdmin(currentUser) && property.ownerId !== currentUser.id) {
      throw new ApiError(403, 'You cannot invoice tenants for another landlord property.')
    }

    landlordId = property.ownerId
  }

  const invoice = await prisma.invoice.create({
    data: {
      landlordId,
      tenantId: invoiceData.tenantId,
      propertyId,
      tenancyId,
      amount: invoiceData.amount,
      description: invoiceData.description,
      dueDate: invoiceData.dueDate,
      status: invoiceData.status ?? 'issued',
      paymentInformation: invoiceData.paymentInformation,
      history: [
        {
          status: invoiceData.status ?? 'issued',
          at: new Date().toISOString(),
          by: currentUser.id,
        },
      ],
    },
    include: invoiceInclude,
  })

  await createNotification({
    actorId: currentUser.id,
    recipientId: invoiceData.tenantId,
    type: 'invoice_created',
    title: 'New invoice',
    body: `You have a new invoice for ${invoice.property?.title ?? 'your tenancy'}.`,
    entityType: 'invoice',
    entityId: invoice.id,
    data: { propertyId, tenancyId, amount: invoiceData.amount },
  })

  return invoice
}

export function listInvoices(currentUser) {
  return prisma.invoice.findMany({
    where: participantWhere(currentUser),
    include: invoiceInclude,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getInvoice(invoiceId, currentUser) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: invoiceInclude,
  })

  if (!invoice) {
    throw new ApiError(404, 'Invoice not found.')
  }

  ensureInvoiceAccess(invoice, currentUser)
  return invoice
}

export async function updateInvoice(invoiceId, invoiceData, currentUser) {
  const invoice = await getInvoice(invoiceId, currentUser)

  if (!isAdmin(currentUser) && invoice.landlordId !== currentUser.id) {
    throw new ApiError(403, 'Only the issuing landlord can update this invoice.')
  }

  const history = [
    ...(Array.isArray(invoice.history) ? invoice.history : []),
    {
      status: invoiceData.status ?? invoice.status,
      at: new Date().toISOString(),
      by: currentUser.id,
    },
  ]

  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      ...invoiceData,
      history,
    },
    include: invoiceInclude,
  })

  await createNotification({
    actorId: currentUser.id,
    recipientId: invoice.tenantId,
    type: 'invoice_updated',
    title: 'Invoice updated',
    body: `Your invoice for ${invoice.property?.title ?? 'your tenancy'} was updated.`,
    entityType: 'invoice',
    entityId: invoice.id,
    data: { status: updatedInvoice.status },
  })

  return updatedInvoice
}

export async function createPayment(invoiceId, paymentData, currentUser) {
  const invoice = await getInvoice(invoiceId, currentUser)

  if (!isAdmin(currentUser) && invoice.tenantId !== currentUser.id) {
    throw new ApiError(403, 'Only the invoice tenant can add a payment.')
  }

  const payment = await prisma.payment.create({
    data: {
      invoiceId: invoice.id,
      tenantId: invoice.tenantId,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      transactionId: paymentData.transactionId,
      status: paymentData.status ?? 'pending',
      paidAt: paymentData.paidAt,
    },
  })

  await createNotification({
    actorId: currentUser.id,
    recipientId: invoice.landlordId,
    type: 'payment_updated',
    title: 'Invoice payment update',
    body: `${currentUser.name} added a payment update for an invoice.`,
    entityType: 'invoice',
    entityId: invoice.id,
    data: { paymentId: payment.id, status: payment.status },
  })

  return getInvoice(invoice.id, currentUser)
}

export function listNotifications(currentUser) {
  return prisma.notification.findMany({
    where: { recipientId: currentUser.id },
    include: notificationInclude,
    orderBy: { createdAt: 'desc' },
  })
}

export async function markNotificationRead(notificationId, currentUser) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    include: notificationInclude,
  })

  if (!notification || notification.recipientId !== currentUser.id) {
    throw new ApiError(404, 'Notification not found.')
  }

  return prisma.notification.update({
    where: { id: notification.id },
    data: { readAt: new Date() },
    include: notificationInclude,
  })
}

export async function getDashboardSummary(currentUser) {
  if (isLandlord(currentUser)) {
    const [
      properties,
      applications,
      viewingRequests,
      conversations,
      invoices,
      tenants,
      unreadNotifications,
    ] = await Promise.all([
      prisma.property.count({ where: { ownerId: currentUser.id } }),
      prisma.application.count({ where: { landlordId: currentUser.id } }),
      prisma.viewingRequest.count({ where: { landlordId: currentUser.id } }),
      prisma.conversation.count({ where: { landlordId: currentUser.id } }),
      prisma.invoice.count({ where: { landlordId: currentUser.id } }),
      prisma.tenancy.count({ where: { landlordId: currentUser.id } }),
      prisma.notification.count({ where: { recipientId: currentUser.id, readAt: null } }),
    ])

    return { properties, applications, viewingRequests, conversations, invoices, tenants, unreadNotifications }
  }

  if (isTenant(currentUser)) {
    const [
      applications,
      viewingRequests,
      conversations,
      invoices,
      tenancies,
      unreadNotifications,
    ] = await Promise.all([
      prisma.application.count({ where: { tenantId: currentUser.id } }),
      prisma.viewingRequest.count({ where: { tenantId: currentUser.id } }),
      prisma.conversation.count({ where: { tenantId: currentUser.id } }),
      prisma.invoice.count({ where: { tenantId: currentUser.id } }),
      prisma.tenancy.count({ where: { tenantId: currentUser.id } }),
      prisma.notification.count({ where: { recipientId: currentUser.id, readAt: null } }),
    ])

    return { applications, viewingRequests, conversations, invoices, tenancies, unreadNotifications }
  }

  const [users, properties, applications, viewingRequests, conversations, invoices] =
    await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.application.count(),
      prisma.viewingRequest.count(),
      prisma.conversation.count(),
      prisma.invoice.count(),
    ])

  return { users, properties, applications, viewingRequests, conversations, invoices }
}
