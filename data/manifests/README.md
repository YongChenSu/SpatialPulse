# GIS manifests

This directory contains small, reviewable metadata generated from upstream GIS services. Raw I3S nodes, processed tiles and publish artifacts are intentionally excluded from Git.

Generate or refresh an inventory:

```bash
npm run gis:inventory -- --source taipei-cadastral-2025
npm run gis:inventory -- --source taipei-buildings-2025-nlsc
```

The reported feature and vertex totals include repeated representations across levels of detail. They describe rendering workload, not the number of unique buildings.

Validate the snapshot resource layout with a small ignored download:

```bash
npm run gis:download -- --source taipei-cadastral-2025 --max-nodes 2
```

Use `--all` only after reviewing the inventory. Partial PoC snapshots are not directly renderable because their node hierarchy has not been spatially pruned and republished.

Complete downloads resume by default and write each resource atomically:

```bash
npm run gis:download -- --source taipei-cadastral-2025 --all
npm run gis:publish -- --source taipei-cadastral-2025 --force
npm run gis:validate -- --source taipei-cadastral-2025
npm run gis:serve -- --source taipei-cadastral-2025
```

Context-only layers that do not expose feature picking can use the smaller render profile:

```bash
npm run gis:download -- --source taipei-buildings-2025-nlsc --all --profile render --concurrency 2 --timeout-ms 60000
npm run gis:publish -- --source taipei-buildings-2025-nlsc --force
npm run gis:validate -- --source taipei-buildings-2025-nlsc
```

Serve the two snapshots independently and point Vite at both local origins:

```bash
npm run gis:serve -- --source taipei-cadastral-2025 --port 4174
npm run gis:serve -- --source taipei-buildings-2025-nlsc --port 4175
VITE_TAIPEI_BUILDINGS_I3S_URL=http://127.0.0.1:4174 \
VITE_TAIPEI_CONTEXT_I3S_URL=http://127.0.0.1:4175 \
npm run dev -- --host 127.0.0.1
```

The local servers emulate the ArcGIS SceneServer route shape. Production should expose the same routes from versioned CDN origins or an edge worker.
