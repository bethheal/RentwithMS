import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '@prisma/client'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const backendEnvPath = path.resolve(__dirname, '..', '.env')

dotenv.config({ path: backendEnvPath })
dotenv.config()

const prisma = new PrismaClient()

function requireSeedValue(name) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is required before running the seed command.`)
  }

  return value
}

async function main() {
  const name = requireSeedValue('ADMIN_NAME').trim()
  const email = requireSeedValue('ADMIN_EMAIL').trim().toLowerCase()
  const password = requireSeedValue('ADMIN_PASSWORD')

  // The first admin is created through seeding so user creation stays admin-only.
  const passwordHash = await bcrypt.hash(password, 12)

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role: 'admin',
    },
    create: {
      name,
      email,
      passwordHash,
      role: 'admin',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  })

  console.log(`Admin user is ready: ${admin.email} (${admin.role})`)
}

main()
  .catch((error) => {
    console.error('Failed to seed the database.')
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
