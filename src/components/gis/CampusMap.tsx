import 'cesium/Build/Cesium/Widgets/widgets.css'
import {
  Cartesian2,
  Cartesian3,
  BoundingSphere,
  Color,
  ColorMaterialProperty,
  ConstantProperty,
  Credit,
  DistanceDisplayCondition,
  EllipsoidTerrainProvider,
  Entity,
  HorizontalOrigin,
  HeadingPitchRange,
  ImageryLayer,
  LabelStyle,
  Math as CesiumMath,
  NearFarScalar,
  PolygonHierarchy,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  UrlTemplateImageryProvider,
  VerticalOrigin,
  Viewer,
} from 'cesium'
import { useEffect, useRef } from 'react'
import { campusBuildings, mapAssets, siteBoundary } from '../../data/campus'
import { useGisStore } from '../../store/useGisStore'
import type { BuildingStatus, GisLayerId } from '../../types/gis'

const statusColors: Record<BuildingStatus, Color> = {
  normal: Color.fromCssColorString('#17b89b'),
  warning: Color.fromCssColorString('#f0a532'),
  critical: Color.fromCssColorString('#ed5d58'),
  offline: Color.fromCssColorString('#7d8b91'),
}

const operationalBuildingColor = Color.fromCssColorString('#0a6673')

const layerEntityPrefix: Record<Exclude<GisLayerId, 'buildings'>, string> = {
  alerts: 'alert',
  cctv: 'cctv',
  environment: 'environment',
  vehicles: 'vehicle',
}

export function CampusMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const handlerRef = useRef<ScreenSpaceEventHandler | null>(null)
  const imageryLayerRef = useRef<ImageryLayer | null>(null)
  const baseMap = useGisStore((state) => state.baseMap)
  const campusFocusRequest = useGisStore((state) => state.campusFocusRequest)
  const layers = useGisStore((state) => state.layers)
  const selectedBuildingId = useGisStore((state) => state.selectedBuildingId)
  const setSelectedBuildingId = useGisStore((state) => state.setSelectedBuildingId)

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

    viewer.entities.add({
      id: 'site-boundary',
      polygon: {
        hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(siteBoundary)),
        material: Color.fromCssColorString('#16bba1').withAlpha(0.025),
        outline: true,
        outlineColor: Color.fromCssColorString('#39e7ce').withAlpha(0.62),
      },
    })

    campusBuildings.forEach((building) => {
      const style = getBuildingStyle(building.status, false)
      viewer.entities.add({
        id: `building-${building.id}`,
        name: building.name,
        position: Cartesian3.fromDegrees(building.position.longitude, building.position.latitude, building.dimensions.height / 2),
        box: {
          dimensions: new Cartesian3(building.dimensions.width, building.dimensions.depth, building.dimensions.height),
          material: style.fill,
          outline: true,
          outlineColor: style.outline,
        },
        label: {
          text: building.openAlerts > 0 ? `${building.name}\n${building.openAlerts} 件未處理告警` : building.name,
          font: '600 13px sans-serif',
          fillColor: building.status === 'normal' ? Color.fromCssColorString('#d9ffff') : statusColors[building.status],
          outlineColor: Color.fromCssColorString('#07151f'),
          outlineWidth: 4,
          style: LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cartesian2(0, -building.dimensions.height * 0.65),
          verticalOrigin: VerticalOrigin.BOTTOM,
          horizontalOrigin: HorizontalOrigin.CENTER,
          scaleByDistance: new NearFarScalar(300, 1, 2200, 0.4),
          translucencyByDistance: new NearFarScalar(600, 1, 2400, 0),
          distanceDisplayCondition: new DistanceDisplayCondition(0, 1_850),
        },
        properties: { entityType: 'building', buildingId: building.id },
      })
    })

    mapAssets.forEach((asset) => {
      const isAlert = asset.type === 'alert'
      const colors = { alert: '#ff5b62', cctv: '#d655ff', environment: '#58d96d', vehicle: '#47bfff' }
      viewer.entities.add({
        id: `asset-${asset.id}`,
        name: asset.name,
        position: Cartesian3.fromDegrees(asset.position.longitude, asset.position.latitude, asset.position.height ?? 5),
        point: {
          pixelSize: isAlert ? 15 : 11,
          color: Color.fromCssColorString(colors[asset.type]),
          outlineColor: Color.WHITE,
          outlineWidth: 2,
          scaleByDistance: new NearFarScalar(200, 1.25, 2200, 0.5),
        },
        label: {
          text: asset.name,
          font: '500 12px sans-serif',
          fillColor: Color.WHITE,
          showBackground: true,
          backgroundColor: Color.fromCssColorString('#102734').withAlpha(0.86),
          backgroundPadding: new Cartesian2(7, 5),
          pixelOffset: new Cartesian2(0, -18),
          verticalOrigin: VerticalOrigin.BOTTOM,
          distanceDisplayCondition: new DistanceDisplayCondition(0, isAlert ? 1_500 : 850),
          scaleByDistance: new NearFarScalar(250, 1, 1600, 0.3),
        },
        properties: { entityType: asset.type, buildingId: asset.buildingId ?? null },
      })
    })

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas)
    handlerRef.current = handler
    handler.setInputAction((movement: { position: Cartesian2 }) => {
      const picked = viewer.scene.pick(movement.position) as { id?: Entity } | undefined
      const entity = picked?.id
      const id = entity?.id
      if (typeof id === 'string' && id.startsWith('building-')) {
        setSelectedBuildingId(id.replace('building-', ''))
      } else if (typeof id === 'string' && id.startsWith('asset-')) {
        const buildingId = entity?.properties?.buildingId?.getValue() as string | undefined
        if (buildingId) setSelectedBuildingId(buildingId)
      }
    }, ScreenSpaceEventType.LEFT_CLICK)

    flyToCampus(viewer, 0)

    return () => {
      handler.destroy()
      handlerRef.current = null
      viewerRef.current = null
      imageryLayerRef.current = null
      viewer.destroy()
    }
  }, [setSelectedBuildingId])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return
    if (imageryLayerRef.current) viewer.imageryLayers.remove(imageryLayerRef.current, true)

    const provider = baseMap === 'dark'
      ? new UrlTemplateImageryProvider({
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          subdomains: ['a', 'b', 'c', 'd'],
          maximumLevel: 20,
          credit: '© OpenStreetMap contributors © CARTO',
        })
      : new UrlTemplateImageryProvider({
          url: `https://wmts.nlsc.gov.tw/wmts/${baseMap === 'orthophoto' ? 'PHOTO2' : 'EMAP'}/default/GoogleMapsCompatible/{z}/{y}/{x}`,
          maximumLevel: 19,
          credit: new Credit('內政部國土測繪中心'),
        })

    const imageryLayer = viewer.imageryLayers.addImageryProvider(provider, 0)
    if (baseMap === 'dark') {
      imageryLayer.brightness = 0.68
      imageryLayer.contrast = 1.15
      imageryLayer.saturation = 0.35
      imageryLayer.gamma = 0.9
    } else if (baseMap === 'orthophoto') {
      imageryLayer.brightness = 0.54
      imageryLayer.contrast = 1.08
      imageryLayer.saturation = 0.42
      imageryLayer.alpha = 0.86
    } else {
      imageryLayer.brightness = 0.66
      imageryLayer.contrast = 1.04
      imageryLayer.saturation = 0.18
      imageryLayer.alpha = 0.9
    }
    imageryLayerRef.current = imageryLayer
    viewer.scene.requestRender()
  }, [baseMap])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return
    campusBuildings.forEach((building) => {
      const entity = viewer.entities.getById(`building-${building.id}`)
      if (entity) entity.show = layers.buildings
    })
    Object.entries(layerEntityPrefix).forEach(([layer, prefix]) => {
      mapAssets.filter((asset) => asset.type === prefix).forEach((asset) => {
        const entity = viewer.entities.getById(`asset-${asset.id}`)
        if (entity) entity.show = layers[layer as keyof typeof layerEntityPrefix]
      })
    })
    viewer.scene.requestRender()
  }, [layers])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return
    campusBuildings.forEach((item) => {
      const entity = viewer.entities.getById(`building-${item.id}`)
      if (!entity?.box) return
      const style = getBuildingStyle(item.status, item.id === selectedBuildingId)
      entity.box.material = new ColorMaterialProperty(style.fill)
      entity.box.outlineColor = new ConstantProperty(style.outline)
    })
    viewer.scene.requestRender()
    if (!selectedBuildingId) return
    const building = campusBuildings.find((item) => item.id === selectedBuildingId)
    if (!building) return
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(building.position.longitude - 0.0012, building.position.latitude - 0.0013, 360),
      orientation: { heading: CesiumMath.toRadians(20), pitch: CesiumMath.toRadians(-34), roll: 0 },
      duration: 1.2,
    })
  }, [selectedBuildingId])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || campusFocusRequest === 0) return
    flyToCampus(viewer, 1.2)
  }, [campusFocusRequest])

  return <div ref={containerRef} className="campus-map" aria-label="台北南港智慧園區 GIS 地圖" />
}

function getBuildingStyle(status: BuildingStatus, selected: boolean) {
  const statusColor = statusColors[status]
  if (selected) {
    return {
      fill: statusColor.withAlpha(0.82),
      outline: Color.WHITE.withAlpha(0.95),
    }
  }
  return {
    fill: operationalBuildingColor.withAlpha(status === 'offline' ? 0.48 : 0.86),
    outline: status === 'normal'
      ? Color.fromCssColorString('#31c9c2').withAlpha(0.5)
      : statusColor.brighten(0.18, new Color()).withAlpha(1),
  }
}

function flyToCampus(viewer: Viewer, duration: number) {
  const bounds = BoundingSphere.fromPoints(campusBuildings.map((building) => Cartesian3.fromDegrees(
    building.position.longitude,
    building.position.latitude,
    building.dimensions.height,
  )))
  viewer.camera.flyToBoundingSphere(bounds, {
    duration,
    offset: new HeadingPitchRange(CesiumMath.toRadians(8), CesiumMath.toRadians(-42), 1_050),
  })
}
