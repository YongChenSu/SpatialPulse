import { create } from 'zustand'
import { a1Profile } from '../data/buildingProfiles'
import type { Alert, Layer, Telemetry } from '../types'

interface FacilityState {
  selectedFloor: string
  activeLayer: Layer
  telemetry: Telemetry
  alerts: Alert[]
  facilityId: string
  setSelectedFloor: (id: string) => void
  setActiveLayer: (layer: Layer) => void
  updateTelemetry: (data: Telemetry) => void
  acknowledgeAlert: (id: string) => void
  loadFacility: (facilityId: string, telemetry: Telemetry, alerts: Alert[]) => void
}

export const useFacilityStore = create<FacilityState>((set) => ({
  selectedFloor: 'all',
  activeLayer: 'environment',
  telemetry: a1Profile.telemetry,
  alerts: a1Profile.alerts,
  facilityId: a1Profile.id,
  setSelectedFloor: (selectedFloor) => set({ selectedFloor }),
  setActiveLayer: (activeLayer) => set({ activeLayer }),
  updateTelemetry: (telemetry) => set({ telemetry }),
  acknowledgeAlert: (id) => set((state) => ({
    alerts: state.alerts.map((alert) => alert.id === id ? { ...alert, acknowledged: true } : alert),
  })),
  loadFacility: (facilityId, telemetry, alerts) => set({
    facilityId,
    selectedFloor: 'all',
    activeLayer: 'environment',
    telemetry: { ...telemetry, updatedAt: new Date().toISOString() },
    alerts: alerts.map((alert) => ({ ...alert })),
  }),
}))
