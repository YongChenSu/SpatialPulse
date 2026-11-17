import 'cesium/Build/Cesium/Widgets/widgets.css'
import {
  Cartesian2,
  Color,
  EllipsoidTerrainProvider,
  ImageryLayer,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Viewer,
} from 'cesium'
import { useEffect, useRef } from 'react'
import { createBaseMapProvider, styleBaseMapLayer } from '../catalog/basemaps'
import { TaipeiContextBuildingsLayer } from '../layers/TaipeiContextBuildingsLayer'
import { TaipeiOfficialBuildingsLayer } from '../layers/TaipeiOfficialBuildingsLayer'
import { CesiumLayerManager } from '../runtime/CesiumLayerManager'
import { observeCameraScale } from '../runtime/cameraScalePolicy'
import { isPickedI3SFeature, readOfficialBuildingFeature } from '../services/taipeiBuildings'
import { useCitySceneStore } from '../store/useCitySceneStore'
import { flyToNangangCity } from './cameraPresets'

export function CityScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const imageryLayerRef = useRef<ImageryLayer | null>(null)
  const layerManagerRef = useRef<CesiumLayerManager | null>(null)
  const baseMap = useCitySceneStore((state) => state.baseMap)
  const areaFocusRequest = useCitySceneStore((state) => state.areaFocusRequest)
  const layers = useCitySceneStore((state) => state.layers)
  const setSelectedOfficialBuilding = useCitySceneStore((state) => state.setSelectedOfficialBuilding)
  const setOfficialBuildingsStatus = useCitySceneStore((state) => state.setOfficialBuildingsStatus)
  const officialBuildingsRequest = useCitySceneStore((state) => state.officialBuildingsRequest)
  const fallbackToNeutral = useCitySceneStore((state) => state.fallbackToNeutral)
  const setCameraScale = useCitySceneStore((state) => state.setCameraScale)

  useEffect(() => {
    if (!containerRef.current) return

    const viewer = new Viewer(containerRef.current, {
      baseLayer: false,
      terrainProvider: new EllipsoidTerrainProvider(),
      animation: false,
      timeline: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      baseLayerPicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      requestRenderMode: true,
      maximumRenderTimeChange: Infinity,
    })
    viewerRef.current = viewer
    viewer.scene.globe.enableLighting = true
    viewer.scene.globe.baseColor = Color.fromCssColorString('#0b1c28')
    viewer.scene.backgroundColor = Color.fromCssColorString('#07151f')
    viewer.scene.fog.enabled = true
    flyToNangangCity(viewer, 0)

    const layerManager = new CesiumLayerManager({ viewer })
    layerManager.register('contextBuildings', () => new TaipeiContextBuildingsLayer())
    layerManager.register('officialBuildings', () => new TaipeiOfficialBuildingsLayer())
    layerManagerRef.current = layerManager
    const stopObservingScale = observeCameraScale(viewer, (scale) => {
      setCameraScale(scale)
      layerManager.setCameraScale(scale)
    })

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas)
    handler.setInputAction((movement: { position: Cartesian2 }) => {
      const picked = viewer.scene.pick(movement.position)
      if (isPickedI3SFeature(picked)) {
        setSelectedOfficialBuilding(readOfficialBuildingFeature(picked))
      }
    }, ScreenSpaceEventType.LEFT_CLICK)

    return () => {
      handler.destroy()
      stopObservingScale()
      layerManager.destroy()
      viewerRef.current = null
      imageryLayerRef.current = null
      layerManagerRef.current = null
      viewer.destroy()
    }
  }, [setCameraScale, setSelectedOfficialBuilding])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return
    if (imageryLayerRef.current) {
      viewer.imageryLayers.remove(imageryLayerRef.current, true)
      imageryLayerRef.current = null
    }

    if (baseMap === 'neutral') {
      viewer.scene.requestRender()
      return
    }

    const provider = createBaseMapProvider(baseMap)
    if (!provider) return

    let active = true
    const removeErrorListener = provider.errorEvent.addEventListener(() => {
      if (active) fallbackToNeutral('官方圖資暫時無法載入，已切回中性城市模式')
    })
    const imageryLayer = viewer.imageryLayers.addImageryProvider(provider, 0)
    styleBaseMapLayer(imageryLayer, baseMap)
    imageryLayerRef.current = imageryLayer
    viewer.scene.requestRender()

    return () => {
      active = false
      removeErrorListener()
      if (!viewer.isDestroyed() && imageryLayerRef.current === imageryLayer) {
        viewer.imageryLayers.remove(imageryLayer, true)
        imageryLayerRef.current = null
      }
    }
  }, [baseMap, fallbackToNeutral])

  useEffect(() => {
    const layerManager = layerManagerRef.current
    if (!layerManager) return
    void layerManager.setVisible('contextBuildings', layers.contextBuildings)
      .catch((error: unknown) => {
        console.error('Unable to load Taipei LOD1 context buildings', error)
      })
  }, [layers.contextBuildings])

  useEffect(() => {
    const layerManager = layerManagerRef.current
    if (!layerManager) return

    if (!layers.officialBuildings) {
      void layerManager.setVisible('officialBuildings', false)
      return
    }

    let active = true
    let timedOut = false
    setOfficialBuildingsStatus('loading')
    const timeoutId = window.setTimeout(() => {
      if (!active) return
      timedOut = true
      layerManager.release('officialBuildings')
      setOfficialBuildingsStatus('error', '官方三維建物載入逾時，請稍後重試')
    }, 20_000)

    void layerManager.setVisible('officialBuildings', true)
      .then(() => {
        window.clearTimeout(timeoutId)
        if (!active || timedOut) return
        setOfficialBuildingsStatus('ready')
      })
      .catch((error: unknown) => {
        window.clearTimeout(timeoutId)
        if (!active || timedOut) return
        const message = error instanceof Error ? error.message : '無法載入臺北市官方三維建物'
        setOfficialBuildingsStatus('error', message)
      })

    return () => {
      active = false
      window.clearTimeout(timeoutId)
    }
  }, [layers.officialBuildings, officialBuildingsRequest, setOfficialBuildingsStatus])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || areaFocusRequest === 0) return
    flyToNangangCity(viewer, 1.2)
  }, [areaFocusRequest])

  return <div ref={containerRef} className="city-scene" aria-label="臺北市南港區三維城市場景" />
}
