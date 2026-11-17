import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const FacilityPage = lazy(() => import('./pages/FacilityPage').then((module) => ({ default: module.FacilityPage })))
const GisPage = lazy(() => import('./pages/GisPage').then((module) => ({ default: module.GisPage })))

function App() {
  return (
    <Suspense fallback={<div className="route-loading"><i /><span>正在載入智慧園區平台</span></div>}>
      <Routes>
        <Route path="/" element={<Navigate to="/gis" replace />} />
        <Route path="/gis" element={<GisPage />} />
        <Route path="/buildings/:buildingId/twin" element={<FacilityPage />} />
        <Route path="*" element={<Navigate to="/gis" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
