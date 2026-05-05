import env from './server/config/env.js'
import prisma, { checkDatabaseConnection } from './server/config/prisma.js'
import { createApp } from './server/app.js'

const host = '0.0.0.0'
const app = createApp()
let server

let isShuttingDown = false

async function disconnectPrisma() {
  try {
    await prisma.$disconnect()
  } catch (error) {
    console.error('Failed to disconnect Prisma cleanly.')
    console.error(error)
  }
}

function shutdown(signal) {
  if (isShuttingDown) {
    return
  }

  isShuttingDown = true
  console.log(`${signal} received. Shutting down gracefully...`)

  if (!server) {
    disconnectPrisma().finally(() => {
      process.exit(0)
    })
    return
  }

  server.close(async (error) => {
    if (error) {
      console.error('Failed to close the HTTP server cleanly.')
      console.error(error)
      await disconnectPrisma()
      process.exit(1)
      return
    }

    await disconnectPrisma()
    process.exit(0)
  })
}

async function startServer() {
  try {
    await prisma.$connect()
    await checkDatabaseConnection()
    console.log('Database connection established successfully.')

    server = app.listen(env.PORT, host, () => {
      console.log(`RMS server listening on http://${host}:${env.PORT}`)
    })
  } catch (error) {
    console.error('Failed to connect to the database. Server was not started.')
    console.error(error)
    await disconnectPrisma()
    process.exit(1)
  }
}

startServer()

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

process.on('unhandledRejection', async (error) => {
  console.error('Unhandled promise rejection received.')
  console.error(error)
  await disconnectPrisma()
  process.exit(1)
})

process.on('uncaughtException', async (error) => {
  console.error('Uncaught exception received.')
  console.error(error)
  await disconnectPrisma()
  process.exit(1)
})
