import type { CameraScale, GisLayerId } from '../../../types/gis'
import type { CityLayerContext, CityLayerFactory, CityLayerRuntime } from './types'

export class CesiumLayerManager {
  private readonly factories = new Map<GisLayerId, CityLayerFactory>()
  private readonly runtimes = new Map<GisLayerId, CityLayerRuntime>()
  private readonly desiredVisibility = new Map<GisLayerId, boolean>()
  private readonly loaded = new Set<GisLayerId>()
  private readonly loading = new Map<GisLayerId, Promise<void>>()
  private cameraScale: CameraScale = 'district'
  private destroyed = false

  constructor(private readonly context: CityLayerContext) {}

  register(id: GisLayerId, factory: CityLayerFactory) {
    this.factories.set(id, factory)
  }

  async setVisible(id: GisLayerId, visible: boolean) {
    if (this.destroyed) return
    this.desiredVisibility.set(id, visible)

    const existing = this.runtimes.get(id)
    if (!visible) {
      existing?.setVisible(false)
      return
    }

    const runtime = existing ?? this.createRuntime(id)
    if (!this.loaded.has(id)) {
      const pending = this.loading.get(id) ?? runtime.load(this.context)
        .then(() => {
          if (!this.destroyed && this.runtimes.get(id) === runtime) this.loaded.add(id)
        })
        .finally(() => { this.loading.delete(id) })
      this.loading.set(id, pending)
      await pending
    }
    if (this.destroyed || this.runtimes.get(id) !== runtime) return
    runtime.setCameraScale?.(this.cameraScale)
    runtime.setVisible(this.desiredVisibility.get(id) === true)
  }

  setCameraScale(scale: CameraScale) {
    this.cameraScale = scale
    this.runtimes.forEach((runtime) => runtime.setCameraScale?.(scale))
  }

  release(id: GisLayerId) {
    this.desiredVisibility.set(id, false)
    const runtime = this.runtimes.get(id)
    if (!runtime) return
    runtime.destroy()
    this.runtimes.delete(id)
    this.loaded.delete(id)
    this.loading.delete(id)
  }

  destroy() {
    if (this.destroyed) return
    this.destroyed = true
    this.runtimes.forEach((runtime) => runtime.destroy())
    this.runtimes.clear()
    this.desiredVisibility.clear()
    this.loaded.clear()
    this.loading.clear()
  }

  private createRuntime(id: GisLayerId) {
    const factory = this.factories.get(id)
    if (!factory) throw new Error(`GIS layer is not registered: ${id}`)
    const runtime = factory()
    this.runtimes.set(id, runtime)
    return runtime
  }
}
