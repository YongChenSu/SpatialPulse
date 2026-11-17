import { describe, expect, it } from 'vitest'
import {
  TAIPEI_CONTEXT_BUILDINGS_DATASET,
  TAIPEI_CONTEXT_BUILDINGS_I3S_URL,
  TAIPEI_CONTEXT_BUILDINGS_OFFICIAL_I3S_URL,
} from './taipeiContextBuildings'

describe('Taipei context building source', () => {
  it('uses the current NLSC Taipei building scene layer by default', () => {
    expect(TAIPEI_CONTEXT_BUILDINGS_DATASET).toBe('114_A')
    expect(TAIPEI_CONTEXT_BUILDINGS_OFFICIAL_I3S_URL)
      .toBe('https://i3s.nlsc.gov.tw/building/i3s/SceneServer/layers/30')
    expect(TAIPEI_CONTEXT_BUILDINGS_I3S_URL)
      .toBe(TAIPEI_CONTEXT_BUILDINGS_OFFICIAL_I3S_URL)
  })
})
