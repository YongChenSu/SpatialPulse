import { beforeEach, describe, expect, it } from 'vitest'
import { useGisStore } from './useGisStore'

describe('GIS interaction store', () => {
  beforeEach(() => useGisStore.setState({
    selectedBuildingId: null,
    layers: { buildings: true, alerts: true, cctv: true, environment: true, vehicles: true },
  }))

  it('keeps the selected map building available to the detail panel', () => {
    useGisStore.getState().setSelectedBuildingId('a1')
    expect(useGisStore.getState().selectedBuildingId).toBe('a1')
  })

  it('toggles one map layer without changing the others', () => {
    useGisStore.getState().toggleLayer('cctv')
    expect(useGisStore.getState().layers.cctv).toBe(false)
    expect(useGisStore.getState().layers.alerts).toBe(true)
  })
})
