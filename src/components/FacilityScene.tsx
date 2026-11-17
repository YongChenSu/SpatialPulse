import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { memo, Suspense, useMemo } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { useFacilityStore } from '../store/useFacilityStore'
import type { FacilityProfile } from '../types'

function Rack({ x, z, warning = false }: { x: number; z: number; warning?: boolean }) {
  return (
    <group position={[x, 0.38, z]}>
      <mesh castShadow><boxGeometry args={[0.34, 0.75, 0.48]} /><meshStandardMaterial color={warning ? '#5c4535' : '#25333d'} roughness={0.42} metalness={0.55} /></mesh>
      {[0.12, 0.28, 0.44, 0.6].map((y) => <mesh key={y} position={[0, y - 0.36, 0.246]}><boxGeometry args={[0.27, 0.055, 0.012]} /><meshBasicMaterial color={warning ? '#ff9f43' : '#34d5a3'} /></mesh>)}
    </group>
  )
}

function DataCenterFloor({ index, id }: { index: number; id: string }) {
  const selected = useFacilityStore((state) => state.selectedFloor)
  const setSelected = useFacilityStore((state) => state.setSelectedFloor)
  const y = index * 1.45
  const isSelected = selected === 'all' || selected === id
  const rackPositions = useMemo(() => [-1.7, -1.15, -0.6, 0.6, 1.15, 1.7], [])
  const onClick = (event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); setSelected(id) }

  return (
    <group position={[0, y, 0]} onClick={onClick}>
      <mesh receiveShadow><boxGeometry args={[5.2, 0.12, 3.6]} /><meshStandardMaterial color={isSelected ? '#dfe9ec' : '#d8dee1'} transparent opacity={isSelected ? 1 : 0.2} /></mesh>
      <mesh position={[0, 0.77, -1.75]}><boxGeometry args={[5.2, 1.45, 0.05]} /><meshPhysicalMaterial color="#cde5e8" transparent opacity={isSelected ? 0.27 : 0.06} roughness={0.1} transmission={0.18} /></mesh>
      {isSelected && rackPositions.map((x, rackIndex) => <Rack key={x} x={x} z={rackIndex % 2 === 0 ? -0.6 : 0.55} warning={id === '3f' && rackIndex === 4} />)}
    </group>
  )
}

function DataCenterScene({ profile }: { profile: FacilityProfile }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[8.5, 7.5, 9]} fov={35} />
      <group position={[0, -2.2, 0]} rotation={[0, -0.18, 0]}>
        {profile.floors.slice().reverse().map((floor, index) => <DataCenterFloor key={floor.id} index={index} id={floor.id} />)}
        <mesh position={[0, -0.12, 0]} receiveShadow><boxGeometry args={[6.2, 0.12, 4.6]} /><meshStandardMaterial color="#cad7da" /></mesh>
      </group>
      <OrbitControls makeDefault enablePan={false} minDistance={7} maxDistance={18} minPolarAngle={0.65} maxPolarAngle={1.42} target={[0, 0.8, 0]} />
    </>
  )
}

const monitoredFloorByLevel = (level: number) => level >= 27 ? '30f' : level >= 21 ? '24f' : level >= 15 ? '18f' : level >= 9 ? '12f' : level >= 3 ? '6f' : '1f'

function TowerStorey({ level, profile }: { level: number; profile: FacilityProfile }) {
  const selected = useFacilityStore((state) => state.selectedFloor)
  const setSelected = useFacilityStore((state) => state.setSelectedFloor)
  const zoneId = monitoredFloorByLevel(level)
  const floor = profile.floors.find((item) => item.id === zoneId)
  const exactMonitor = Number(zoneId.replace('f', '')) === level
  const active = selected === 'all' || selected === zoneId
  const isPodium = level <= 5
  const width = isPodium ? 6.1 : 4.9
  const depth = isPodium ? 3.5 : 2.75
  const y = (level - 1) * 0.19
  const onClick = (event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); setSelected(zoneId) }

  return (
    <group position={[0, y, 0]} onClick={onClick}>
      <mesh castShadow={level % 3 === 0} receiveShadow><boxGeometry args={[width, 0.17, depth]} /><meshStandardMaterial color={active ? '#dbe8e9' : '#afbdc0'} transparent opacity={active ? 1 : 0.18} roughness={0.42} metalness={0.18} /></mesh>
      <mesh position={[0, 0.045, depth / 2 + 0.012]}><boxGeometry args={[width - 0.16, 0.105, 0.025]} /><meshPhysicalMaterial color={floor?.status === 'warning' && exactMonitor ? '#e4a14c' : '#278f9b'} transparent opacity={active ? 0.82 : 0.12} roughness={0.18} metalness={0.35} /></mesh>
    </group>
  )
}

function OfficeTowerScene({ profile }: { profile: FacilityProfile }) {
  const selected = useFacilityStore((state) => state.selectedFloor)
  const setSelected = useFacilityStore((state) => state.setSelectedFloor)
  const levels = useMemo(() => Array.from({ length: profile.storeys.aboveGround }, (_, index) => index + 1), [profile.storeys.aboveGround])
  const basementActive = selected === 'all' || selected.startsWith('b')

  return (
    <>
      <PerspectiveCamera makeDefault position={[10.5, 7.6, 11.5]} fov={34} />
      <group position={[0, -2.75, 0]} rotation={[0, -0.28, 0]}>
        <mesh position={[0, 2.85, 0]}><boxGeometry args={[1.5, 5.7, 1.35]} /><meshStandardMaterial color="#7d9298" transparent opacity={selected === 'all' ? 0.44 : 0.16} roughness={0.5} /></mesh>
        {levels.map((level) => <TowerStorey key={level} level={level} profile={profile} />)}
        {Array.from({ length: 12 }, (_, index) => -2.25 + index * 0.41).map((x) => <mesh key={x} position={[x, 3.22, 1.42]}><boxGeometry args={[0.025, 5.5, 0.04]} /><meshStandardMaterial color="#88d1d5" transparent opacity={0.5} /></mesh>)}
        <group onClick={(event) => { event.stopPropagation(); setSelected('b4') }}>
          <mesh position={[0, -0.46, 0]}><boxGeometry args={[6.4, 0.82, 3.85]} /><meshStandardMaterial color={basementActive ? '#8aa0a4' : '#9eabad'} transparent opacity={basementActive ? 0.48 : 0.15} /></mesh>
        </group>
        <mesh position={[0, -0.94, 0]} receiveShadow><boxGeometry args={[8.2, 0.14, 5.8]} /><meshStandardMaterial color="#cbdadc" /></mesh>
        <mesh position={[-3.25, -0.82, 1.65]}><boxGeometry args={[1.15, 0.08, 1.15]} /><meshStandardMaterial color="#77b7a4" /></mesh>
        <mesh position={[3.1, -0.82, -1.55]}><boxGeometry args={[1.45, 0.08, 1.05]} /><meshStandardMaterial color="#77b7a4" /></mesh>
      </group>
      <OrbitControls makeDefault enablePan={false} minDistance={8} maxDistance={20} minPolarAngle={0.58} maxPolarAngle={1.38} target={[0, 0.5, 0]} />
    </>
  )
}

function Scene({ profile }: { profile: FacilityProfile }) {
  return (
    <>
      <color attach="background" args={['#edf3f4']} />
      <fog attach="fog" args={['#edf3f4', 14, 27]} />
      <ambientLight intensity={1.8} />
      <directionalLight castShadow position={[6, 10, 6]} intensity={2.2} color="#f8ffff" />
      {profile.kind === 'office-tower' ? <OfficeTowerScene profile={profile} /> : <DataCenterScene profile={profile} />}
      <gridHelper args={[30, 30, '#d5e2e4', '#dfe9eb']} position={[0, profile.kind === 'office-tower' ? -3.72 : -2.35, 0]} />
    </>
  )
}

export const FacilityScene = memo(function FacilityScene({ profile }: { profile: FacilityProfile }) {
  const selected = useFacilityStore((state) => state.selectedFloor)
  const setSelected = useFacilityStore((state) => state.setSelectedFloor)
  const selectedFloor = profile.floors.find((floor) => floor.id === selected)

  return (
    <>
      <Canvas shadows dpr={[1, 1.5]} gl={{ antialias: true }}><Suspense fallback={null}><Scene profile={profile} /></Suspense></Canvas>
      <div className="scene-floor-rail" aria-label="3D 場景樓層捷徑">
        {profile.floors.map((floor) => <button key={floor.id} className={selected === floor.id ? 'active' : ''} onClick={() => setSelected(floor.id)}>{floor.label}</button>)}
      </div>
      <div className={`scene-selection-card ${selectedFloor?.status === 'warning' ? 'warning' : ''}`}>
        <small>{profile.kind === 'office-tower' ? 'CONCEPTUAL 3D TWIN' : 'FACILITY 3D TWIN'}</small>
        <b>{selectedFloor ? `${selectedFloor.label} · ${selectedFloor.area}` : '全棟營運總覽'}</b>
        <span>{selectedFloor ? `${selectedFloor.temperature}°C · RH ${selectedFloor.humidity}% · 負載 ${selectedFloor.load}%` : `${profile.storeys.aboveGround}F / B${profile.storeys.basement} · ${profile.assetSummary.total} 項監控資產`}</span>
      </div>
    </>
  )
})
