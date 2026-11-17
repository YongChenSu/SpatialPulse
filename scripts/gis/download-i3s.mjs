import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { getGisSource, gisSources } from './sources.mjs'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const args = parseArgs(process.argv.slice(2))

if (args.help) {
  printHelp()
  process.exit(0)
}

if (!args.all && args.maxNodes === null) {
  throw new Error('Choose --max-nodes <n> for a PoC or --all for a complete snapshot')
}

const source = getGisSource(args.source)
const outputRoot = path.resolve(projectRoot, args.output ?? `data/raw/${source.id}`)
const layer = await fetchJson(source.layerUrl)
const pages = await fetchNodePages(source.layerUrl, layer.nodePages?.nodesPerPage)
const allNodes = pages.flatMap((page) => page.nodes ?? [])
const meshNodes = allNodes.filter((node) => node.mesh)
const selectedNodes = args.all ? meshNodes : meshNodes.slice(0, args.maxNodes)
const usesNodePageResources = Number.parseFloat(layer.store?.version ?? '0') >= 1.8

await mkdir(outputRoot, { recursive: true })
await writeJson(path.join(outputRoot, '3dSceneLayer.json'), usesNodePageResources
  ? layer
  : {
      ...layer,
      store: {
        ...layer.store,
        rootNode: './nodes/root/index.json',
      },
    })

for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
  await writeJson(path.join(outputRoot, 'nodepages', String(pageIndex)), pages[pageIndex])
}

if (!usesNodePageResources) {
  const rootNode = rewriteNodeDocument(await fetchJson(`${source.layerUrl}/nodes/root`))
  await writeJson(path.join(outputRoot, 'nodes/root/index.json'), rootNode)
}

let completed = 0
let downloadedBytes = 0
let downloadedResourceCount = 0
let reusedResourceCount = 0
let skippedOptionalResourceCount = 0
const failures = []

await runPool(selectedNodes, args.concurrency, async (nodeSummary) => {
  const nodeIndex = String(nodeSummary.index)
  const resourceId = String(nodeSummary.mesh.geometry.resource)
  const remoteNodeUrl = `${source.layerUrl}/nodes/${resourceId}`
  const localNodeRoot = path.join(outputRoot, 'nodes', resourceId)
  const node = usesNodePageResources
    ? null
    : args.force
      ? await fetchJson(remoteNodeUrl)
      : await readJsonIfPresent(path.join(localNodeRoot, 'index.json')) ?? await fetchJson(remoteNodeUrl)

  if (node) await writeJson(path.join(localNodeRoot, 'index.json'), rewriteNodeDocument(node))

  const resourceHrefs = usesNodePageResources
    ? nodePageResourceHrefs(nodeSummary, layer, args.profile)
    : [
        node.sharedResource?.href,
        ...(args.profile === 'full' ? (node.featureData ?? []).map((resource) => resource.href) : []),
        ...geometryResourceHrefs(node, nodeSummary, layer, args.profile),
        ...(args.profile === 'full' ? (node.attributeData ?? []).map((resource) => resource.href) : []),
      ].filter(Boolean)

  for (const href of resourceHrefs) {
    const relativeResource = normalizeResourceHref(href)
    const destination = path.join(localNodeRoot, relativeResource)

    if (!args.force && await isNonEmptyFile(destination)) {
      reusedResourceCount += 1
      continue
    }

    const resourceUrl = usesNodePageResources
      ? `${remoteNodeUrl}/${relativeResource}/?f=pjson`
      : `${remoteNodeUrl}/${relativeResource}`
    const isOptionalTexture = usesNodePageResources && relativeResource.startsWith('textures/')
    const response = await fetchWithRetry(resourceUrl, { allowNotAcceptable: isOptionalTexture })
    if (response === null) {
      skippedOptionalResourceCount += 1
      continue
    }
    const bytes = new Uint8Array(await response.arrayBuffer())
    await writeFileAtomically(destination, bytes)
    downloadedBytes += bytes.byteLength
    downloadedResourceCount += 1
  }

  completed += 1
  console.log(`[${completed}/${selectedNodes.length}] node ${nodeIndex} (resource ${resourceId})`)
}, (nodeSummary, error) => {
  const nodeIndex = String(nodeSummary.index)
  const resourceId = String(nodeSummary.mesh.geometry.resource)
  failures.push({ nodeIndex, resourceId, message: error.message })
  completed += 1
  console.error(`[${completed}/${selectedNodes.length}] node ${nodeIndex} (resource ${resourceId}) failed: ${error.message}`)
})

const snapshot = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  source,
  complete: args.all && failures.length === 0,
  availableNodeCount: meshNodes.length,
  downloadedNodeCount: selectedNodes.length,
  downloadedResourceBytes: downloadedBytes,
  downloadedResourceCount,
  reusedResourceCount,
  skippedOptionalResourceCount,
  failures,
  entrypoint: '3dSceneLayer.json',
  resourceProfile: args.profile,
  resourceLayout: usesNodePageResources ? 'node-pages-1.8' : 'node-documents',
  warning: args.all
    ? null
    : 'This is a resource-layout PoC, not a renderable spatial subset. A publish step must prune and rewrite the hierarchy.',
}

await writeJson(path.join(outputRoot, 'snapshot.json'), snapshot)
console.log(JSON.stringify(snapshot, null, 2))
if (failures.length > 0) process.exitCode = 1

async function fetchNodePages(layerUrl, nodesPerPage) {
  if (!nodesPerPage) throw new Error('The source does not advertise I3S node pages')

  const pages = []

  for (let pageIndex = 0; ; pageIndex += 1) {
    const response = await fetchWithRetry(`${layerUrl}/nodepages/${pageIndex}`, { allowNotFound: true })
    if (response === null) break

    const page = await response.json()
    if (!Array.isArray(page.nodes) || page.nodes.length === 0) break

    pages.push(page)
    if (page.nodes.length < nodesPerPage) break
  }

  return pages
}

async function runPool(items, concurrency, task, onError) {
  let nextIndex = 0

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex
      nextIndex += 1
      try {
        await task(items[index])
      } catch (error) {
        onError(items[index], error)
      }
    }
  }

  await Promise.all(Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  ))
}

function rewriteNodeDocument(node) {
  return {
    ...node,
    parentNode: rewriteNodeReference(node.parentNode),
    children: node.children?.map(rewriteNodeReference),
  }
}

function rewriteNodeReference(reference) {
  if (!reference?.href) return reference
  if (reference.href.endsWith('/index.json')) return reference
  return { ...reference, href: `${reference.href}/index.json` }
}

function normalizeResourceHref(href) {
  const normalized = href.replace(/^\.\//, '')

  if (normalized.includes('..') || path.isAbsolute(normalized)) {
    throw new Error(`Unsafe I3S resource href: ${href}`)
  }

  return normalized
}

function geometryResourceHrefs(node, nodeSummary, layerDefinition, profile) {
  const advertised = (node.geometryData ?? []).map((resource) => resource.href)
  const geometryDefinitionIndex = nodeSummary.mesh?.geometry?.definition
  const geometryBuffers = layerDefinition.geometryDefinitions?.[geometryDefinitionIndex]?.geometryBuffers ?? []
  const bufferCount = geometryBuffers.length || 1

  if (profile === 'render') {
    const compressedIndexes = geometryBuffers
      .map((buffer, index) => buffer.compressedAttributes ? index : null)
      .filter((index) => index !== null)

    if (compressedIndexes.length > 0) {
      return compressedIndexes.map((index) => `./geometries/${index}`)
    }
  }

  if (bufferCount <= advertised.length) return advertised

  return Array.from({ length: bufferCount }, (_, index) => `./geometries/${index}`)
}

function nodePageResourceHrefs(nodeSummary, layerDefinition, profile) {
  const geometryDefinitionIndex = nodeSummary.mesh.geometry.definition
  const geometryBuffers = layerDefinition.geometryDefinitions?.[geometryDefinitionIndex]?.geometryBuffers ?? []
  const geometryHrefs = Array.from(
    { length: Math.max(geometryBuffers.length, 1) },
    (_, index) => `geometries/${index}`,
  )
  const materialDefinitionIndex = nodeSummary.mesh.material?.definition
  const material = layerDefinition.materialDefinitions?.[materialDefinitionIndex]
  const textureSetDefinitionId = material?.pbrMetallicRoughness?.baseColorTexture?.textureSetDefinitionId
  const textures = textureSetDefinitionId === undefined
    ? []
    : (layerDefinition.textureSetDefinitions?.[textureSetDefinitionId]?.formats ?? [])
      .map((format) => `textures/${format.name}`)

  if (profile === 'render') return [...geometryHrefs, ...textures]

  const attributeResource = nodeSummary.mesh.attribute?.resource
  const attributes = attributeResource === undefined
    ? []
    : (layerDefinition.attributeStorageInfo ?? [])
      .map((attribute) => `attributes/${attribute.key}/0`)

  return [...geometryHrefs, ...textures, ...attributes]
}

async function fetchJson(url) {
  const response = await fetchWithRetry(url)
  return response.json()
}

async function fetchWithRetry(url, options = {}) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), args.timeoutMs)

    try {
      const response = await fetch(url, {
        headers: {
          accept: '*/*',
          origin: 'https://spatialpulse.app',
          'user-agent': 'SpatialPulse GIS snapshot/0.1',
        },
        signal: controller.signal,
      })

      if (options.allowNotFound && response.status === 404) return null
      if (options.allowNotAcceptable && response.status === 406) return null
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
      return response
    } catch (error) {
      if (attempt === 3) {
        throw new Error(`Failed to fetch ${url}: ${error.message}`, { cause: error })
      }
    } finally {
      clearTimeout(timeout)
    }
  }
}

async function writeJson(destination, value) {
  await mkdir(path.dirname(destination), { recursive: true })
  await writeFileAtomically(destination, `${JSON.stringify(value, null, 2)}\n`)
}

async function writeFileAtomically(destination, value) {
  await mkdir(path.dirname(destination), { recursive: true })
  const temporaryPath = `${destination}.partial`
  await writeFile(temporaryPath, value)
  await rename(temporaryPath, destination)
}

async function readJsonIfPresent(filePath) {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw error
  }
}

async function isNonEmptyFile(filePath) {
  try {
    return (await stat(filePath)).size > 0
  } catch (error) {
    if (error.code === 'ENOENT') return false
    throw error
  }
}

function parseArgs(argv) {
  const parsed = {
    source: 'taipei-cadastral-2025',
    output: null,
    maxNodes: null,
    all: false,
    concurrency: 4,
    timeoutMs: 30_000,
    profile: 'full',
    force: false,
    help: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--help' || arg === '-h') parsed.help = true
    else if (arg === '--source') parsed.source = requireValue(argv, ++index, arg)
    else if (arg === '--output') parsed.output = requireValue(argv, ++index, arg)
    else if (arg === '--max-nodes') parsed.maxNodes = Number(requireValue(argv, ++index, arg))
    else if (arg === '--all') parsed.all = true
    else if (arg === '--concurrency') parsed.concurrency = Number(requireValue(argv, ++index, arg))
    else if (arg === '--timeout-ms') parsed.timeoutMs = Number(requireValue(argv, ++index, arg))
    else if (arg === '--force') parsed.force = true
    else if (arg === '--profile') parsed.profile = requireValue(argv, ++index, arg)
    else throw new Error(`Unknown argument: ${arg}`)
  }

  for (const [name, value] of [['max-nodes', parsed.maxNodes], ['concurrency', parsed.concurrency], ['timeout-ms', parsed.timeoutMs]]) {
    if (value !== null && (!Number.isInteger(value) || value < 1)) {
      throw new Error(`--${name} must be a positive integer`)
    }
  }

  if (!['full', 'render'].includes(parsed.profile)) {
    throw new Error('--profile must be full or render')
  }

  return parsed
}

function requireValue(argv, index, flag) {
  const value = argv[index]
  if (!value) throw new Error(`${flag} requires a value`)
  return value
}

function printHelp() {
  console.log(`Usage: npm run gis:download -- [options]

Download I3S resources into an ignored local snapshot directory.

Options:
  --source <id>       ${Object.keys(gisSources).join(' | ')}
  --max-nodes <n>     Download the first n mesh nodes as a layout PoC
  --all               Download every mesh node
  --output <path>     Output directory (default: data/raw/<source>)
  --concurrency <n>   Concurrent node downloads (default: 4)
  --timeout-ms <n>    Timeout for each request (default: 30000)
  --force             Download resources again instead of resuming
  --profile <name>    full or render; render keeps only shared and compressed geometry
  --help              Show this message`)
}
