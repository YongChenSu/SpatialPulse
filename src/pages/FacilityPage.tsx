import { Activity, ChevronRight, Wifi } from 'lucide-react'
import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { AssetTree } from '../components/AssetTree'
import { FacilityScene } from '../components/FacilityScene'
import { Header } from '../components/Header'
import { InsightPanel } from '../components/InsightPanel'
import { NavRail } from '../components/NavRail'
import { SceneToolbar } from '../components/SceneToolbar'
import { useRealtime } from '../hooks/useRealtime'
import { getFacilityProfile } from '../data/buildingProfiles'
import { useFacilityStore } from '../store/useFacilityStore'

export function FacilityPage() {
  const { buildingId } = useParams()
  const profile = getFacilityProfile(buildingId)

  if (!profile) return <Navigate to="/buildings/a1/twin" replace />

  return <FacilityWorkspace key={profile.id} profile={profile} />
}

function FacilityWorkspace({ profile }: { profile: NonNullable<ReturnType<typeof getFacilityProfile>> }) {
  const loadFacility = useFacilityStore((state) => state.loadFacility)

  useEffect(() => loadFacility(profile.id, profile.telemetry, profile.alerts), [loadFacility, profile])
  useRealtime(profile)

  return (
    <div className="app-shell">
      <Header />
      <NavRail />
      <main>
        <div className="page-heading">
          <div><div className="breadcrumb">{profile.campus} <ChevronRight size={12} /> 數位孿生</div><h1>{profile.name}</h1><p><span><Wifi size={12} /> 連線正常</span> 最後同步：剛剛 · {profile.dataProvenance}</p></div>
          <div className="operating-badge"><Activity size={17} /><div><small>營運模式</small><b>{profile.operatingMode}</b></div></div>
        </div>
        <div className="workspace">
          <AssetTree profile={profile} />
          <section className="scene panel" aria-label="3D 數位孿生場景">
            <FacilityScene profile={profile} />
            <SceneToolbar />
          </section>
          <InsightPanel profile={profile} />
        </div>
      </main>
    </div>
  )
}
