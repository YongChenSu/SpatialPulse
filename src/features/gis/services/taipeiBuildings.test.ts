import { describe, expect, it } from 'vitest'
import { isPickedI3SFeature, readOfficialBuildingFeature } from './taipeiBuildings'

function createFeature(properties: Record<string, unknown>) {
  return {
    getProperty: (name: string) => properties[name],
  }
}

describe('Taipei official building feature parsing', () => {
  it('keeps only the fields needed by the city building detail UI', () => {
    const feature = createFeature({
      OBJECTID: 42,
      建物門牌: '南港區範例路 1 號',
      層次: '三層',
      層數: '12',
      高度: '8.25',
      樓層高度: 3.4,
      高度來源: '建物測量成果',
      主要用途: '辦公室',
      主要建材: '鋼筋混凝土造',
      建築完成日期: '20200101',
      建號: 'must-not-be-exposed',
      地號: 'must-not-be-exposed',
    })

    expect(readOfficialBuildingFeature(feature)).toEqual({
      objectId: '42',
      address: '南港區範例路 1 號',
      floor: '三層',
      floorCount: 12,
      floorElevation: 8.25,
      floorHeight: 3.4,
      heightSource: '建物測量成果',
      usage: '辦公室',
      material: '鋼筋混凝土造',
      completedAt: '20200101',
    })
  })

  it('normalizes missing or invalid values', () => {
    const result = readOfficialBuildingFeature(createFeature({ 層數: 'unknown', 高度: '' }))

    expect(result.address).toBeNull()
    expect(result.floorCount).toBeNull()
    expect(result.floorElevation).toBeNull()
  })

  it('recognizes pickable I3S features safely', () => {
    expect(isPickedI3SFeature(createFeature({}))).toBe(true)
    expect(isPickedI3SFeature({ getProperty: 'nope' })).toBe(false)
    expect(isPickedI3SFeature(null)).toBe(false)
  })
})
