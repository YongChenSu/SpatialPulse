import { readdir, readFile, stat } from 'node:fs/promises'
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

const source = getGisSource(args.source)
const snapshotRoot = path.resolve(projectRoot, args.input ?? `data/raw/${source.id}`)
const layer = await readJson(path.join(snapshotRoot, '3dSceneLayer.json'))
const snapshot = await tryReadJson(path.join(snapshotRoot, 'snapshot.json'))
const resourceProfile = snapshot?.resourceProfile ?? 'full'
const pageFiles = await listNumericFiles(path.join(snapshotRoot, 'nodepages'))
const nodes = []

for (const pageFile of pageFiles) {
  const page = await readJson(path.join(snapshotRoot, 'nodepages', pageFile))
  nodes.push(...(page.nodes ?? []))
}

const meshNodes = nodes.filter((node) => node.mesh)
const nodesByIndex = new Map(nodes.map((node) => [node.index, node]))
const reachableNodeIndexes = collectReachableNodeIndexes(nodesByIndex)
const reachableMeshNodes = meshNodes.filter((node) => reachableNodeIndexes.has(node.index))
const missing = []
let resourceCount = 0
let resourceBytes = 0

for (const nodeSummary of reachableMeshNodes) {
  const resourceId = String(nodeSummary.mesh.geometry.resource)
  const nodeRoot = path.join(snapshotRoot, 'nodes', resourceId)
  const nodePath = path.join(nodeRoot, 'index.json')
  const node = await tryReadJson(nodePath)

  if (!node) {
    missing.push(path.relative(snapshotRoot, nodePath))
    continue
  }

  const hrefs = [
    node.sharedResource?.href,
    ...(resourceProfile === 'full' ? (node.featureData ?? []).map((resource) => resource.href) : []),
    ...geometryResourceHrefs(node, nodeSummary, layer, resourceProfile),
    ...(resourceProfile === 'full' ? (node.attributeData ?? []).map((resource) => resource.href) : []),
  ].filter(Boolean)

  for (const href of hrefs) {
    const resourcePath = path.join(nodeRoot, href.replace(/^\.\//, ''))
    const size = await fileSize(resourcePath)

    if (size === null || size === 0) {
      missing.push(path.relative(snapshotRoot, resourcePath))
      continue
    }

    resourceCount += 1
    resourceBytes += size
  }
}

const result = {
  source: source.id,
  i3sVersion: layer.store?.version ?? null,
  resourceProfile,
  pageCount: pageFiles.length,
  nodeCount: nodes.length,
  meshNodeCount: meshNodes.length,
  reachableNodeCount: reachableNodeIndexes.size,
  reachableMeshNodeCount: reachableMeshNodes.length,
  orphanNodeCount: nodes.length - reachableNodeIndexes.size,
  validResourceCount: resourceCount,
  validResourceBytes: resourceBytes,
  missingResourceCount: missing.length,
  complete: missing.length === 0,
  missing: missing.slice(0, 20),
}

console.log(JSON.stringify(result, null, 2))
if (!result.complete) process.exitCode = 1

function collectReachableNodeIndexes(nodesByIndex) {
  const reachable = new Set()
  const queue = [0]

  while (queue.length > 0) {
    const index = queue.shift()
    if (reachable.has(index)) continue

    const node = nodesByIndex.get(index)
    if (!node) continue

    reachable.add(index)
    queue.push(...(node.children ?? []))
  }

  return reachable
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

async function listNumericFiles(directory) {
  const entries = await readdir(directory)
  return entries
    .filter((entry) => /^\d+$/.test(entry))
    .sort((left, right) => Number(left) - Number(right))
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'))
}

async function tryReadJson(filePath) {
  try {
    return await readJson(filePath)
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw error
  }
}

async function fileSize(filePath) {
  try {
    return (await stat(filePath)).size
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw error
  }
}

function parseArgs(argv) {
  const parsed = {
    source: 'taipei-cadastral-2025',
    input: null,
    help: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--help' || arg === '-h') parsed.help = true
    else if (arg === '--source') parsed.source = requireValue(argv, ++index, arg)
    else if (arg === '--input') parsed.input = requireValue(argv, ++index, arg)
    else throw new Error(`Unknown argument: ${arg}`)
  }

  return parsed
}

function requireValue(argv, index, flag) {
  const value = argv[index]
  if (!value) throw new Error(`${flag} requires a value`)
  return value
}

function printHelp() {
  console.log(`Usage: npm run gis:validate -- [options]

Validate that every resource referenced by a local I3S snapshot exists.

Options:
  --source <id>       ${Object.keys(gisSources).join(' | ')}
  --input <path>      Snapshot directory (default: data/raw/<source>)
  --help              Show this message`)
}
