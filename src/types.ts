export type Status = 'normal' | 'warning' | 'critical'
export type Layer = 'power' | 'cooling' | 'security' | 'environment'

export interface Floor {
  id: string
  label: string
  area: string
  temperature: number
  humidity: number
  load: number
  status: Status
}

export interface Alert {
  id: string
  floorId: string
  asset: string
  message: string
  time: string
  status: Exclude<Status, 'normal'>
  acknowledged: boolean
}

export interface Telemetry {
  pue: number
  power: number
  cooling: number
  capacity: number
  uptime: number
  updatedAt: string
}

export type FacilityKind = 'data-center' | 'office-tower'

export interface FacilityProfile {
  id: string
  kind: FacilityKind
  name: string
  campus: string
  subtitle: string
  operatingMode: string
  dataProvenance: string
  floors: Floor[]
  storeys: { aboveGround: number; basement: number }
  assetSummary: { total: number; operating: number; attention: number }
  health: { score: number; status: string; delta: string }
  telemetry: Telemetry
  alerts: Alert[]
  powerTrend: number[]
  simulation: {
    powerFloor: number
    coolingFloor: number
    pueRange: [number, number]
    websocket: boolean
  }
}
