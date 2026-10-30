import { Box, Camera, Fan, Leaf, Maximize2, RotateCcw, ShieldCheck, Zap } from 'lucide-react'
import type { Layer } from '../types'
import { useFacilityStore } from '../store/useFacilityStore'

const layers: { id: Layer; label: string; icon: typeof Leaf }[] = [
  { id: 'environment', label: '環境', icon: Leaf },
  { id: 'power', label: '電力', icon: Zap },
  { id: 'cooling', label: '冷卻', icon: Fan },
  { id: 'security', label: '安防', icon: ShieldCheck },
]

export function SceneToolbar() {
  const active = useFacilityStore((state) => state.activeLayer)
  const setActive = useFacilityStore((state) => state.setActiveLayer)
  return (
    <>
      <div className="scene-toolbar">
        <span><Box size={16} />顯示圖層</span>
        {layers.map(({ id, label, icon: Icon }) => <button key={id} className={active === id ? 'active' : ''} onClick={() => setActive(id)}><Icon size={15} />{label}</button>)}
      </div>
      <div className="scene-actions"><button aria-label="重設視角"><RotateCcw size={17} /></button><button aria-label="擷取畫面"><Camera size={17} /></button><button aria-label="全螢幕"><Maximize2 size={17} /></button></div>
      <div className="scene-help"><span>拖曳旋轉</span><i /> <span>滾輪縮放</span></div>
    </>
  )
}
