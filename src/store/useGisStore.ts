import { create } from 'zustand'
import type { BaseMapId, GisLayerId } from '../types/gis'

interface GisState {
  selectedBuildingId: string | null
  baseMap: BaseMapId
  campusFocusRequest: number
  layers: Record<GisLayerId, boolean>
  setSelectedBuildingId: (id: string | null) => void
  setBaseMap: (id: BaseMapId) => void
  focusCampus: () => void
  toggleLayer: (id: GisLayerId) => void
}

export const useGisStore = create<GisState>((set) => ({
  selectedBuildingId: null,
  baseMap: 'dark',
  campusFocusRequest: 0,
  layers: { buildings: true, alerts: true, cctv: false, environment: false, vehicles: false },
  setSelectedBuildingId: (selectedBuildingId) => set({ selectedBuildingId }),
  setBaseMap: (baseMap) => set({ baseMap }),
  focusCampus: () => set((state) => ({ campusFocusRequest: state.campusFocusRequest + 1, selectedBuildingId: null })),
  toggleLayer: (id) => set((state) => ({ layers: { ...state.layers, [id]: !state.layers[id] } })),
}))
