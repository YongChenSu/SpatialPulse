import { Credit, ImageryLayer, UrlTemplateImageryProvider } from 'cesium'
import type { BaseMapId } from '../../../types/gis'

export const baseMapMetadata: Record<BaseMapId, { label: string; source: string; description: string }> = {
  neutral: {
    label: '中性城市圖',
    source: 'CITY SCENE · LOCAL GLOBE',
    description: '低干擾城市場景，不載入影像底圖',
  },
  context: {
    label: '地理位置圖',
    source: 'REAL-WORLD GIS · NLSC EMAP16',
    description: '圖資：內政部國土測繪中心',
  },
  orthophoto: {
    label: '正射影像',
    source: 'REAL-WORLD GIS · NLSC PHOTO2',
    description: '圖資：內政部國土測繪中心',
  },
}

export function createBaseMapProvider(baseMap: BaseMapId) {
  if (baseMap === 'neutral') return null

  const layer = baseMap === 'orthophoto' ? 'PHOTO2' : 'EMAP16'
  return new UrlTemplateImageryProvider({
    url: `https://wmts.nlsc.gov.tw/wmts/${layer}/default/GoogleMapsCompatible/{z}/{y}/{x}`,
    maximumLevel: 19,
    credit: new Credit('內政部國土測繪中心'),
  })
}

export function styleBaseMapLayer(layer: ImageryLayer, baseMap: Exclude<BaseMapId, 'neutral'>) {
  if (baseMap === 'orthophoto') {
    layer.brightness = 0.54
    layer.contrast = 1.08
    layer.saturation = 0.42
    layer.alpha = 0.86
    return
  }

  layer.brightness = 0.62
  layer.contrast = 1.04
  layer.saturation = 0.12
  layer.alpha = 0.88
}
