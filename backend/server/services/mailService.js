import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import { fileURLToPath } from 'node:url'

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) })

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST ?? 'sandbox.smtp.mailtrap.io',
  port: Number(process.env.MAIL_PORT ?? 2525),
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
})

function buildFromAddress() {
  const fromAddress = process.env.MAIL_FROM ?? 'noreply@rms.local'
  const fromName = process.env.MAIL_FROM_NAME?.trim()

  return fromName ? `"${fromName}" <${fromAddress}>` : fromAddress
}

export const sendVerificationEmail = async (
  email,
  otp,
  verificationUrl,
) => {
  await transporter.sendMail({
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
}

export const sendPasswordResetEmail = async (
  email,
  resetLink
) => {
  await transporter.sendMail({
    from: buildFromAddress(),
    to: email,
    subject: 'Reset Password',
    html: `
      <a href="${resetLink}">
        Reset Password
      </a>
    `,
  })
}
