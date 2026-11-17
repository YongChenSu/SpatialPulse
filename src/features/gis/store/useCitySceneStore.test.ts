import { beforeEach, describe, expect, it } from 'vitest'
import { useCitySceneStore } from './useCitySceneStore'

describe('city scene interaction store', () => {
  beforeEach(() => useCitySceneStore.setState({
    selectedOfficialBuilding: null,
    baseMap: 'context',
    baseMapError: null,
    areaFocusRequest: 0,
    cameraScale: 'district',
    layers: { contextBuildings: true, officialBuildings: true },
    officialBuildingsStatus: 'idle',
    officialBuildingsError: null,
    officialBuildingsRequest: 0,
  }))

  it('toggles the official building layer', () => {
    useCitySceneStore.getState().toggleLayer('officialBuildings')
    expect(useCitySceneStore.getState().layers.officialBuildings).toBe(false)
  })

  it('toggles the citywide context building layer independently', () => {
    useCitySceneStore.getState().toggleLayer('contextBuildings')
    expect(useCitySceneStore.getState().layers.contextBuildings).toBe(false)
    expect(useCitySceneStore.getState().layers.officialBuildings).toBe(true)
  })

  it('switches between official city base maps', () => {
    useCitySceneStore.getState().setBaseMap('orthophoto')
    expect(useCitySceneStore.getState().baseMap).toBe('orthophoto')
  })

  it('tracks the current camera information scale', () => {
    useCitySceneStore.getState().setCameraScale('building')
    expect(useCitySceneStore.getState().cameraScale).toBe('building')
  })

  it('falls back to the neutral city scene when public imagery fails', () => {
    useCitySceneStore.getState().fallbackToNeutral('官方圖資暫時無法載入')
    expect(useCitySceneStore.getState().baseMap).toBe('neutral')
    expect(useCitySceneStore.getState().baseMapError).toBe('官方圖資暫時無法載入')
  })

  it('clears official selection when returning to the area view', () => {
    useCitySceneStore.setState({ selectedOfficialBuilding: {
      objectId: '42', address: null, floor: null, floorCount: null, floorElevation: null,
      floorHeight: null, heightSource: null, usage: null, material: null, completedAt: null,
    } })
    useCitySceneStore.getState().focusArea()
    expect(useCitySceneStore.getState().selectedOfficialBuilding).toBeNull()
    expect(useCitySceneStore.getState().areaFocusRequest).toBe(1)
  })

  it('keeps the selected official feature in city scene state', () => {
    useCitySceneStore.getState().setSelectedOfficialBuilding({
      objectId: '42', address: '臺北市南港區範例路 1 號', floor: '三層', floorCount: 12,
      floorElevation: 12.4, floorHeight: 3.6, heightSource: '使用執照', usage: '辦公室',
      material: '鋼筋混凝土造', completedAt: null,
    })
    expect(useCitySceneStore.getState().selectedOfficialBuilding?.objectId).toBe('42')
  })

  it('starts a new official building request after a recoverable error', () => {
    useCitySceneStore.setState({ officialBuildingsStatus: 'error', officialBuildingsError: 'timeout' })
    useCitySceneStore.getState().retryOfficialBuildings()

    expect(useCitySceneStore.getState().officialBuildingsRequest).toBe(1)
    expect(useCitySceneStore.getState().officialBuildingsStatus).toBe('loading')
    expect(useCitySceneStore.getState().officialBuildingsError).toBeNull()
  })
})
