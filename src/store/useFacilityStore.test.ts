import { beforeEach, describe, expect, it } from 'vitest'
import { initialAlerts, initialTelemetry } from '../data/facility'
import { useFacilityStore } from './useFacilityStore'

describe('facility store', () => {
  beforeEach(() => useFacilityStore.setState({ selectedFloor: 'all', activeLayer: 'environment', telemetry: initialTelemetry, alerts: initialAlerts }))

  it('keeps scene and panels on the same selected floor', () => {
    useFacilityStore.getState().setSelectedFloor('3f')
    expect(useFacilityStore.getState().selectedFloor).toBe('3f')
  })

  it('acknowledges an active alert without removing its history', () => {
    useFacilityStore.getState().acknowledgeAlert('ALT-2048')
    const alert = useFacilityStore.getState().alerts.find((item) => item.id === 'ALT-2048')
    expect(alert?.acknowledged).toBe(true)
    expect(useFacilityStore.getState().alerts).toHaveLength(3)
  })
})
