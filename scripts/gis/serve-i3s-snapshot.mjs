import { createReadStream } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { getGisSource } from './sources.mjs'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const args = parseArgs(process.argv.slice(2))
const source = getGisSource(args.source)
const snapshotRoot = path.resolve(projectRoot, args.input ?? `data/processed/${source.id}`)
const layer = JSON.parse(await readFile(path.join(snapshotRoot, '3dSceneLayer.json'), 'utf8'))
const serviceDocument = JSON.stringify({
  serviceName: source.dataset,
  serviceVersion: layer.store?.version,
  layers: [layer],
  supportedBindings: ['REST'],
})

const server = createServer(async (request, response) => {
  setCorsHeaders(response)

  if (request.method === 'OPTIONS') {
    response.writeHead(204)
    response.end()
    return
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405)
    response.end('Method not allowed')
    return
  }

  const url = new URL(request.url, `http://${request.headers.host}`)
  const requestedPath = decodeURIComponent(url.pathname).replace(/^\/+|\/+$/g, '')

  if (requestedPath === '') {
    sendJson(request, response, serviceDocument)
    return
  }

  const relativePath = requestedPath === 'layers/0'
    ? '3dSceneLayer.json'
    : requestedPath.replace(/^layers\/0\//, '')
  const filePath = path.resolve(snapshotRoot, relativePath)

  if (!filePath.startsWith(`${snapshotRoot}${path.sep}`) && filePath !== snapshotRoot) {
    response.writeHead(403)
    response.end('Forbidden')
    return
  }

  try {
    const file = await stat(filePath)
    if (!file.isFile()) throw new Error('Not a file')

    response.writeHead(200, {
      'content-type': contentTypeFor(relativePath),
      'content-length': file.size,
      'cache-control': 'public, max-age=3600',
    })

    if (request.method === 'HEAD') response.end()
    else createReadStream(filePath).pipe(response)
  } catch {
    response.writeHead(404)
    response.end('Not found')
  }
})

server.listen(args.port, args.host, () => {
  console.log(`Serving ${path.relative(projectRoot, snapshotRoot)} at http://${args.host}:${args.port}`)
})

function sendJson(request, response, body) {
  response.writeHead(200, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'public, max-age=3600',
  })
  if (request.method === 'HEAD') response.end()
  else response.end(body)
}

function contentTypeFor(filePath) {
  if (
    filePath.endsWith('.json')
    || filePath.startsWith('nodepages/')
    || filePath.includes('/nodepages/')
    || filePath.endsWith('/shared')
    || filePath.includes('/features/')
  ) return 'application/json; charset=utf-8'

  return 'application/octet-stream'
}

function setCorsHeaders(response) {
  response.setHeader('access-control-allow-origin', '*')
  response.setHeader('access-control-allow-methods', 'GET, HEAD, OPTIONS')
  response.setHeader('access-control-allow-headers', 'content-type, range')
}

function parseArgs(argv) {
  const parsed = {
    source: 'taipei-cadastral-2025',
    input: null,
    host: '127.0.0.1',
    port: 4174,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--source') parsed.source = requireValue(argv, ++index, arg)
    else if (arg === '--input') parsed.input = requireValue(argv, ++index, arg)
    else if (arg === '--host') parsed.host = requireValue(argv, ++index, arg)
    else if (arg === '--port') parsed.port = Number(requireValue(argv, ++index, arg))
    else throw new Error(`Unknown argument: ${arg}`)
  }

  if (!Number.isInteger(parsed.port) || parsed.port < 1 || parsed.port > 65_535) {
    throw new Error('--port must be a valid TCP port')
  }

  return parsed
}

function requireValue(argv, index, flag) {
  const value = argv[index]
  if (!value) throw new Error(`${flag} requires a value`)
  return value
}
