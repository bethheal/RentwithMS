import env from '../config/env.js'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: env.MAIL_HOST,
  port: Number(env.MAIL_PORT),
  secure: env.MAIL_SECURE === 'true',
  auth: {
    user: env.MAIL_USER,
    pass: env.MAIL_PASS,
  },
})

// Log mail configuration on startup (without credentials)
console.log('[Mail Service] Configured with:', {
  host: env.MAIL_HOST,
  port: Number(env.MAIL_PORT),
  secure: env.MAIL_SECURE === 'true',
  hasUser: !!env.MAIL_USER,
  hasPass: !!env.MAIL_PASS,
})

function buildFromAddress() {
  const fromAddress = env.MAIL_FROM
  const fromName = env.MAIL_FROM_NAME?.trim()

  return fromName ? `"${fromName}" <${fromAddress}>` : fromAddress
}

export const sendVerificationEmail = async (
  email,
  otp,
  verificationUrl,
) => {
  try {
    const result = await transporter.sendMail({
      from: buildFromAddress(),
      to: email,
      subject: 'Verify Your Email',
      html: `
        <h2>Email Verification</h2>
        <p>Your verification code is:</p>
        <h1>${otp}</h1>
        ${verificationUrl ? `<p>You can also verify your account here: <a href="${verificationUrl}">Verify account</a></p>` : ''}
      `,
    })
    console.log('[Mail] Verification email sent:', { to: email, messageId: result.messageId })
    return result
  } catch (error) {
    console.error('[Mail] Failed to send verification email:', error.message)
    throw error
  }
}

export const sendPasswordResetEmail = async (
  email,
  resetLink
) => {
  try {
    const result = await transporter.sendMail({
      from: buildFromAddress(),
      to: email,
      subject: 'Reset Password',
      html: `
        <a href="${resetLink}">
          Reset Password
        </a>
      `,
    })
    console.log('[Mail] Password reset email sent:', { to: email, messageId: result.messageId })
    return result
  } catch (error) {
    console.error('[Mail] Failed to send password reset email:', error.message)
    throw error
  }
}
