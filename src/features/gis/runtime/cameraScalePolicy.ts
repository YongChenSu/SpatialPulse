import type { Viewer } from 'cesium'
import type { CameraScale } from '../../../types/gis'

export function resolveCameraScale(height: number): CameraScale {
  if (height >= 5_000) return 'city'
  if (height >= 650) return 'district'
  return 'building'
}

export function observeCameraScale(viewer: Viewer, onChange: (scale: CameraScale) => void) {
  let previous: CameraScale | undefined
  const update = () => {
    const next = resolveCameraScale(viewer.camera.positionCartographic.height)
    if (next === previous) return
    previous = next
    onChange(next)
  }

  viewer.camera.percentageChanged = 0.08
  const removeListener = viewer.camera.changed.addEventListener(update)
  update()
  return removeListener
}
