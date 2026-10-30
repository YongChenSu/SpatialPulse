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
