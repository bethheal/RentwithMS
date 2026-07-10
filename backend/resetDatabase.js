import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pkg from '@prisma/client'

const { PrismaClient } = pkg

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') })

const prisma = new PrismaClient()

async function resetDatabase() {
  try {
    console.log('🗑️  Starting database cleanup...')

    // Delete in order of dependencies
    await prisma.blog.deleteMany({})
    console.log('✅ Deleted all blog posts')

    await prisma.propertyImage.deleteMany({})
    console.log('✅ Deleted all property images')

    await prisma.property.deleteMany({})
    console.log('✅ Deleted all properties')

    await prisma.user.deleteMany({})
    console.log('✅ Deleted all users')

    console.log('✨ Database reset complete! Ready for fresh start.')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error resetting database:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

resetDatabase()
