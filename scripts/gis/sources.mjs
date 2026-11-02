export const gisSources = {
  'taipei-cadastral-2025': {
    id: 'taipei-cadastral-2025',
    label: 'Taipei cadastral buildings 2025',
    dataset: 'CB_2025_20250825',
    layerUrl: 'https://3d.land.gov.taipei/arcgis/rest/services/Hosted/CB_2025_20250825/SceneServer/layers/0',
    portalItemUrl: 'https://3d.land.gov.taipei/portal/sharing/rest/content/items/b9ea8f7384554ece85f6089ec0cdf789',
    role: 'interactive',
  },
  'taipei-buildings-2025-nlsc': {
    id: 'taipei-buildings-2025-nlsc',
    label: 'NLSC Taipei individual building model 2025',
    dataset: '114_A',
    layerUrl: 'https://i3s.nlsc.gov.tw/building/i3s/SceneServer/layers/30',
    role: 'context',
  },
}

export function getGisSource(id) {
  const source = gisSources[id]

  if (!source) {
    const choices = Object.keys(gisSources).join(', ')
    throw new Error(`Unknown GIS source "${id}". Available sources: ${choices}`)
  }

  return source
}
