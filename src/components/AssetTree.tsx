import { Building2, ChevronDown, ChevronRight, Layers3, Server } from 'lucide-react'
import { floors } from '../data/facility'
import { useFacilityStore } from '../store/useFacilityStore'

export function AssetTree() {
  const selected = useFacilityStore((state) => state.selectedFloor)
  const select = useFacilityStore((state) => state.setSelectedFloor)

  return (
    <aside className="asset-tree panel">
      <div className="panel__title"><div><small>ASSET EXPLORER</small><h2>資產導覽</h2></div><button aria-label="收合"><ChevronRight size={16} /></button></div>
      <div className="site-select"><span className="site-icon"><Building2 size={18} /></span><div><b>台北 A1 數據中心</b><small>南港園區 · Building A</small></div><ChevronDown size={15} /></div>
      <div className="tree">
        <button className={selected === 'all' ? 'selected' : ''} onClick={() => select('all')}>
          <ChevronDown size={15} /><Layers3 size={16} /><span>全棟建築</span><em>4</em>
        </button>
        <div className="tree__children">
          {floors.map((floor) => (
            <button key={floor.id} className={selected === floor.id ? 'selected' : ''} onClick={() => select(floor.id)}>
              <Server size={15} /><span><b>{floor.label}</b><small>{floor.area}</small></span><i className={`status status--${floor.status}`} />
            </button>
          ))}
        </div>
      </div>
      <div className="asset-summary">
        <div><span>設備總數</span><b>128</b></div><div><span>運作中</span><b className="text-green">124</b></div><div><span>需注意</span><b className="text-amber">4</b></div>
      </div>
    </aside>
  )
}
