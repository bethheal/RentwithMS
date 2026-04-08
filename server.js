import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distDir = path.join(__dirname, 'dist')
const indexFile = path.join(distDir, 'index.html')
const host = '0.0.0.0'
const port = Number.parseInt(process.env.PORT ?? '10000', 10)

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function getSafeFilePath(requestPathname) {
  const decodedPathname = decodeURIComponent(requestPathname)
  const relativePath =
    decodedPathname === '/' ? 'index.html' : decodedPathname.replace(/^\/+/, '')
  const absolutePath = path.resolve(distDir, relativePath)

  if (!absolutePath.startsWith(distDir)) {
    return null
  }

  if (!existsSync(absolutePath)) {
    return null
  }

  if (!statSync(absolutePath).isFile()) {
    return null
  }

  return absolutePath
}

function sendFile(response, filePath, method) {
  const extension = path.extname(filePath).toLowerCase()
  const contentType = mimeTypes[extension] ?? 'application/octet-stream'

  response.writeHead(200, {
    'Content-Type': contentType,
  })

  if (method === 'HEAD') {
    response.end()
    return
  }

  createReadStream(filePath).pipe(response)
}

if (!existsSync(indexFile)) {
  console.error('Missing dist/index.html. Run "npm run build" before starting the server.')
  process.exit(1)
}

const server = createServer((request, response) => {
  const method = request.method ?? 'GET'

  if (method !== 'GET' && method !== 'HEAD') {
    response.writeHead(405, {
      Allow: 'GET, HEAD',
      'Content-Type': 'text/plain; charset=utf-8',
    })
    response.end('Method not allowed')
    return
  }

  const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`)
  const filePath = getSafeFilePath(requestUrl.pathname)

  if (filePath) {
    sendFile(response, filePath, method)
    return
  }

  sendFile(response, indexFile, method)
})

server.listen(port, host, () => {
  console.log(`MS server listening on http://${host}:${port}`)
})
