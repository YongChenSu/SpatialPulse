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
    id: 'officialBuildings',
    label: '臺北官方建物',
    description: '臺北市三維產權建物 Scene Layer',
    group: 'official',
    sourceType: 'i3s',
    source: '臺北市政府',
    defaultVisible: true,
    loadOnDemand: false,
    icon: Building2,
    badge: 'I3S',
  },
]

export const defaultCityLayerVisibility = Object.fromEntries(
  cityLayerCatalog.map((layer) => [layer.id, layer.defaultVisible]),
) as Record<GisLayerId, boolean>
