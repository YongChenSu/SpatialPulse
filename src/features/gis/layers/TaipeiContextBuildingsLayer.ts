import { Cesium3DTileStyle, I3SDataProvider, type Viewer } from 'cesium'
import type { CameraScale } from '../../../types/gis'
import type { CityLayerContext, CityLayerRuntime } from '../runtime/types'
import { createTaipeiContextBuildingsProvider } from '../services/taipeiContextBuildings'

const screenSpaceErrorByScale: Record<CameraScale, number> = {
  city: 56,
  district: 40,
  building: 30,
}

export class TaipeiContextBuildingsLayer implements CityLayerRuntime {
  private viewer: Viewer | null = null
  private provider: I3SDataProvider | null = null
  private loadPromise: Promise<void> | null = null
  private destroyed = false
  private cameraScale: CameraScale = 'district'

  load(context: CityLayerContext) {
    if (this.provider) return Promise.resolve()
    if (this.loadPromise) return this.loadPromise
    this.viewer = context.viewer
    this.loadPromise = this.createProvider().catch((error) => {
      this.loadPromise = null
      throw error
    })
    return this.loadPromise
  }

  setVisible(visible: boolean) {
    if (!this.provider) return
    this.provider.show = visible
    this.viewer?.scene.requestRender()
  }

  setCameraScale(scale: CameraScale) {
    this.cameraScale = scale
    this.provider?.layers.forEach((layer) => {
      if (layer.tileset) layer.tileset.maximumScreenSpaceError = screenSpaceErrorByScale[scale]
    })
    this.viewer?.scene.requestRender()
  }

  destroy() {
    this.destroyed = true
    const provider = this.provider
    const viewer = this.viewer
    this.provider = null
    this.viewer = null
    if (!provider) return
    if (viewer && !viewer.isDestroyed()) {
      viewer.scene.primitives.remove(provider)
      return
    }
    provider.destroy()
  }

  private async createProvider() {
    const provider = await createTaipeiContextBuildingsProvider()
    if (this.destroyed || !this.viewer || this.viewer.isDestroyed()) {
      provider.destroy()
      return
    }
    provider.layers.forEach((layer) => {
      if (!layer.tileset) return
      layer.tileset.style = new Cesium3DTileStyle({ color: "color('#6c8790', 0.42)" })
      layer.tileset.maximumScreenSpaceError = screenSpaceErrorByScale[this.cameraScale]
    })
    this.provider = provider
    this.viewer.scene.primitives.add(provider)
    this.viewer.scene.requestRender()
  }
}
