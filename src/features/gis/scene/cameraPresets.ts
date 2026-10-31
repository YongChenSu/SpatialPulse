import { Cartesian3, Math as CesiumMath, type Viewer } from 'cesium'

export const NANGANG_CITY_VIEW = {
  longitude: 121.615,
  latitude: 25.0568,
  height: 2_400,
  heading: 8,
  pitch: -48,
} as const

export function flyToNangangCity(viewer: Viewer, duration: number) {
  const view = {
    destination: Cartesian3.fromDegrees(
      NANGANG_CITY_VIEW.longitude,
      NANGANG_CITY_VIEW.latitude,
      NANGANG_CITY_VIEW.height,
    ),
    orientation: {
      heading: CesiumMath.toRadians(NANGANG_CITY_VIEW.heading),
      pitch: CesiumMath.toRadians(NANGANG_CITY_VIEW.pitch),
      roll: 0,
    },
  }
  if (duration === 0) {
    viewer.camera.setView(view)
    return
  }
  viewer.camera.flyTo({ ...view, duration })
}
