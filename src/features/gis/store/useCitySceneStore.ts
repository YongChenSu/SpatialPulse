import { create } from 'zustand'
import type { BaseMapId, CameraScale, GisLayerId, OfficialBuildingSelection, OfficialBuildingsStatus } from '../../../types/gis'
import { defaultCityLayerVisibility } from '../catalog/layerCatalog'

interface CitySceneState {
  selectedOfficialBuilding: OfficialBuildingSelection | null
  baseMap: BaseMapId
  baseMapError: string | null
  areaFocusRequest: number
  cameraScale: CameraScale
  layers: Record<GisLayerId, boolean>
  officialBuildingsStatus: OfficialBuildingsStatus
  officialBuildingsError: string | null
  officialBuildingsRequest: number
  setSelectedOfficialBuilding: (building: OfficialBuildingSelection | null) => void
  setBaseMap: (id: BaseMapId) => void
  fallbackToNeutral: (message: string) => void
  setOfficialBuildingsStatus: (status: OfficialBuildingsStatus, error?: string | null) => void
  retryOfficialBuildings: () => void
  focusArea: () => void
  setCameraScale: (scale: CameraScale) => void
  toggleLayer: (id: GisLayerId) => void
}

export const useCitySceneStore = create<CitySceneState>((set) => ({
  selectedOfficialBuilding: null,
  baseMap: 'context',
  baseMapError: null,
  areaFocusRequest: 0,
  cameraScale: 'district',
  layers: defaultCityLayerVisibility,
  officialBuildingsStatus: 'idle',
  officialBuildingsError: null,
  officialBuildingsRequest: 0,
  setSelectedOfficialBuilding: (selectedOfficialBuilding) => set({ selectedOfficialBuilding }),
  setBaseMap: (baseMap) => set({ baseMap, baseMapError: null }),
  fallbackToNeutral: (baseMapError) => set({ baseMap: 'neutral', baseMapError }),
  setOfficialBuildingsStatus: (officialBuildingsStatus, officialBuildingsError = null) => set({ officialBuildingsStatus, officialBuildingsError }),
  retryOfficialBuildings: () => set((state) => ({
    officialBuildingsRequest: state.officialBuildingsRequest + 1,
    officialBuildingsStatus: 'loading',
    officialBuildingsError: null,
  })),
  focusArea: () => set((state) => ({ areaFocusRequest: state.areaFocusRequest + 1, selectedOfficialBuilding: null })),
  setCameraScale: (cameraScale) => set({ cameraScale }),
  toggleLayer: (id) => set((state) => ({ layers: { ...state.layers, [id]: !state.layers[id] } })),
}))
