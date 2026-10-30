import { create } from 'zustand'
import type { GisLayerId } from '../types/gis'

interface GisState {
  selectedBuildingId: string | null
  layers: Record<GisLayerId, boolean>
  setSelectedBuildingId: (id: string | null) => void
  toggleLayer: (id: GisLayerId) => void
}

export const useGisStore = create<GisState>((set) => ({
  selectedBuildingId: null,
  layers: { buildings: true, alerts: true, cctv: true, environment: true, vehicles: true },
  setSelectedBuildingId: (selectedBuildingId) => set({ selectedBuildingId }),
  toggleLayer: (id) => set((state) => ({ layers: { ...state.layers, [id]: !state.layers[id] } })),
}))
