import type { CampusBuilding, MapAsset, Site } from '../types/gis'

export const campus: Site = {
  id: 'nangang-campus',
  name: '台北南港智慧園區',
  location: '台北市南港區經貿二路',
  center: { longitude: 121.6144, latitude: 25.0574, height: 0 },
  area: 48600,
  buildingCount: 5,
  deviceCount: 638,
  onlineRate: 98.4,
}

export const campusBuildings: CampusBuilding[] = [
  { id: 'a1', siteId: campus.id, name: 'A1 數據中心', type: 'Data Center', position: { longitude: 121.61365, latitude: 25.05725 }, dimensions: { width: 96, depth: 52, height: 58 }, heading: 12, status: 'warning', healthScore: 92, power: 842, todayEnergy: 12840, onlineRate: 98.4, openAlerts: 2, floors: 4 },
  { id: 'a2', siteId: campus.id, name: 'A2 研發大樓', type: 'R&D Office', position: { longitude: 121.61485, latitude: 25.05765 }, dimensions: { width: 78, depth: 46, height: 76 }, heading: 12, status: 'normal', healthScore: 97, power: 516, todayEnergy: 7820, onlineRate: 99.2, openAlerts: 0, floors: 16 },
  { id: 'b1', siteId: campus.id, name: 'B1 營運中心', type: 'Operations', position: { longitude: 121.61565, latitude: 25.05665 }, dimensions: { width: 110, depth: 60, height: 48 }, heading: 12, status: 'normal', healthScore: 95, power: 438, todayEnergy: 6640, onlineRate: 99.8, openAlerts: 0, floors: 10 },
  { id: 'c1', siteId: campus.id, name: 'C1 智慧工廠', type: 'Smart Factory', position: { longitude: 121.61395, latitude: 25.05615 }, dimensions: { width: 130, depth: 68, height: 32 }, heading: 12, status: 'critical', healthScore: 78, power: 1126, todayEnergy: 16920, onlineRate: 95.1, openAlerts: 4, floors: 5 },
  { id: 'p1', siteId: campus.id, name: '能源與停車中心', type: 'Energy Center', position: { longitude: 121.6155, latitude: 25.05805 }, dimensions: { width: 88, depth: 50, height: 24 }, heading: 12, status: 'normal', healthScore: 96, power: 286, todayEnergy: 4360, onlineRate: 99.6, openAlerts: 0, floors: 3 },
]

export const mapAssets: MapAsset[] = [
  { id: 'alert-crac-03', buildingId: 'a1', type: 'alert', name: 'CRAC-03 回風溫度過高', position: { longitude: 121.61373, latitude: 25.05728, height: 70 }, status: 'critical' },
  { id: 'alert-line-02', buildingId: 'c1', type: 'alert', name: '產線 02 能耗異常', position: { longitude: 121.61402, latitude: 25.05618, height: 42 }, status: 'critical' },
  { id: 'cctv-north', type: 'cctv', name: '北側入口 CCTV', position: { longitude: 121.6141, latitude: 25.05825, height: 8 }, status: 'normal' },
  { id: 'cctv-south', type: 'cctv', name: '南側入口 CCTV', position: { longitude: 121.6151, latitude: 25.0559, height: 8 }, status: 'normal' },
  { id: 'env-east', type: 'environment', name: '東側環境站', position: { longitude: 121.61615, latitude: 25.05735, height: 5 }, status: 'normal' },
  { id: 'vehicle-01', type: 'vehicle', name: '巡檢車 01', position: { longitude: 121.61475, latitude: 25.05685, height: 2 }, status: 'normal' },
]

export const siteBoundary = [
  121.61275, 25.05575,
  121.61635, 25.05575,
  121.61635, 25.05855,
  121.61275, 25.05855,
]
