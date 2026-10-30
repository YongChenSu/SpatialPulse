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

const json = (response, status, data) => {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' })
  response.end(JSON.stringify(data))
}

const server = createServer((request, response) => {
  if (request.url === '/api/health') return json(response, 200, { status: 'ok', uptime: process.uptime() })
  if (request.url === '/api/floors') return json(response, 200, floors)
  if (request.url === '/api/telemetry') return json(response, 200, telemetry)
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
