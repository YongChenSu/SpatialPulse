import { Check, ChevronRight, CircleAlert, Clock3, Gauge, TrendingDown, Zap } from 'lucide-react'
import { floors, powerTrend } from '../data/facility'
import { useFacilityStore } from '../store/useFacilityStore'
import { Sparkline } from './Sparkline'

export function InsightPanel() {
  const telemetry = useFacilityStore((state) => state.telemetry)
  const alerts = useFacilityStore((state) => state.alerts)
  const acknowledge = useFacilityStore((state) => state.acknowledgeAlert)
  const selectFloor = useFacilityStore((state) => state.setSelectedFloor)
  const openAlerts = alerts.filter((alert) => !alert.acknowledged)

  return (
    <aside className="insight-panel">
      <section className="panel health-card">
        <div className="panel__title"><div><small>LIVE PERFORMANCE</small><h2>即時營運狀態</h2></div><span className="live"><i />LIVE</span></div>
        <div className="health-score">
          <div className="gauge"><div><strong>92</strong><span>健康評分</span></div></div>
          <div className="health-meta"><span><Check size={14} />系統運作正常</span><p>較上週提升 <b>2.4%</b></p><small><Clock3 size={12} />更新於 {new Date(telemetry.updatedAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</small></div>
        </div>
        <div className="kpi-grid">
          <div><span><Gauge size={15} />PUE</span><b>{telemetry.pue}</b><small className="good"><TrendingDown size={11} /> 4.2%</small></div>
          <div><span><Zap size={15} />即時功率</span><b>{telemetry.power}<em>kW</em></b><small>容量 {telemetry.capacity}%</small></div>
          <div><span>冷卻用電</span><b>{telemetry.cooling}<em>kW</em></b><small>占比 34%</small></div>
          <div><span>可用率</span><b>{telemetry.uptime}<em>%</em></b><small className="good">SLA 達標</small></div>
        </div>
      </section>
      <section className="panel trend-card">
        <div className="section-heading"><div><small>POWER CONSUMPTION</small><h3>即時用電趨勢</h3></div><button>12 小時⌄</button></div>
        <div className="trend-value"><b>{telemetry.power.toLocaleString()}</b><span>kW</span><em>−3.8% vs. 昨日</em></div>
        <Sparkline values={[...powerTrend.slice(0, -1), telemetry.power]} />
        <div className="chart-axis"><span>08:00</span><span>12:00</span><span>16:00</span><span>現在</span></div>
      </section>
      <section className="panel floor-card">
        <div className="section-heading"><div><small>FLOOR STATUS</small><h3>樓層環境</h3></div><button>全部 <ChevronRight size={13} /></button></div>
        <div className="floor-list">
          {floors.map((floor) => <button key={floor.id} onClick={() => selectFloor(floor.id)}><b>{floor.label}</b><span>{floor.area}</span><em>{floor.temperature}°C</em><i className={`status status--${floor.status}`} /></button>)}
        </div>
      </section>
      <section className="panel alert-card">
        <div className="section-heading"><div><small>ACTIVE ALERTS</small><h3>事件與告警 <mark>{openAlerts.length}</mark></h3></div><button>查看全部</button></div>
        <div className="alerts">
          {alerts.slice(0, 2).map((alert) => (
            <article key={alert.id} className={alert.acknowledged ? 'resolved' : ''} onClick={() => selectFloor(alert.floorId)}>
              <span className={`alert-icon alert-icon--${alert.status}`}><CircleAlert size={16} /></span>
              <div><b>{alert.asset}</b><p>{alert.message}</p><small>{alert.time} · {alert.id}</small></div>
              {!alert.acknowledged && <button onClick={(event) => { event.stopPropagation(); acknowledge(alert.id) }}>確認</button>}
            </article>
          ))}
        </div>
      </section>
    </aside>
  )
}
