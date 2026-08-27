export function serializeUser(user) {
  if (!user) {
    return null
  }

  const serializedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    accountStatus: user.accountStatus,
    deactivatedAt: user.deactivatedAt,
    scheduledDeletionDate: user.scheduledDeletionDate,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }

  if (user._count) {
    serializedUser.counts = {
      properties: user._count.properties ?? 0,
      blogPosts: user._count.blogPosts ?? 0,
    }
  }

  return serializedUser
}

export function serializePropertyImage(image) {
  return {
    id: image.id,
    url: image.url,
    cloudinaryPublicId: image.cloudinaryPublicId,
    createdAt: image.createdAt,
  }
}

export function serializeProperty(property) {
  return {
    id: property.id,
    title: property.title,
    description: property.description,
    price: Number(property.price),
    location: property.location,
    workflowStatus: property.workflowStatus,
    publishedAt: property.publishedAt,
    ownerId: property.ownerId,
    owner: property.owner ? serializeUser(property.owner) : null,
    images: (property.images ?? []).map(serializePropertyImage),
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
  }
}

export function serializeBlog(blog) {
  return {
    id: blog.id,
    title: blog.title,
    content: blog.content,
    imageUrl: blog.imageUrl,
    imagePublicId: blog.imagePublicId,
    authorId: blog.authorId,
    author: blog.author ? serializeUser(blog.author) : null,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
  }
}

export function serializeApplication(application) {
  return {
    id: application.id,
    propertyId: application.propertyId,
    property: application.property ? serializeProperty(application.property) : null,
    tenantId: application.tenantId,
    tenant: application.tenant ? serializeUser(application.tenant) : null,
    landlordId: application.landlordId,
    landlord: application.landlord ? serializeUser(application.landlord) : null,
    moveInDate: application.moveInDate,
    message: application.message,
    personalDetails: application.personalDetails,
    employment: application.employment,
    rentalHistory: application.rentalHistory,
    documents: application.documents,
    details: application.details,
    status: application.status,
    applicationDate: application.createdAt,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
  }
}

export function serializeViewingRequest(request) {
  return {
    id: request.id,
    propertyId: request.propertyId,
    property: request.property ? serializeProperty(request.property) : null,
    tenantId: request.tenantId,
    tenant: request.tenant ? serializeUser(request.tenant) : null,
    landlordId: request.landlordId,
    landlord: request.landlord ? serializeUser(request.landlord) : null,
    preferredDateTime: request.preferredDateTime,
    scheduledDateTime: request.scheduledDateTime,
    response: request.response,
    notes: request.notes,
    contactPhone: request.contactPhone,
    contactEmail: request.contactEmail,
    status: request.status,
    requestDate: request.createdAt,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  }
}

export function serializeMessage(message, currentUserId = null) {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    sender: message.sender ? serializeUser(message.sender) : null,
    senderRole: message.sender?.role,
    body: message.body,
    text: message.body,
    readAt: message.readAt,
    deliveryStatus: message.readAt ? 'Read' : 'Sent',
    isMine: currentUserId ? message.senderId === currentUserId : undefined,
    createdAt: message.createdAt,
    timestamp: message.createdAt,
  }
}

export function serializeConversation(conversation, currentUserId = null) {
  return {
    id: conversation.id,
    tenantId: conversation.tenantId,
    tenant: conversation.tenant ? serializeUser(conversation.tenant) : null,
    landlordId: conversation.landlordId,
    landlord: conversation.landlord ? serializeUser(conversation.landlord) : null,
    propertyId: conversation.propertyId,
    property: conversation.property ? serializeProperty(conversation.property) : null,
    tenancyId: conversation.tenancyId,
    tenancy: conversation.tenancy ? serializeTenancy(conversation.tenancy) : null,
    topic: conversation.topic,
    messages: (conversation.messages ?? []).map((message) =>
      serializeMessage(message, currentUserId)
    ),
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  }
}

export function serializeTenancy(tenancy) {
  return {
    id: tenancy.id,
    propertyId: tenancy.propertyId,
    property: tenancy.property ? serializeProperty(tenancy.property) : null,
    tenantId: tenancy.tenantId,
    tenant: tenancy.tenant ? serializeUser(tenancy.tenant) : null,
    landlordId: tenancy.landlordId,
    landlord: tenancy.landlord ? serializeUser(tenancy.landlord) : null,
    unit: tenancy.unit,
    startDate: tenancy.startDate,
    endDate: tenancy.endDate,
    rentAmount: tenancy.rentAmount == null ? null : Number(tenancy.rentAmount),
    status: tenancy.status,
    createdAt: tenancy.createdAt,
    updatedAt: tenancy.updatedAt,
  }
}

export function serializeInvoice(invoice) {
  return {
    id: invoice.id,
    landlordId: invoice.landlordId,
    landlord: invoice.landlord ? serializeUser(invoice.landlord) : null,
    tenantId: invoice.tenantId,
    tenant: invoice.tenant ? serializeUser(invoice.tenant) : null,
    propertyId: invoice.propertyId,
    property: invoice.property ? serializeProperty(invoice.property) : null,
    tenancyId: invoice.tenancyId,
    tenancy: invoice.tenancy ? serializeTenancy(invoice.tenancy) : null,
    amount: Number(invoice.amount),
    description: invoice.description,
    dueDate: invoice.dueDate,
    status: invoice.status,
    paymentInformation: invoice.paymentInformation,
    history: invoice.history,
    payments: (invoice.payments ?? []).map(serializePayment),
    createdAt: invoice.createdAt,
    updatedAt: invoice.updatedAt,
  }
}

export function serializePayment(payment) {
  return {
    id: payment.id,
    invoiceId: payment.invoiceId,
    tenantId: payment.tenantId,
    tenant: payment.tenant ? serializeUser(payment.tenant) : null,
    amount: Number(payment.amount),
    paymentMethod: payment.paymentMethod,
    transactionId: payment.transactionId,
    status: payment.status,
    paidAt: payment.paidAt,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  }
}

export function serializeNotification(notification) {
  return {
    id: notification.id,
    recipientId: notification.recipientId,
    actorId: notification.actorId,
    actor: notification.actor ? serializeUser(notification.actor) : null,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    entityType: notification.entityType,
    entityId: notification.entityId,
    data: notification.data,
    readAt: notification.readAt,
    isRead: Boolean(notification.readAt),
    createdAt: notification.createdAt,
  }
}
