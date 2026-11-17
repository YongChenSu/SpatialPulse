import { describe, expect, it } from 'vitest'
import { resolveCameraScale } from './cameraScalePolicy'

describe('camera scale policy', () => {
  it('maps camera height to city information scales', () => {
    expect(resolveCameraScale(8_000)).toBe('city')
    expect(resolveCameraScale(2_400)).toBe('district')
    expect(resolveCameraScale(300)).toBe('building')
  })
})
