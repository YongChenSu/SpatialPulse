import { Building2 } from 'lucide-react'
import type { GisLayerId } from '../../../types/gis'

export interface CityLayerDefinition {
  id: GisLayerId
  label: string
  description: string
  group: 'official'
  sourceType: 'i3s'
  source: string
  defaultVisible: boolean
  loadOnDemand: boolean
  icon: typeof Building2
  badge: string
}

export const cityLayerCatalog: readonly CityLayerDefinition[] = [
  {
    id: 'contextBuildings',
    label: '全市背景建物',
    description: '國土測繪中心 2025 臺北市分棟建物模型',
    group: 'official',
    sourceType: 'i3s',
    source: '國土測繪中心 · 114_A（2025）',
    defaultVisible: true,
    loadOnDemand: false,
    icon: Building2,
    badge: '2025',
  },
  {
    id: 'officialBuildings',
    label: '2025 產權建物',
    description: '臺北市 2025 三維產權建物 Scene Layer',
    group: 'official',
    sourceType: 'i3s',
    source: '臺北市政府 · CB_2025_20250825',
    defaultVisible: true,
    loadOnDemand: false,
    icon: Building2,
    badge: 'I3S',
  },
]

export const defaultCityLayerVisibility = Object.fromEntries(
  cityLayerCatalog.map((layer) => [layer.id, layer.defaultVisible]),
) as Record<GisLayerId, boolean>
