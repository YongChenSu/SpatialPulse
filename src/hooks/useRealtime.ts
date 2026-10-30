import { useEffect } from 'react'
import { useFacilityStore } from '../store/useFacilityStore'
import type { Telemetry } from '../types'

export function useRealtime() {
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
          power: Math.max(760, Math.round(current.power + (Math.random() - 0.48) * 18)),
          cooling: Math.max(250, Math.round(current.cooling + (Math.random() - 0.5) * 8)),
          pue: Number(Math.min(1.46, Math.max(1.3, current.pue + (Math.random() - 0.5) * 0.02)).toFixed(2)),
          updatedAt: new Date().toISOString(),
        })
      }, 3000)
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      socket = new WebSocket(`${protocol}//${window.location.host}/ws`)
      socket.onmessage = (event) => updateTelemetry(JSON.parse(event.data) as Telemetry)
      socket.onerror = startFallback
      socket.onclose = startFallback
    } catch {
      startFallback()
    }

    const connectionTimeout = window.setTimeout(() => {
      if (!socket || socket.readyState !== WebSocket.OPEN) startFallback()
    }, 1200)

    return () => {
      window.clearTimeout(connectionTimeout)
      if (fallbackTimer) window.clearInterval(fallbackTimer)
      socket?.close()
    }
  }, [updateTelemetry])
}
