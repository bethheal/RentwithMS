import {
  serializeApplication,
  serializeConversation,
  serializeInvoice,
  serializeNotification,
  serializeViewingRequest,
} from '../utils/serializers.js'
import asyncHandler from '../utils/asyncHandler.js'
import {
  createApplication,
  createConversation,
  createInvoice,
  createPayment,
  createViewingRequest,
  getApplication,
  getConversation,
  getDashboardSummary,
  getInvoice,
  getViewingRequest,
  listApplications,
  listConversations,
  listInvoices,
  listNotifications,
  listViewingRequests,
  markMessageRead,
  markNotificationRead,
  respondToViewingRequest,
  sendMessage,
  updateApplicationStatus,
  updateInvoice,
} from '../services/workflow.service.js'

export const createApplicationRecord = asyncHandler(async (req, res) => {
  const application = await createApplication(req.body, req.user)

  res.status(201).json({
    success: true,
    message: 'Application submitted successfully.',
    data: serializeApplication(application),
  })
})

export const getApplicationRecords = asyncHandler(async (req, res) => {
  const applications = await listApplications(req.user)

  res.status(200).json({
    success: true,
    data: applications.map(serializeApplication),
  })
})

export const getApplicationRecord = asyncHandler(async (req, res) => {
  const application = await getApplication(req.params.id, req.user)

  res.status(200).json({
    success: true,
    data: serializeApplication(application),
  })
})

export const updateApplicationRecordStatus = asyncHandler(async (req, res) => {
  const application = await updateApplicationStatus(req.params.id, req.body.status, req.user)

  res.status(200).json({
    success: true,
    message: 'Application status updated successfully.',
    data: serializeApplication(application),
  })
})

export const createViewingRequestRecord = asyncHandler(async (req, res) => {
  const request = await createViewingRequest(req.body, req.user)

  res.status(201).json({
    success: true,
    message: 'Viewing request submitted successfully.',
    data: serializeViewingRequest(request),
  })
})

export const getViewingRequestRecords = asyncHandler(async (req, res) => {
  const requests = await listViewingRequests(req.user)

  res.status(200).json({
    success: true,
    data: requests.map(serializeViewingRequest),
  })
})

export const getViewingRequestRecord = asyncHandler(async (req, res) => {
  const request = await getViewingRequest(req.params.id, req.user)

  res.status(200).json({
    success: true,
    data: serializeViewingRequest(request),
  })
})

export const respondToViewingRequestRecord = asyncHandler(async (req, res) => {
  const request = await respondToViewingRequest(req.params.id, req.body, req.user)

  res.status(200).json({
    success: true,
    message: 'Viewing request updated successfully.',
    data: serializeViewingRequest(request),
  })
})

export const createConversationRecord = asyncHandler(async (req, res) => {
  const conversation = await createConversation(req.body, req.user)

  res.status(201).json({
    success: true,
    message: 'Conversation ready.',
    data: serializeConversation(conversation, req.user.id),
  })
})

export const getConversationRecords = asyncHandler(async (req, res) => {
  const conversations = await listConversations(req.user)

  res.status(200).json({
    success: true,
    data: conversations.map((conversation) => serializeConversation(conversation, req.user.id)),
  })
})

export const getConversationRecord = asyncHandler(async (req, res) => {
  const conversation = await getConversation(req.params.id, req.user)

  res.status(200).json({
    success: true,
    data: serializeConversation(conversation, req.user.id),
  })
})

export const sendConversationMessage = asyncHandler(async (req, res) => {
  const conversation = await sendMessage(req.params.id, req.body, req.user)

  res.status(201).json({
    success: true,
    message: 'Message sent successfully.',
    data: serializeConversation(conversation, req.user.id),
  })
})

export const readConversationMessage = asyncHandler(async (req, res) => {
  const conversation = await markMessageRead(req.params.id, req.params.messageId, req.user)

  res.status(200).json({
    success: true,
    message: 'Message marked as read.',
    data: serializeConversation(conversation, req.user.id),
  })
})

export const createInvoiceRecord = asyncHandler(async (req, res) => {
  const invoice = await createInvoice(req.body, req.user)

  res.status(201).json({
    success: true,
    message: 'Invoice created successfully.',
    data: serializeInvoice(invoice),
  })
})

export const getInvoiceRecords = asyncHandler(async (req, res) => {
  const invoices = await listInvoices(req.user)

  res.status(200).json({
    success: true,
    data: invoices.map(serializeInvoice),
  })
})

export const getInvoiceRecord = asyncHandler(async (req, res) => {
  const invoice = await getInvoice(req.params.id, req.user)

  res.status(200).json({
    success: true,
    data: serializeInvoice(invoice),
  })
})

export const updateInvoiceRecord = asyncHandler(async (req, res) => {
  const invoice = await updateInvoice(req.params.id, req.body, req.user)

  res.status(200).json({
    success: true,
    message: 'Invoice updated successfully.',
    data: serializeInvoice(invoice),
  })
})

export const createInvoicePaymentRecord = asyncHandler(async (req, res) => {
  const invoice = await createPayment(req.params.id, req.body, req.user)

  res.status(201).json({
    success: true,
    message: 'Payment update recorded successfully.',
    data: serializeInvoice(invoice),
  })
})

export const getNotificationRecords = asyncHandler(async (req, res) => {
  const notifications = await listNotifications(req.user)

  res.status(200).json({
    success: true,
    data: notifications.map(serializeNotification),
  })
})

export const readNotificationRecord = asyncHandler(async (req, res) => {
  const notification = await markNotificationRead(req.params.id, req.user)

  res.status(200).json({
    success: true,
    message: 'Notification marked as read.',
    data: serializeNotification(notification),
  })
})

export const getDashboardSummaryRecord = asyncHandler(async (req, res) => {
  const summary = await getDashboardSummary(req.user)

  res.status(200).json({
    success: true,
    data: summary,
  })
})
