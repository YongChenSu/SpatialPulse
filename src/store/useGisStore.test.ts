import { beforeEach, describe, expect, it } from 'vitest'
import { useGisStore } from './useGisStore'

describe('GIS interaction store', () => {
  beforeEach(() => useGisStore.setState({
    selectedBuildingId: null,
    baseMap: 'dark',
    campusFocusRequest: 0,
    layers: { buildings: true, alerts: true, cctv: false, environment: false, vehicles: false },
  }))

  it('keeps the selected map building available to the detail panel', () => {
    useGisStore.getState().setSelectedBuildingId('a1')
    expect(useGisStore.getState().selectedBuildingId).toBe('a1')
  })

  it('toggles one map layer without changing the others', () => {
    useGisStore.getState().toggleLayer('cctv')
    expect(useGisStore.getState().layers.cctv).toBe(true)
    expect(useGisStore.getState().layers.alerts).toBe(true)
  })

  it('switches between official and operational base maps', () => {
    useGisStore.getState().setBaseMap('orthophoto')
    expect(useGisStore.getState().baseMap).toBe('orthophoto')
  })

  it('clears building selection when returning to the campus view', () => {
    useGisStore.setState({ selectedBuildingId: 'a1' })
    useGisStore.getState().focusCampus()
    expect(useGisStore.getState().selectedBuildingId).toBeNull()
    expect(useGisStore.getState().campusFocusRequest).toBe(1)
  })
})
