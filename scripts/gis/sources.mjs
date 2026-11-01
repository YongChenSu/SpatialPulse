export const gisSources = {
  'taipei-cadastral-2025': {
    id: 'taipei-cadastral-2025',
    label: 'Taipei cadastral buildings 2025',
    dataset: 'CB_2025_20250825',
    layerUrl: 'https://3d.land.gov.taipei/arcgis/rest/services/Hosted/CB_2025_20250825/SceneServer/layers/0',
    portalItemUrl: 'https://3d.land.gov.taipei/portal/sharing/rest/content/items/b9ea8f7384554ece85f6089ec0cdf789',
    role: 'interactive',
  },
  'taipei-lod1-2017': {
    id: 'taipei-lod1-2017',
    label: 'Taipei LOD1 context buildings 2017',
    dataset: 'LOD1_2017',
    layerUrl: 'https://historygis.udd.gov.taipei/arcgis/rest/services/Hosted/LOD1_2017/SceneServer/layers/0',
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
