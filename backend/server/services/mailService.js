import env from '../config/env.js'
import { Resend } from 'resend'

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null

console.log('[Mail Service] Configured with Resend:', {
  hasApiKey: !!env.RESEND_API_KEY,
  from: env.RESEND_FROM || env.MAIL_FROM,
})

function buildFromAddress() {
  const fromAddress = env.RESEND_FROM || env.MAIL_FROM
  const fromName = env.MAIL_FROM_NAME?.trim()

  return fromName ? `"${fromName}" <${fromAddress}>` : fromAddress
}

export const sendVerificationEmail = async (
  email,
  otp,
  verificationUrl,
) => {
  if (!resend) {
    throw new Error('Resend API key is not configured')
  }

  try {
    const { data, error } = await resend.emails.send({
      from: buildFromAddress(),
      to: [email],
      subject: 'Verify Your Email',
      html: `
        <h2>Email Verification</h2>
        <p>Your verification code is:</p>
        <h1>${otp}</h1>
        ${verificationUrl ? `<p>You can also verify your account here: <a href="${verificationUrl}">Verify account</a></p>` : ''}
      `,
    })

    if (error) {
      throw new Error(error.message)
    }

    console.log('[Mail] Verification email sent:', { to: email, id: data?.id })
    return data
  } catch (error) {
    console.error('[Mail] Failed to send verification email:', error.message)
    throw error
  }
}

export const sendPasswordResetEmail = async (
  email,
  resetLink,
) => {
  if (!resend) {
    throw new Error('Resend API key is not configured')
  }

  try {
    const { data, error } = await resend.emails.send({
      from: buildFromAddress(),
      to: [email],
      subject: 'Reset Password',
      html: `
        <a href="${resetLink}">
          Reset Password
        </a>
      `,
    })

    if (error) {
      throw new Error(error.message)
    }

    console.log('[Mail] Password reset email sent:', { to: email, id: data?.id })
    return data
  } catch (error) {
    console.error('[Mail] Failed to send password reset email:', error.message)
    throw error
  }
}
