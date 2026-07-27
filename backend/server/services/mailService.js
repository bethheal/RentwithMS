import nodemailer from 'nodemailer'
import env from '../config/env.js'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
})

function buildFromAddress() {
  const fromAddress = (env.MAIL_FROM || env.EMAIL_USER || '').trim()
  const fromName = env.MAIL_FROM_NAME?.trim()

  return fromName ? `"${fromName}" <${fromAddress}>` : fromAddress
}

function assertValidRecipient(email) {
  const normalizedEmail = String(email ?? '').trim().toLowerCase()

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error('Email recipient is invalid.')
  }

  return normalizedEmail
}

function assertMailConfig() {
  const missingFields = []

  if (!env.EMAIL_USER?.trim()) {
    missingFields.push('EMAIL_USER')
  }

  if (!env.EMAIL_PASS?.trim()) {
    missingFields.push('EMAIL_PASS')
  }

  if (!buildFromAddress()) {
    missingFields.push('MAIL_FROM')
  }

  if (missingFields.length > 0) {
    throw new Error(
      `Gmail SMTP is not configured. Add ${missingFields.join(
        ', ',
      )} to backend/.env. Use a Gmail app password for EMAIL_PASS.`,
    )
  }
}

function formatMailError(error) {
  if (!error) {
    return 'Unknown mail error'
  }

  return [
    error.code,
    error.command,
    error.responseCode,
    error.response,
    error.message,
  ]
    .filter(Boolean)
    .join(' - ')
}

function logMailError(context, error) {
  console.error(`[Mail] ${context}:`, {
    message: formatMailError(error),
    code: error?.code,
    command: error?.command,
    responseCode: error?.responseCode,
    response: error?.response,
  })
}

console.log('[Mail Service] Configured with Gmail SMTP:', {
  service: 'gmail',
  hasUser: Boolean(env.EMAIL_USER),
  hasPassword: Boolean(env.EMAIL_PASS),
  from: buildFromAddress(),
})

export async function verifyMailConnection() {
  assertMailConfig()

  try {
    await transporter.verify()
    console.log('[Mail] Gmail SMTP authenticated successfully.', {
      user: env.EMAIL_USER,
      from: buildFromAddress(),
    })
    return true
  } catch (error) {
    logMailError('Gmail SMTP authentication failed', error)
    throw new Error(`Gmail SMTP authentication failed: ${formatMailError(error)}`)
  }
}

async function sendMail({ email, html, subject }) {
  assertMailConfig()

  const recipient = assertValidRecipient(email)
  const from = buildFromAddress()

  try {
    await verifyMailConnection()

    const info = await transporter.sendMail({
      from,
      to: recipient,
      subject,
      html,
    })

    console.log('[Mail] Email sent:', {
      from,
      to: recipient,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    })

    return info
  } catch (error) {
    logMailError('Failed to send email', error)
    throw new Error(`Gmail SMTP delivery failed: ${formatMailError(error)}`)
  }
}

export const sendVerificationEmail = async (email, otp, verificationUrl) => {
  return sendMail({
    email,
    subject: 'Verify Your Email',
    html: `
      <h2>Email Verification</h2>
      <p>Your verification code is:</p>
      <h1>${otp}</h1>
      ${
        verificationUrl
          ? `<p>You can also verify your account here: <a href="${verificationUrl}">Verify account</a></p>`
          : ''
      }
    `,
  })
}

export const sendPasswordResetEmail = async (email, resetLink) => {
  return sendMail({
    email,
    subject: 'Reset Password',
    html: `
      <a href="${resetLink}">
        Reset Password
      </a>
    `,
  })
}

export const sendTestEmail = async (email) => {
  return sendMail({
    email,
    subject: 'MS Group SMTP Test',
    html: `
      <h2>MS Group SMTP Test</h2>
      <p>Your Gmail SMTP email service is working.</p>
    `,
  })
}
