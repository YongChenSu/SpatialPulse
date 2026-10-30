import type { Alert, Floor, Telemetry } from '../types'

export const floors: Floor[] = [
  { id: '4f', label: '4F', area: '網路與備援區', temperature: 23.1, humidity: 48, load: 61, status: 'normal' },
  { id: '3f', label: '3F', area: '主機房 B', temperature: 26.8, humidity: 56, load: 84, status: 'warning' },
  { id: '2f', label: '2F', area: '主機房 A', temperature: 22.8, humidity: 51, load: 73, status: 'normal' },
  { id: '1f', label: '1F', area: '電力與冷卻區', temperature: 22.4, humidity: 49, load: 68, status: 'normal' },
]

export const initialAlerts: Alert[] = [
  { id: 'ALT-2048', floorId: '3f', asset: 'CRAC-03', message: '回風溫度超過警戒值', time: '2 分鐘前', status: 'critical', acknowledged: false },
  { id: 'ALT-2047', floorId: '3f', asset: 'Rack B-12', message: '機櫃負載達 84%', time: '8 分鐘前', status: 'warning', acknowledged: false },
  { id: 'ALT-2043', floorId: '1f', asset: 'UPS-02', message: '電池健康度建議檢查', time: '36 分鐘前', status: 'warning', acknowledged: true },
]

export const initialTelemetry: Telemetry = {
  pue: 1.38,
  power: 842,
  cooling: 286,
  capacity: 72,
  uptime: 99.99,
  updatedAt: new Date().toISOString(),
}

export const powerTrend = [612, 640, 628, 676, 702, 735, 780, 802, 776, 824, 842, 831]
