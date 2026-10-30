import {
  Activity, AlertTriangle, Building2, Camera, ChevronRight, CircleDot,
  CloudSun, Database, Eye, Layers3, LocateFixed, MapPin, Radio,
  Server, Truck, Users, Video, Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { CampusMap } from '../components/gis/CampusMap'
import { Header } from '../components/Header'
import { NavRail } from '../components/NavRail'
import { useCampusData } from '../hooks/useCampusData'
import { useRealtime } from '../hooks/useRealtime'
import { useFacilityStore } from '../store/useFacilityStore'
import { useGisStore } from '../store/useGisStore'
import type { GisLayerId } from '../types/gis'

const layerOptions: { id: GisLayerId; label: string; icon: typeof Building2; count: number }[] = [
  { id: 'buildings', label: '3D 建築', icon: Building2, count: 5 },
  { id: 'alerts', label: '告警熱點', icon: AlertTriangle, count: 6 },
  { id: 'cctv', label: 'CCTV', icon: Video, count: 24 },
  { id: 'environment', label: '環境站', icon: CloudSun, count: 8 },
  { id: 'vehicles', label: '巡檢車', icon: Truck, count: 3 },
]

const statusLabel = { normal: '運作正常', warning: '需注意', critical: '嚴重異常', offline: '離線' }

export function GisPage() {
  useRealtime()
  const { data: campusData } = useCampusData()
  const { site, buildings } = campusData
  const selectedId = useGisStore((state) => state.selectedBuildingId)
  const selectBuilding = useGisStore((state) => state.setSelectedBuildingId)
  const layers = useGisStore((state) => state.layers)
  const toggleLayer = useGisStore((state) => state.toggleLayer)
  const telemetry = useFacilityStore((state) => state.telemetry)
  const selected = buildings.find((building) => building.id === selectedId)

  return (
    <div className="app-shell gis-shell">
      <Header />
      <NavRail />
      <main className="gis-main">
        <section className="gis-viewport">
          <CampusMap />

          <header className="gis-commandbar glass-panel">
            <div><small>SMART CAMPUS COMMAND CENTER</small><h1>{site.name}</h1><span><MapPin size={11} />{site.location}</span></div>
            <div className="gis-commandbar__status"><span><i />即時連線</span><b>{new Date(telemetry.updatedAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}</b></div>
            <button aria-label="定位園區"><LocateFixed size={17} />定位園區</button>
          </header>

          <aside className="gis-left-panel glass-panel">
            <div className="gis-panel-heading"><div><small>SITE EXPLORER</small><h2>園區資產</h2></div><Layers3 size={18} /></div>
            <div className="site-overview">
              <div className="site-overview__icon"><Building2 size={20} /></div>
              <div><b>{site.name}</b><span>{site.area.toLocaleString()} m² · {site.buildingCount} 棟建築</span></div>
              <em>{site.onlineRate}%</em>
            </div>
            <div className="building-list">
              {buildings.map((building) => (
                <button key={building.id} className={selectedId === building.id ? 'active' : ''} onClick={() => selectBuilding(building.id)}>
                  <i className={`building-status building-status--${building.status}`} />
                  <span><b>{building.name}</b><small>{building.type} · {building.floors}F</small></span>
                  <em>{building.healthScore}</em><ChevronRight size={13} />
                </button>
              ))}
            </div>
            <div className="layer-section">
              <div className="subheading"><b>顯示圖層</b><span>{Object.values(layers).filter(Boolean).length}/{layerOptions.length}</span></div>
              {layerOptions.map(({ id, label, icon: Icon, count }) => (
                <label key={id}><span><Icon size={14} />{label}<em>{count}</em></span><input type="checkbox" checked={layers[id]} onChange={() => toggleLayer(id)} /><i /></label>
              ))}
            </div>
          </aside>

          <aside className="gis-right-panel">
            {selected ? (
              <section className="glass-panel building-detail">
                <div className="detail-hero">
                  <span className={`detail-status detail-status--${selected.status}`}><i />{statusLabel[selected.status]}</span>
                  <button onClick={() => selectBuilding(null)} aria-label="關閉建築資訊">×</button>
                  <small>{selected.type}</small><h2>{selected.name}</h2>
                  <p><MapPin size={11} />{site.name}</p>
                </div>
                <div className="health-row"><div className={`mini-gauge mini-gauge--${selected.status}`}><strong>{selected.healthScore}</strong><span>健康評分</span></div><div><span>設備在線率<b>{selected.onlineRate}%</b></span><span>未處理告警<b className={selected.openAlerts ? 'danger' : ''}>{selected.openAlerts}</b></span></div></div>
                <div className="building-kpis">
                  <div><Zap size={14} /><span>即時功率</span><b>{selected.id === 'a1' ? telemetry.power : selected.power}<em>kW</em></b></div>
                  <div><Database size={14} /><span>今日能源</span><b>{selected.todayEnergy.toLocaleString()}<em>kWh</em></b></div>
                </div>
                <Link className="enter-twin" to={`/buildings/${selected.id}/twin`}><BoxIcon />進入 3D 數位孿生<ChevronRight size={15} /></Link>
              </section>
            ) : (
              <section className="glass-panel operation-summary">
                <div className="gis-panel-heading"><div><small>LIVE OPERATION</small><h2>園區營運摘要</h2></div><span className="gis-live"><i />LIVE</span></div>
                <div className="operation-score"><div className="campus-gauge"><strong>91</strong><span>園區健康度</span></div><div><b>整體運作良好</b><p>5 棟建築，638 台設備</p><small>較上週提升 1.8%</small></div></div>
                <div className="operation-grid">
                  <div><Zap size={15} /><span>園區用電</span><b>{(telemetry.power + 2366).toLocaleString()}<em>kW</em></b></div>
                  <div><Radio size={15} /><span>設備在線</span><b>98.4<em>%</em></b></div>
                  <div><Users size={15} /><span>園區人數</span><b>1,284<em>人</em></b></div>
                  <div><Camera size={15} /><span>CCTV</span><b>24<em>/ 24</em></b></div>
                </div>
              </section>
            )}

            <section className="glass-panel gis-alerts">
              <div className="gis-panel-heading"><div><small>ACTIVE INCIDENTS</small><h2>即時事件</h2></div><button>全部 6</button></div>
              <article onClick={() => selectBuilding('c1')}><span className="incident-icon critical"><AlertTriangle size={15} /></span><div><b>C1 智慧工廠</b><p>產線 02 即時能耗超過上限</p><small>1 分鐘前 · 嚴重</small></div><ChevronRight size={14} /></article>
              <article onClick={() => selectBuilding('a1')}><span className="incident-icon warning"><Activity size={15} /></span><div><b>A1 數據中心</b><p>CRAC-03 回風溫度過高</p><small>3 分鐘前 · 警告</small></div><ChevronRight size={14} /></article>
              <article><span className="incident-icon info"><CircleDot size={15} /></span><div><b>北側入口</b><p>訪客車輛已進入園區</p><small>8 分鐘前 · 通知</small></div><ChevronRight size={14} /></article>
            </section>
          </aside>

          <div className="gis-bottom-stats glass-panel">
            <div><span className="stat-icon teal"><Building2 size={16} /></span><p>建築狀態<small>正常運作</small></p><b>3<em>/ 5</em></b></div>
            <div><span className="stat-icon amber"><AlertTriangle size={16} /></span><p>未處理告警<small>2 件嚴重</small></p><b>6</b></div>
            <div><span className="stat-icon blue"><Server size={16} /></span><p>設備在線率<small>628 / 638</small></p><b>98.4<em>%</em></b></div>
            <div><span className="stat-icon purple"><Eye size={16} /></span><p>今日巡檢<small>已完成 18 項</small></p><b>86<em>%</em></b></div>
          </div>
        </section>
      </main>
    </div>
  )
}

function BoxIcon() {
  return <span className="box-icon"><span /><span /><span /></span>
}
