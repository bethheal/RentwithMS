import dotenv from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..', '..', '..')
const envFiles = [
  path.resolve(projectRoot, 'backend', '.env'),
  path.resolve(projectRoot, '.env'),
]
const envLocations = envFiles.map((envFile) =>
  path.relative(projectRoot, envFile).replaceAll('\\', '/'),
)

for (const envFile of envFiles) {
  if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile })
  }
}

function requireEnv(name) {
  const value = process.env[name]

  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${name}. Add it to ${envLocations.join(
        ' or ',
      )}. You can copy backend/.env.example to backend/.env first.`,
    )
  }

  return value
}

const parsedPort = Number.parseInt(process.env.PORT ?? '5000', 10)
const clientOrigins = (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number.isNaN(parsedPort) ? 5000 : parsedPort,
  DATABASE_URL: requireEnv('DATABASE_URL'),
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  CLIENT_ORIGINS: clientOrigins,
  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? '',
  CLOUDINARY_CLOUD_NAME: requireEnv('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: requireEnv('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: requireEnv('CLOUDINARY_API_SECRET'),
  ACCOUNT_ACTIVATION_REQUIREMENT:
    process.env.ACCOUNT_ACTIVATION_REQUIREMENT === 'both' ? 'both' : 'either',
  EMAIL_USER: process.env.EMAIL_USER ?? '',
  EMAIL_PASS: process.env.EMAIL_PASS ?? '',
  MAIL_FROM: process.env.MAIL_FROM ?? process.env.EMAIL_USER ?? '',
  MAIL_FROM_NAME: process.env.MAIL_FROM_NAME ?? 'MS Group',
}

export default env
