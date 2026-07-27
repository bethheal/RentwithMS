import { sendVerificationEmail } from './server/services/mailService.js'

const recipient = process.argv[2] || process.env.EMAIL_USER
const verificationUrl = 'http://localhost:5173/auth/verify-email?token=test-token'

try {
  await sendVerificationEmail(recipient, '123456', verificationUrl)

  console.log(`Email sent to ${recipient}!`)
  console.log({
    service: 'gmail',
    emailUser: process.env.EMAIL_USER,
    mailFrom: process.env.MAIL_FROM,
    mailFromName: process.env.MAIL_FROM_NAME,
    hasEmailPass: Boolean(process.env.EMAIL_PASS),
  })
} catch (error) {
  console.error('Email test failed:', error.message)
  if (error.cause) {
    console.error('SMTP error:', {
      name: error.cause.name,
      statusCode: error.cause.statusCode || error.cause.status,
      message: error.cause.message,
    })
  }
  process.exitCode = 1
}
