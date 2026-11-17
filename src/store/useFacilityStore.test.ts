import { beforeEach, describe, expect, it } from 'vitest'
import { a1Profile, chonghongCloudProfile } from '../data/buildingProfiles'
import { useFacilityStore } from './useFacilityStore'

describe('facility store', () => {
  beforeEach(() => useFacilityStore.getState().loadFacility(a1Profile.id, a1Profile.telemetry, a1Profile.alerts))

  it('keeps scene and panels on the same selected floor', () => {
    useFacilityStore.getState().setSelectedFloor('3f')
    expect(useFacilityStore.getState().selectedFloor).toBe('3f')
  })

  it('resets transient state when switching buildings', () => {
    useFacilityStore.getState().setSelectedFloor('3f')
    useFacilityStore.getState().loadFacility(chonghongCloudProfile.id, chonghongCloudProfile.telemetry, chonghongCloudProfile.alerts)

    expect(useFacilityStore.getState().facilityId).toBe('chonghong-cloud')
    expect(useFacilityStore.getState().selectedFloor).toBe('all')
    expect(useFacilityStore.getState().telemetry.power).toBe(1680)
    expect(useFacilityStore.getState().alerts[0].id).toBe('CH-3108')
  })

  it('acknowledges an active alert without removing its history', () => {
    useFacilityStore.getState().acknowledgeAlert('ALT-2048')
    const alert = useFacilityStore.getState().alerts.find((item) => item.id === 'ALT-2048')
    expect(alert?.acknowledged).toBe(true)
    expect(useFacilityStore.getState().alerts).toHaveLength(3)
  })
})
