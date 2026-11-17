import { useQuery } from '@tanstack/react-query'
import { campus, campusBuildings } from '../data/campus'
import type { CampusBuilding, Site } from '../types/gis'

interface CampusResponse {
  site: Site
  buildings: CampusBuilding[]
  source: 'api' | 'fallback'
}

async function getCampus(): Promise<CampusResponse> {
  try {
    const [siteResponse, buildingsResponse] = await Promise.all([
      fetch(`/api/sites/${campus.id}`),
      fetch(`/api/sites/${campus.id}/buildings`),
    ])
    if (!siteResponse.ok || !buildingsResponse.ok) throw new Error('Campus API unavailable')
    return {
      site: await siteResponse.json() as Site,
      buildings: await buildingsResponse.json() as CampusBuilding[],
      source: 'api',
    }
  } catch {
    return { site: campus, buildings: campusBuildings, source: 'fallback' }
  }
}

export function useCampusData() {
  return useQuery({
    queryKey: ['campus', campus.id],
    queryFn: getCampus,
    initialData: { site: campus, buildings: campusBuildings, source: 'fallback' },
  })
}
