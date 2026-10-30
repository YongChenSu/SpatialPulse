import { createServer } from 'node:http'
import { WebSocketServer } from 'ws'

const port = Number(process.env.PORT || 8787)
let telemetry = { pue: 1.38, power: 842, cooling: 286, capacity: 72, uptime: 99.99, updatedAt: new Date().toISOString() }

const floors = [
  { id: '4f', label: '4F', area: '網路與備援區', temperature: 23.1, humidity: 48, load: 61, status: 'normal' },
  { id: '3f', label: '3F', area: '主機房 B', temperature: 26.8, humidity: 56, load: 84, status: 'warning' },
  { id: '2f', label: '2F', area: '主機房 A', temperature: 22.8, humidity: 51, load: 73, status: 'normal' },
  { id: '1f', label: '1F', area: '電力與冷卻區', temperature: 22.4, humidity: 49, load: 68, status: 'normal' },
]

const site = {
  id: 'nangang-campus', name: '台北南港智慧園區', location: '台北市南港區經貿二路',
  center: { longitude: 121.6144, latitude: 25.0574, height: 0 },
  area: 48600, buildingCount: 5, deviceCount: 638, onlineRate: 98.4,
}

const buildings = [
  { id: 'a1', siteId: site.id, name: 'A1 數據中心', type: 'Data Center', position: { longitude: 121.61365, latitude: 25.05725 }, dimensions: { width: 96, depth: 52, height: 58 }, heading: 12, status: 'warning', healthScore: 92, power: 842, todayEnergy: 12840, onlineRate: 98.4, openAlerts: 2, floors: 4 },
  { id: 'a2', siteId: site.id, name: 'A2 研發大樓', type: 'R&D Office', position: { longitude: 121.61485, latitude: 25.05765 }, dimensions: { width: 78, depth: 46, height: 76 }, heading: 12, status: 'normal', healthScore: 97, power: 516, todayEnergy: 7820, onlineRate: 99.2, openAlerts: 0, floors: 16 },
  { id: 'b1', siteId: site.id, name: 'B1 營運中心', type: 'Operations', position: { longitude: 121.61565, latitude: 25.05665 }, dimensions: { width: 110, depth: 60, height: 48 }, heading: 12, status: 'normal', healthScore: 95, power: 438, todayEnergy: 6640, onlineRate: 99.8, openAlerts: 0, floors: 10 },
  { id: 'c1', siteId: site.id, name: 'C1 智慧工廠', type: 'Smart Factory', position: { longitude: 121.61395, latitude: 25.05615 }, dimensions: { width: 130, depth: 68, height: 32 }, heading: 12, status: 'critical', healthScore: 78, power: 1126, todayEnergy: 16920, onlineRate: 95.1, openAlerts: 4, floors: 5 },
  { id: 'p1', siteId: site.id, name: '能源與停車中心', type: 'Energy Center', position: { longitude: 121.6155, latitude: 25.05805 }, dimensions: { width: 88, depth: 50, height: 24 }, heading: 12, status: 'normal', healthScore: 96, power: 286, todayEnergy: 4360, onlineRate: 99.6, openAlerts: 0, floors: 3 },
]

const json = (response, status, data) => {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' })
  response.end(JSON.stringify(data))
}

const server = createServer((request, response) => {
  if (request.url === '/api/health') return json(response, 200, { status: 'ok', uptime: process.uptime() })
  if (request.url === '/api/floors') return json(response, 200, floors)
  if (request.url === '/api/telemetry') return json(response, 200, telemetry)
  if (request.url === '/api/sites') return json(response, 200, [site])
  if (request.url === `/api/sites/${site.id}`) return json(response, 200, site)
  if (request.url === `/api/sites/${site.id}/buildings`) return json(response, 200, buildings)
  const buildingMatch = request.url?.match(/^\/api\/buildings\/([^/?]+)$/)
  if (buildingMatch) {
    const building = buildings.find((item) => item.id === buildingMatch[1])
    return building ? json(response, 200, building) : json(response, 404, { error: 'Building not found' })
  }
  return json(response, 404, { error: 'Not found' })
})

const wss = new WebSocketServer({ server, path: '/ws' })
const timer = setInterval(() => {
  telemetry = {
    ...telemetry,
    power: Math.max(760, Math.round(telemetry.power + (Math.random() - 0.48) * 18)),
    cooling: Math.max(250, Math.round(telemetry.cooling + (Math.random() - 0.5) * 8)),
    pue: Number(Math.min(1.46, Math.max(1.3, telemetry.pue + (Math.random() - 0.5) * 0.02)).toFixed(2)),
    updatedAt: new Date().toISOString(),
  }
  const payload = JSON.stringify(telemetry)
  wss.clients.forEach((client) => { if (client.readyState === 1) client.send(payload) })
}, 3000)

server.listen(port, () => console.log(`NEXUS FM API listening on http://localhost:${port}`))
server.on('close', () => clearInterval(timer))
