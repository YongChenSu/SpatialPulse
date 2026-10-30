import { Box, ChartNoAxesCombined, CircleGauge, LayoutDashboard, Settings, ShieldCheck, Zap } from 'lucide-react'

const items = [
  { icon: LayoutDashboard, label: '總覽' },
  { icon: Box, label: '數位孿生', active: true },
  { icon: Zap, label: '能源' },
  { icon: ChartNoAxesCombined, label: '分析' },
  { icon: ShieldCheck, label: '維運' },
]

export function NavRail() {
  return (
    <nav className="nav-rail" aria-label="主要導覽">
      <div>
        {items.map(({ icon: Icon, label, active }) => (
          <button key={label} className={active ? 'active' : ''} title={label} aria-label={label}>
            <Icon size={19} /><span>{label}</span>
          </button>
        ))}
      </div>
      <div>
        <button title="系統狀態" aria-label="系統狀態"><CircleGauge size={19} /><span>系統</span></button>
        <button title="設定" aria-label="設定"><Settings size={19} /><span>設定</span></button>
      </div>
    </nav>
  )
}
