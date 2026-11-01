import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { getGisSource, gisSources } from './sources.mjs'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const args = parseArgs(process.argv.slice(2))
const requestTimeoutMs = args.timeoutMs

if (args.help) {
  printHelp()
  process.exit(0)
}

const source = getGisSource(args.source)
const layer = await fetchJson(source.layerUrl)
const nodesPerPage = layer.nodePages?.nodesPerPage

if (!nodesPerPage) {
  throw new Error(`${source.id} does not advertise I3S node pages`)
}

const nodeSummary = await inspectNodePages(source.layerUrl, nodesPerPage, args.maxPages)
const portalItem = source.portalItemUrl
  ? await fetchJson(`${source.portalItemUrl}?f=json`)
  : null

const inventory = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  source: {
    ...source,
    layerUrl: source.layerUrl,
  },
  service: {
    name: layer.name,
    layerType: layer.layerType,
    i3sVersion: layer.store?.version ?? null,
    updatedAt: toIsoDate(layer.serviceUpdateTimeStamp?.lastUpdate),
    capabilities: layer.capabilities ?? [],
    fullExtent: layer.fullExtent ?? null,
    fieldNames: (layer.fields ?? []).map((field) => field.name),
    portalItemSizeBytes: portalItem?.size ?? null,
    portalAccess: portalItem?.access ?? null,
    portalLicense: portalItem?.licenseInfo ?? null,
  },
  hierarchy: nodeSummary,
}

const outputPath = path.resolve(projectRoot, args.output ?? `data/manifests/${source.id}.inventory.json`)
await mkdir(path.dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(inventory, null, 2)}\n`)

console.log(JSON.stringify({
  source: source.id,
  output: path.relative(projectRoot, outputPath),
  pages: nodeSummary.pageCount,
  nodes: nodeSummary.nodeCount,
  meshNodes: nodeSummary.meshNodeCount,
  featuresAcrossLods: nodeSummary.featureCountAcrossLods,
  verticesAcrossLods: nodeSummary.vertexCountAcrossLods,
  portalItemSizeBytes: inventory.service.portalItemSizeBytes,
}, null, 2))

async function inspectNodePages(layerUrl, nodesPerPage, maxPages) {
  let page = 0
  let nodeCount = 0
  let meshNodeCount = 0
  let featureCountAcrossLods = 0
  let vertexCountAcrossLods = 0
  let maxNodeIndex = -1

  while (page < maxPages) {
    const response = await fetchWithRetry(`${layerUrl}/nodepages/${page}`, { allowNotFound: true })

    if (response === null) break

    const payload = await response.json()
    const nodes = payload.nodes

    if (!Array.isArray(nodes) || nodes.length === 0) break

    nodeCount += nodes.length

    for (const node of nodes) {
      maxNodeIndex = Math.max(maxNodeIndex, node.index ?? -1)

      if (!node.mesh) continue
      meshNodeCount += 1
      featureCountAcrossLods += node.mesh.geometry?.featureCount ?? 0
      vertexCountAcrossLods += node.mesh.geometry?.vertexCount ?? 0
    }

    page += 1
    if (nodes.length < nodesPerPage) break
  }

  if (page === maxPages) {
    throw new Error(`Stopped at --max-pages=${maxPages}; increase the safety limit to finish inventory`)
  }

  return {
    nodesPerPage,
    pageCount: page,
    nodeCount,
    meshNodeCount,
    maxNodeIndex,
    featureCountAcrossLods,
    vertexCountAcrossLods,
    note: 'Feature and vertex totals include multiple LOD representations and are not unique-building counts.',
  }
}

async function fetchJson(url) {
  const response = await fetchWithRetry(url)
  return response.json()
}

async function fetchWithRetry(url, options = {}) {
  const attempts = 3

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), requestTimeoutMs)

    try {
      const response = await fetch(url, {
        headers: {
          accept: 'application/json',
          origin: 'https://spatialpulse.app',
          'user-agent': 'SpatialPulse GIS inventory/0.1',
        },
        signal: controller.signal,
      })

      if (options.allowNotFound && response.status === 404) return null
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
      return response
    } catch (error) {
      if (attempt === attempts) {
        throw new Error(`Failed to fetch ${url}: ${error.message}`, { cause: error })
      }
    } finally {
      clearTimeout(timeout)
    }
  }
}

function parseArgs(argv) {
  const parsed = {
    source: 'taipei-cadastral-2025',
    output: null,
    maxPages: 10_000,
    timeoutMs: 30_000,
    help: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--help' || arg === '-h') parsed.help = true
    else if (arg === '--source') parsed.source = requireValue(argv, ++index, arg)
    else if (arg === '--output') parsed.output = requireValue(argv, ++index, arg)
    else if (arg === '--max-pages') parsed.maxPages = Number(requireValue(argv, ++index, arg))
    else if (arg === '--timeout-ms') parsed.timeoutMs = Number(requireValue(argv, ++index, arg))
    else throw new Error(`Unknown argument: ${arg}`)
  }

  if (!Number.isInteger(parsed.maxPages) || parsed.maxPages < 1) {
    throw new Error('--max-pages must be a positive integer')
  }

  if (!Number.isInteger(parsed.timeoutMs) || parsed.timeoutMs < 1_000) {
    throw new Error('--timeout-ms must be an integer of at least 1000')
  }

  return parsed
}

function requireValue(argv, index, flag) {
  const value = argv[index]
  if (!value) throw new Error(`${flag} requires a value`)
  return value
}

function toIsoDate(timestamp) {
  if (!timestamp) return null
  return new Date(timestamp).toISOString()
}

function printHelp() {
  console.log(`Usage: npm run gis:inventory -- [options]

Inspect an I3S service without downloading geometry or attributes.

Options:
  --source <id>       ${Object.keys(gisSources).join(' | ')}
  --output <path>     Output manifest path
  --max-pages <n>     Safety limit for node-page discovery (default: 10000)
  --timeout-ms <n>     Timeout for each upstream request (default: 30000)
  --help              Show this message`)
}
