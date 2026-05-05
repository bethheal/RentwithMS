import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import env from './config/env.js'
import { errorHandler } from './middleware/error.middleware.js'
import { notFoundHandler } from './middleware/notFound.middleware.js'
import apiRoutes from './routes/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..', '..')
const distDirectory = path.join(projectRoot, 'dist')
const distIndexFile = path.join(distDirectory, 'index.html')

const apiPrefixes = ['/auth', '/users', '/properties', '/uploads', '/blogs', '/health']
const allowedOrigins = env.CLIENT_ORIGINS

export function createApp() {
  const app = express()
  app.disable('x-powered-by')

  app.use(
    cors({
      // Allow browser requests from configured frontend URLs and still let tools
      // like curl or Postman hit the API without an Origin header.
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
          callback(null, true)
          return
        }

        callback(new Error('Not allowed by CORS'))
      },
      optionsSuccessStatus: 200,
    })
  )
  app.use(helmet())
  app.use(express.json({ limit: '2mb' }))
  app.use(express.urlencoded({ extended: true }))

  app.use(apiRoutes)

  app.use((req, res, next) => {
    const isApiRequest = apiPrefixes.some(
      (prefix) => req.path === prefix || req.path.startsWith(`${prefix}/`)
    )

    if (isApiRequest) {
      notFoundHandler(req, res)
      return
    }

    next()
  })

  if (existsSync(distDirectory)) {
    app.use(express.static(distDirectory))

    app.get('/{*frontendPath}', (req, res) => {
      res.sendFile(distIndexFile)
    })
  } else {
    app.get('/', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Frontend build not found yet. Run "npm run build" for production files.',
      })
    })
  }

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
