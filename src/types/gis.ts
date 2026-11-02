export type BuildingStatus = 'normal' | 'warning' | 'critical' | 'offline'
export type GisLayerId = 'contextBuildings' | 'officialBuildings'
export type BaseMapId = 'neutral' | 'context' | 'orthophoto'
export type OfficialBuildingsStatus = 'idle' | 'loading' | 'ready' | 'error'
export type CameraScale = 'city' | 'district' | 'building'

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

export interface OfficialBuildingSelection {
  objectId: string | null
  address: string | null
  floor: string | null
  floorCount: number | null
  floorElevation: number | null
  floorHeight: number | null
  heightSource: string | null
  usage: string | null
  material: string | null
  completedAt: string | null
}
