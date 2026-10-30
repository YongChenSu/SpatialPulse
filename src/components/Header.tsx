import { Bell, ChevronDown, CloudSun, Command, Search } from 'lucide-react'

export function Header() {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand__mark"><Command size={18} /></span>
        <span>NEXUS <b>FM</b></span>
      </div>
      <label className="search">
        <Search size={16} />
        <input aria-label="全站搜尋" placeholder="搜尋設備、空間或告警" />
        <kbd>⌘ K</kbd>
      </label>
      <div className="topbar__actions">
        <span className="weather"><CloudSun size={19} /><b>26°C</b><small>台北</small></span>
        <button className="icon-button" aria-label="通知"><Bell size={18} /><i /></button>
        <button className="user"><span>YS</span><div><b>楊舜元</b><small>系統管理員</small></div><ChevronDown size={14} /></button>
      </div>
    </header>
  )
}
