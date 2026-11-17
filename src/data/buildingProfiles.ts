import type { FacilityProfile } from '../types'

const updatedAt = () => new Date().toISOString()

export const a1Profile: FacilityProfile = {
  id: 'a1',
  kind: 'data-center',
  name: '台北 A1 數據中心',
  campus: '台北南港園區',
  subtitle: '南港園區 · Building A',
  operatingMode: 'N+1 備援運作中',
  dataProvenance: 'DEMO FACILITY DATA',
  storeys: { aboveGround: 4, basement: 0 },
  floors: [
    { id: '4f', label: '4F', area: '網路與備援區', temperature: 23.1, humidity: 48, load: 61, status: 'normal' },
    { id: '3f', label: '3F', area: '主機房 B', temperature: 26.8, humidity: 56, load: 84, status: 'warning' },
    { id: '2f', label: '2F', area: '主機房 A', temperature: 22.8, humidity: 51, load: 73, status: 'normal' },
    { id: '1f', label: '1F', area: '電力與冷卻區', temperature: 22.4, humidity: 49, load: 68, status: 'normal' },
  ],
  assetSummary: { total: 128, operating: 124, attention: 4 },
  health: { score: 92, status: '系統運作正常', delta: '較上週提升 2.4%' },
  telemetry: { pue: 1.38, power: 842, cooling: 286, capacity: 72, uptime: 99.99, updatedAt: updatedAt() },
  alerts: [
    { id: 'ALT-2048', floorId: '3f', asset: 'CRAC-03', message: '回風溫度超過警戒值', time: '2 分鐘前', status: 'critical', acknowledged: false },
    { id: 'ALT-2047', floorId: '3f', asset: 'Rack B-12', message: '機櫃負載達 84%', time: '8 分鐘前', status: 'warning', acknowledged: false },
    { id: 'ALT-2043', floorId: '1f', asset: 'UPS-02', message: '電池健康度建議檢查', time: '36 分鐘前', status: 'warning', acknowledged: true },
  ],
  powerTrend: [612, 640, 628, 676, 702, 735, 780, 802, 776, 824, 842, 831],
  simulation: { powerFloor: 760, coolingFloor: 250, pueRange: [1.3, 1.46], websocket: true },
}

export const chonghongCloudProfile: FacilityProfile = {
  id: 'chonghong-cloud',
  kind: 'office-tower',
  name: '長虹雲端科技大樓',
  campus: '台北內湖科技園區',
  subtitle: '潭美街 533–539 號 · 110使字84',
  operatingMode: '智慧樓宇節能排程中',
  dataProvenance: 'PUBLIC PROFILE · CONCEPT MODEL · SIMULATED OPERATIONS',
  storeys: { aboveGround: 30, basement: 4 },
  floors: [
    { id: '30f', label: '30F', area: '空中會議與主管層', temperature: 23.8, humidity: 51, load: 64, status: 'normal' },
    { id: '24f', label: '24F', area: '辦公區 D', temperature: 24.2, humidity: 54, load: 72, status: 'normal' },
    { id: '18f', label: '18F', area: '辦公區 C', temperature: 26.4, humidity: 61, load: 88, status: 'warning' },
    { id: '12f', label: '12F', area: '辦公區 B', temperature: 23.6, humidity: 52, load: 69, status: 'normal' },
    { id: '6f', label: '6F', area: '辦公區 A', temperature: 23.9, humidity: 50, load: 66, status: 'normal' },
    { id: '1f', label: '1F', area: '迎賓大廳與商業空間', temperature: 24.5, humidity: 57, load: 77, status: 'normal' },
    { id: 'b1', label: 'B1', area: '停車與充電設施', temperature: 25.1, humidity: 63, load: 71, status: 'normal' },
    { id: 'b4', label: 'B4', area: '中央機電與消防設備', temperature: 27.2, humidity: 58, load: 91, status: 'warning' },
  ],
  assetSummary: { total: 286, operating: 279, attention: 7 },
  health: { score: 89, status: '整體營運穩定', delta: '較上週提升 1.6%' },
  telemetry: { pue: 4.72, power: 1680, cooling: 612, capacity: 68, uptime: 99.94, updatedAt: updatedAt() },
  alerts: [
    { id: 'CH-3108', floorId: '18f', asset: 'AHU-18-02', message: '送風溫度高於節能設定', time: '4 分鐘前', status: 'warning', acknowledged: false },
    { id: 'CH-3107', floorId: 'b4', asset: 'CHWP-B4-01', message: '冰水泵振動值接近警戒線', time: '11 分鐘前', status: 'critical', acknowledged: false },
    { id: 'CH-3099', floorId: 'b1', asset: 'EV-ZONE-C', message: '充電區尖峰負載已完成移轉', time: '42 分鐘前', status: 'warning', acknowledged: true },
  ],
  powerTrend: [1180, 1240, 1312, 1390, 1478, 1540, 1624, 1718, 1762, 1720, 1680, 1652],
  simulation: { powerFloor: 1450, coolingFloor: 520, pueRange: [4.45, 4.95], websocket: false },
}

export const facilityProfiles: Record<string, FacilityProfile> = {
  [a1Profile.id]: a1Profile,
  [chonghongCloudProfile.id]: chonghongCloudProfile,
}

export function getFacilityProfile(buildingId?: string) {
  return buildingId ? facilityProfiles[buildingId] : undefined
}
