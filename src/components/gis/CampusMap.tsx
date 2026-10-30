import 'cesium/Build/Cesium/Widgets/widgets.css'
import {
  Cartesian2,
  Cartesian3,
  Color,
  EllipsoidTerrainProvider,
  Entity,
  HorizontalOrigin,
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
  const layers = useGisStore((state) => state.layers)
  const selectedBuildingId = useGisStore((state) => state.selectedBuildingId)
  const setSelectedBuildingId = useGisStore((state) => state.setSelectedBuildingId)

  useEffect(() => {
    if (!containerRef.current) return

    const imageryProvider = new UrlTemplateImageryProvider({
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      subdomains: ['a', 'b', 'c', 'd'],
      maximumLevel: 20,
      credit: '© OpenStreetMap contributors © CARTO',
    })
    const viewer = new Viewer(containerRef.current, {
      baseLayer: new ImageryLayer(imageryProvider),
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
        material: Color.fromCssColorString('#16bba1').withAlpha(0.08),
        outline: true,
        outlineColor: Color.fromCssColorString('#39e7ce').withAlpha(0.8),
      },
    })

    campusBuildings.forEach((building) => {
      const color = statusColors[building.status]
      viewer.entities.add({
        id: `building-${building.id}`,
        name: building.name,
        position: Cartesian3.fromDegrees(building.position.longitude, building.position.latitude, building.dimensions.height / 2),
        box: {
          dimensions: new Cartesian3(building.dimensions.width, building.dimensions.depth, building.dimensions.height),
          material: color.withAlpha(0.72),
          outline: true,
          outlineColor: color.brighten(0.35, new Color()).withAlpha(0.95),
        },
        label: {
          text: `${building.name}\n${building.healthScore} 健康分`,
          font: '600 13px sans-serif',
          fillColor: Color.WHITE,
          outlineColor: Color.fromCssColorString('#07151f'),
          outlineWidth: 4,
          style: LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cartesian2(0, -building.dimensions.height * 0.65),
          verticalOrigin: VerticalOrigin.BOTTOM,
          horizontalOrigin: HorizontalOrigin.CENTER,
          scaleByDistance: new NearFarScalar(300, 1, 2200, 0.4),
          translucencyByDistance: new NearFarScalar(600, 1, 2400, 0),
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
          distanceDisplayCondition: undefined,
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

    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(121.6144, 25.0526, 1050),
      orientation: { heading: CesiumMath.toRadians(2), pitch: CesiumMath.toRadians(-42), roll: 0 },
      duration: 0,
    })

    return () => {
      handler.destroy()
      handlerRef.current = null
      viewerRef.current = null
      viewer.destroy()
    }
  }, [setSelectedBuildingId])

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
    if (!viewer || !selectedBuildingId) return
    const building = campusBuildings.find((item) => item.id === selectedBuildingId)
    if (!building) return
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(building.position.longitude - 0.0012, building.position.latitude - 0.0013, 360),
      orientation: { heading: CesiumMath.toRadians(20), pitch: CesiumMath.toRadians(-34), roll: 0 },
      duration: 1.2,
    })
  }, [selectedBuildingId])

  return <div ref={containerRef} className="campus-map" aria-label="台北南港智慧園區 GIS 地圖" />
}
