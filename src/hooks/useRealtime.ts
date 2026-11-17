import { useEffect } from 'react'
import { useFacilityStore } from '../store/useFacilityStore'
import type { FacilityProfile, Telemetry } from '../types'

export function useRealtime(profile: FacilityProfile) {
  const updateTelemetry = useFacilityStore((state) => state.updateTelemetry)

  useEffect(() => {
    let socket: WebSocket | undefined
    let fallbackTimer: number | undefined

    const startFallback = () => {
      if (fallbackTimer) return
      fallbackTimer = window.setInterval(() => {
        const current = useFacilityStore.getState().telemetry
        updateTelemetry({
          ...current,
          power: Math.max(profile.simulation.powerFloor, Math.round(current.power + (Math.random() - 0.48) * 18)),
          cooling: Math.max(profile.simulation.coolingFloor, Math.round(current.cooling + (Math.random() - 0.5) * 8)),
          pue: Number(Math.min(profile.simulation.pueRange[1], Math.max(profile.simulation.pueRange[0], current.pue + (Math.random() - 0.5) * 0.02)).toFixed(2)),
          updatedAt: new Date().toISOString(),
        })
      }, 3000)
    }

    if (!profile.simulation.websocket) {
      startFallback()
    } else {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        socket = new WebSocket(`${protocol}//${window.location.host}/ws`)
        socket.onmessage = (event) => updateTelemetry(JSON.parse(event.data) as Telemetry)
        socket.onerror = startFallback
        socket.onclose = startFallback
      } catch {
        startFallback()
      }
    }

    const connectionTimeout = window.setTimeout(() => {
      if (profile.simulation.websocket && (!socket || socket.readyState !== WebSocket.OPEN)) startFallback()
    }, 1200)

    return () => {
      window.clearTimeout(connectionTimeout)
      if (fallbackTimer) window.clearInterval(fallbackTimer)
      socket?.close()
    }
  }, [profile, updateTelemetry])
}
