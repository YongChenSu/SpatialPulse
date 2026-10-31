import { describe, expect, it, vi } from 'vitest'
import type { Viewer } from 'cesium'
import { CesiumLayerManager } from './CesiumLayerManager'
import type { CityLayerRuntime } from './types'

function createRuntime(): CityLayerRuntime {
  return {
    load: vi.fn().mockResolvedValue(undefined),
    setVisible: vi.fn(),
    setCameraScale: vi.fn(),
    destroy: vi.fn(),
  }
}

describe('CesiumLayerManager', () => {
  it('loads a layer only when it first becomes visible', async () => {
    const runtime = createRuntime()
    const manager = new CesiumLayerManager({ viewer: {} as Viewer })
    manager.register('officialBuildings', () => runtime)

    await manager.setVisible('officialBuildings', true)
    await manager.setVisible('officialBuildings', true)

    expect(runtime.load).toHaveBeenCalledOnce()
    expect(runtime.setVisible).toHaveBeenLastCalledWith(true)
  })

  it('keeps a layer hidden when visibility changes during loading', async () => {
    let finishLoading: (() => void) | undefined
    const runtime = createRuntime()
    runtime.load = vi.fn(() => new Promise<void>((resolve) => { finishLoading = resolve }))
    const manager = new CesiumLayerManager({ viewer: {} as Viewer })
    manager.register('officialBuildings', () => runtime)

    const loading = manager.setVisible('officialBuildings', true)
    await manager.setVisible('officialBuildings', false)
    finishLoading?.()
    await loading

    expect(runtime.setVisible).toHaveBeenLastCalledWith(false)
  })

  it('propagates camera scale and destroys released layers', async () => {
    const runtime = createRuntime()
    const manager = new CesiumLayerManager({ viewer: {} as Viewer })
    manager.register('officialBuildings', () => runtime)
    await manager.setVisible('officialBuildings', true)

    manager.setCameraScale('building')
    manager.release('officialBuildings')

    expect(runtime.setCameraScale).toHaveBeenLastCalledWith('building')
    expect(runtime.destroy).toHaveBeenCalledOnce()
  })
})
