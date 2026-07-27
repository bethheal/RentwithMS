import { Resend } from 'resend'
import env from '../config/env.js'

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null

function buildFromAddress() {
  const fromAddress = (env.RESEND_FROM || env.MAIL_FROM || '').trim()
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

  if (!resend) {
    missingFields.push('RESEND_API_KEY')
  }

  if (!buildFromAddress()) {
    missingFields.push('RESEND_FROM')
  }

  if (missingFields.length > 0) {
    throw new Error(
      `Resend is not configured. Add ${missingFields.join(', ')} to the backend environment.`,
    )
  }
}

function formatResendError(error) {
  return error?.message || error?.name || 'Unknown Resend error'
}

console.log('[Mail Service] Configured with Resend:', {
  hasApiKey: Boolean(env.RESEND_API_KEY),
  from: buildFromAddress(),
})

async function sendMail({ email, html, subject }) {
  assertMailConfig()

  const recipient = assertValidRecipient(email)
  const from = buildFromAddress()

  const { data, error } = await resend.emails.send({
    from,
    to: [recipient],
    subject,
    html,
  })

  if (error) {
    const message = formatResendError(error)
    console.error('[Mail] Resend delivery failed:', {
      from,
      to: recipient,
      error: message,
    })
    throw new Error(`Resend delivery failed: ${message}`)
  }

  console.log('[Mail] Email sent:', {
    from,
    to: recipient,
    id: data?.id,
  })

  return data
}

export const sendVerificationEmail = async (email, otp) => {
  return sendMail({
    email,
    subject: 'Verify Your Email',
    html: `
      <h2>Email Verification</h2>
      <p>Your verification code is:</p>
      <h1>${otp}</h1>
      <p>This code expires in 10 minutes.</p>
    `,
  })
}

export const sendPasswordResetEmail = async (email, resetLink) => {
  return sendMail({
    email,
    subject: 'Reset Password',
    html: `
      <p>Use this link to reset your password:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
    `,
  })
}

export const sendTestEmail = async (email) => {
  return sendMail({
    email,
    subject: 'MS Group Email Test',
    html: `
      <h2>MS Group Email Test</h2>
      <p>Your Resend email service is working.</p>
    `,
  })
}
