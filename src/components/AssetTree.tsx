import { Building2, ChevronDown, ChevronRight, Layers3, Server } from 'lucide-react'
import { useFacilityStore } from '../store/useFacilityStore'
import type { FacilityProfile } from '../types'

export function AssetTree({ profile }: { profile: FacilityProfile }) {
  const selected = useFacilityStore((state) => state.selectedFloor)
  const select = useFacilityStore((state) => state.setSelectedFloor)

  return (
    <aside className="asset-tree panel">
      <div className="panel__title"><div><small>ASSET EXPLORER</small><h2>資產導覽</h2></div><button aria-label="收合"><ChevronRight size={16} /></button></div>
      <div className="site-select"><span className="site-icon"><Building2 size={18} /></span><div><b>{profile.name}</b><small>{profile.subtitle}</small></div><ChevronDown size={15} /></div>
      <div className="tree">
        <button className={selected === 'all' ? 'selected' : ''} onClick={() => select('all')}>
          <ChevronDown size={15} /><Layers3 size={16} /><span>全棟建築</span><em>{profile.storeys.aboveGround + profile.storeys.basement}</em>
        </button>
        <div className="tree__children">
          {profile.floors.map((floor) => (
            <button key={floor.id} className={selected === floor.id ? 'selected' : ''} onClick={() => select(floor.id)}>
              <Server size={15} /><span><b>{floor.label}</b><small>{floor.area}</small></span><i className={`status status--${floor.status}`} />
            </button>
          ))}
        </div>
      </div>
      <div className="asset-summary">
        <div><span>設備總數</span><b>{profile.assetSummary.total}</b></div><div><span>運作中</span><b className="text-green">{profile.assetSummary.operating}</b></div><div><span>需注意</span><b className="text-amber">{profile.assetSummary.attention}</b></div>
      </div>
    </aside>
  )
}
