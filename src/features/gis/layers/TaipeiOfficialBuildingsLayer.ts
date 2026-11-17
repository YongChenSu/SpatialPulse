import { Cesium3DTileStyle, I3SDataProvider, type Viewer } from 'cesium'
import type { CameraScale } from '../../../types/gis'
import { createTaipeiBuildingsProvider } from '../services/taipeiBuildings'
import type { CityLayerContext, CityLayerRuntime } from '../runtime/types'

const screenSpaceErrorByScale: Record<CameraScale, number> = {
  city: 36,
  district: 24,
  building: 12,
}

export class TaipeiOfficialBuildingsLayer implements CityLayerRuntime {
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
    const provider = await createTaipeiBuildingsProvider()
    if (this.destroyed || !this.viewer || this.viewer.isDestroyed()) {
      provider.destroy()
      return
    }
    provider.layers.forEach((layer) => {
      if (!layer.tileset) return
      layer.tileset.style = new Cesium3DTileStyle({ color: "color('#527d83', 0.72)" })
      layer.tileset.maximumScreenSpaceError = screenSpaceErrorByScale[this.cameraScale]
    })
    this.provider = provider
    this.viewer.scene.primitives.add(provider)
    this.viewer.scene.requestRender()
  }
}
