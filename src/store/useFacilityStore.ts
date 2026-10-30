import { create } from 'zustand'
import { initialAlerts, initialTelemetry } from '../data/facility'
import type { Alert, Layer, Telemetry } from '../types'

interface FacilityState {
  selectedFloor: string
  activeLayer: Layer
  telemetry: Telemetry
  alerts: Alert[]
  setSelectedFloor: (id: string) => void
  setActiveLayer: (layer: Layer) => void
  updateTelemetry: (data: Telemetry) => void
  acknowledgeAlert: (id: string) => void
}

export const useFacilityStore = create<FacilityState>((set) => ({
  selectedFloor: 'all',
  activeLayer: 'environment',
  telemetry: initialTelemetry,
  alerts: initialAlerts,
  setSelectedFloor: (selectedFloor) => set({ selectedFloor }),
  setActiveLayer: (activeLayer) => set({ activeLayer }),
  updateTelemetry: (telemetry) => set({ telemetry }),
  acknowledgeAlert: (id) => set((state) => ({
    alerts: state.alerts.map((alert) => alert.id === id ? { ...alert, acknowledged: true } : alert),
  })),
}))
