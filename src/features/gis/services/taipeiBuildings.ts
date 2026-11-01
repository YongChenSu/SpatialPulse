import { I3SDataProvider } from 'cesium'
import type { OfficialBuildingSelection } from '../../../types/gis'

export const TAIPEI_BUILDINGS_DATASET = 'CB_2025_20250825'
export const TAIPEI_BUILDINGS_I3S_URL = `https://3d.land.gov.taipei/arcgis/rest/services/Hosted/${TAIPEI_BUILDINGS_DATASET}/SceneServer/layers/0`

interface PickedI3SFeature {
  getProperty: (name: string) => unknown
}

export function isPickedI3SFeature(value: unknown): value is PickedI3SFeature {
  return typeof value === 'object' && value !== null && 'getProperty' in value
    && typeof (value as PickedI3SFeature).getProperty === 'function'
}

export function readOfficialBuildingFeature(feature: PickedI3SFeature): OfficialBuildingSelection {
  return {
    objectId: toText(feature.getProperty('OBJECTID')),
    address: toText(feature.getProperty('建物門牌')),
    floor: toText(feature.getProperty('層次')),
    floorCount: toNumber(feature.getProperty('層數')),
    floorElevation: toNumber(feature.getProperty('高度')),
    floorHeight: toNumber(feature.getProperty('樓層高度')),
    heightSource: toText(feature.getProperty('高度來源')),
    usage: toText(feature.getProperty('主要用途')),
    material: toText(feature.getProperty('主要建材')),
    completedAt: toText(feature.getProperty('建築完成日期')),
  }
}

export function createTaipeiBuildingsProvider() {
  return I3SDataProvider.fromUrl(TAIPEI_BUILDINGS_I3S_URL, {
    showFeatures: true,
    applySymbology: false,
    cesium3dTilesetOptions: {
      maximumScreenSpaceError: 24,
    },
  })
}

function toText(value: unknown) {
  if (value === undefined || value === null || value === '') return null
  return String(value)
}

function toNumber(value: unknown) {
  if (value === undefined || value === null || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}
