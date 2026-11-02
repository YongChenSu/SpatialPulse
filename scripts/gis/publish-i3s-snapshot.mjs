import { copyFile, link, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
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
const inputRoot = path.resolve(projectRoot, args.input ?? `data/raw/${source.id}`)
const outputRoot = path.resolve(projectRoot, args.output ?? `data/processed/${source.id}`)
const snapshot = JSON.parse(await readFile(path.join(inputRoot, 'snapshot.json'), 'utf8'))

if (!snapshot.complete || snapshot.failures?.length > 0) {
  throw new Error('Source snapshot is incomplete. Resume the download before publishing.')
}

if (await exists(outputRoot)) {
  if (!args.force) throw new Error(`Output already exists: ${outputRoot}. Pass --force to replace generated publish data.`)
  await rm(outputRoot, { recursive: true, force: true })
}

await cloneWithHardLinks(inputRoot, outputRoot)

const publication = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  source: source.id,
  dataset: source.dataset,
  sourceGeneratedAt: snapshot.generatedAt,
  entrypoint: '3dSceneLayer.json',
  routeShape: 'ArcGIS SceneServer compatible',
}

await writeFile(path.join(outputRoot, 'publication.json'), `${JSON.stringify(publication, null, 2)}\n`)
console.log(JSON.stringify({ output: path.relative(projectRoot, outputRoot), ...publication }, null, 2))

async function cloneWithHardLinks(sourceDirectory, destinationDirectory) {
  await mkdir(destinationDirectory, { recursive: true })

  for (const entry of await readdir(sourceDirectory, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDirectory, entry.name)
    const destinationPath = path.join(destinationDirectory, entry.name)

    if (entry.isDirectory()) {
      await cloneWithHardLinks(sourcePath, destinationPath)
      continue
    }

    if (!entry.isFile()) continue

    try {
      await link(sourcePath, destinationPath)
    } catch (error) {
      if (error.code !== 'EXDEV') throw error
      await copyFile(sourcePath, destinationPath)
    }
  }
}

async function exists(filePath) {
  try {
    await stat(filePath)
    return true
  } catch (error) {
    if (error.code === 'ENOENT') return false
    throw error
  }
}

function parseArgs(argv) {
  const parsed = {
    source: 'taipei-cadastral-2025',
    input: null,
    output: null,
    force: false,
    help: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--help' || arg === '-h') parsed.help = true
    else if (arg === '--source') parsed.source = requireValue(argv, ++index, arg)
    else if (arg === '--input') parsed.input = requireValue(argv, ++index, arg)
    else if (arg === '--output') parsed.output = requireValue(argv, ++index, arg)
    else if (arg === '--force') parsed.force = true
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
  console.log(`Usage: npm run gis:publish -- [options]

Create a publish directory from a complete validated snapshot.

Options:
  --source <id>       ${Object.keys(gisSources).join(' | ')}
  --input <path>      Source snapshot (default: data/raw/<source>)
  --output <path>     Publish directory (default: data/processed/<source>)
  --force             Replace an existing generated publish directory
  --help              Show this message`)
}
