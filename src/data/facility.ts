import { a1Profile } from './buildingProfiles'

// Backwards-compatible A1 exports for tests and integrations that still use the original module.
export const floors = a1Profile.floors
export const initialAlerts = a1Profile.alerts
export const initialTelemetry = a1Profile.telemetry
export const powerTrend = a1Profile.powerTrend
