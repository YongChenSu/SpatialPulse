import { Box, ChartNoAxesCombined, CircleGauge, Map, Settings, ShieldCheck, Zap } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const items = [
  { icon: Map, label: '園區總覽', path: '/gis' },
  { icon: Box, label: '數位孿生', path: '/buildings/a1/twin' },
  { icon: Zap, label: '能源' },
  { icon: ChartNoAxesCombined, label: '分析' },
  { icon: ShieldCheck, label: '維運' },
]

export function NavRail() {
  const location = useLocation()
  return (
    <nav className="nav-rail" aria-label="主要導覽">
      <div>
        {items.map(({ icon: Icon, label, path }) => path ? (
          <Link key={label} className={location.pathname === path || (path.includes('twin') && location.pathname.includes('/twin')) ? 'active' : ''} title={label} aria-label={label} to={path}>
            <Icon size={19} /><span>{label}</span>
          </Link>
        ) : (
          <button key={label} title={label} aria-label={label}><Icon size={19} /><span>{label}</span></button>
        ))}
      </div>
      <div>
        <button title="系統狀態" aria-label="系統狀態"><CircleGauge size={19} /><span>系統</span></button>
        <button title="設定" aria-label="設定"><Settings size={19} /><span>設定</span></button>
      </div>
    </nav>
  )
}
