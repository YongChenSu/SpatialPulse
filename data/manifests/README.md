# GIS manifests

This directory contains small, reviewable metadata generated from upstream GIS services. Raw I3S nodes, processed tiles and publish artifacts are intentionally excluded from Git.

Generate or refresh an inventory:

```bash
npm run gis:inventory -- --source taipei-cadastral-2025
npm run gis:inventory -- --source taipei-lod1-2017
```

The reported feature and vertex totals include repeated representations across levels of detail. They describe rendering workload, not the number of unique buildings.

Validate the snapshot resource layout with a small ignored download:

```bash
npm run gis:download -- --source taipei-cadastral-2025 --max-nodes 2
```

Use `--all` only after reviewing the inventory. Partial PoC snapshots are not directly renderable because their node hierarchy has not been spatially pruned and republished.
