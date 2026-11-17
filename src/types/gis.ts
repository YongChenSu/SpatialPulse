export type BuildingStatus = 'normal' | 'warning' | 'critical' | 'offline'
export type GisLayerId = 'buildings' | 'alerts' | 'cctv' | 'environment' | 'vehicles'
export type BaseMapId = 'nlsc' | 'orthophoto' | 'dark'

export interface GeographicPosition {
  longitude: number
  latitude: number
  height?: number
}

export interface Site {
  id: string
  name: string
  location: string
  center: GeographicPosition
  area: number
  buildingCount: number
  deviceCount: number
  onlineRate: number
}

export interface CampusBuilding {
  id: string
  siteId: string
  name: string
  type: string
  position: GeographicPosition
  dimensions: { width: number; depth: number; height: number }
  heading: number
  status: BuildingStatus
  healthScore: number
  power: number
  todayEnergy: number
  onlineRate: number
  openAlerts: number
  floors: number
}

export interface MapAsset {
  id: string
  buildingId?: string
  type: 'alert' | 'cctv' | 'environment' | 'vehicle'
  name: string
  position: GeographicPosition
  status: BuildingStatus
}
