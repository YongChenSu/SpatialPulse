import { I3SDataProvider } from 'cesium'

export const TAIPEI_CONTEXT_BUILDINGS_DATASET = '114_A'
export const TAIPEI_CONTEXT_BUILDINGS_OFFICIAL_I3S_URL =
  'https://i3s.nlsc.gov.tw/building/i3s/SceneServer/layers/30'
export const TAIPEI_CONTEXT_BUILDINGS_I3S_URL = import.meta.env.VITE_TAIPEI_CONTEXT_I3S_URL?.trim()
  || TAIPEI_CONTEXT_BUILDINGS_OFFICIAL_I3S_URL

export function createTaipeiContextBuildingsProvider() {
  return I3SDataProvider.fromUrl(TAIPEI_CONTEXT_BUILDINGS_I3S_URL, {
    showFeatures: false,
    applySymbology: false,
    cesium3dTilesetOptions: {
      maximumScreenSpaceError: 40,
    },
  })
}
