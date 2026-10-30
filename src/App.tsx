import { Activity, ChevronRight, Wifi } from 'lucide-react'
import { AssetTree } from './components/AssetTree'
import { FacilityScene } from './components/FacilityScene'
import { Header } from './components/Header'
import { InsightPanel } from './components/InsightPanel'
import { NavRail } from './components/NavRail'
import { SceneToolbar } from './components/SceneToolbar'
import { useRealtime } from './hooks/useRealtime'

function App() {
  useRealtime()
  return (
    <div className="app-shell">
      <Header />
      <NavRail />
      <main>
        <div className="page-heading">
          <div><div className="breadcrumb">設施管理 <ChevronRight size={12} /> 數位孿生</div><h1>台北 A1 數據中心</h1><p><span><Wifi size={12} /> 連線正常</span> 最後同步：剛剛</p></div>
          <div className="operating-badge"><Activity size={17} /><div><small>營運模式</small><b>N+1 備援運作中</b></div></div>
        </div>
        <div className="workspace">
          <AssetTree />
          <section className="scene panel" aria-label="3D 數位孿生場景">
            <FacilityScene />
            <SceneToolbar />
          </section>
          <InsightPanel />
        </div>
      </main>
    </div>
  )
}

export default App
