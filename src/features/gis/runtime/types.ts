import type { Viewer } from 'cesium'
import type { CameraScale } from '../../../types/gis'

export interface CityLayerContext {
  viewer: Viewer
}

export interface CityLayerRuntime {
  load: (context: CityLayerContext) => Promise<void>
  setVisible: (visible: boolean) => void
  setCameraScale?: (scale: CameraScale) => void
  destroy: () => void
}

export type CityLayerFactory = () => CityLayerRuntime
