import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL or DIRECT_URL is required to reset application data.')
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
})

async function resetDatabase() {
  console.log('Starting application data cleanup...')

  // Delete only application data. Keep schema, migrations, and Prisma setup unchanged.
  await prisma.blog.deleteMany({})
  console.log('Deleted blog posts.')

  await prisma.propertyImage.deleteMany({})
  console.log('Deleted property images.')

  await prisma.property.deleteMany({})
  console.log('Deleted properties.')

  await prisma.user.deleteMany({})
  console.log('Deleted users and account verification data.')

  console.log('Application data cleanup complete.')
}

try {
  await resetDatabase()
} catch (error) {
  console.error('Error resetting application data:', error.message)
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
