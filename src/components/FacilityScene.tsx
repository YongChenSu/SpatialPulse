import { Html, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { memo, Suspense, useMemo } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { floors } from '../data/facility'
import { useFacilityStore } from '../store/useFacilityStore'

function Rack({ x, z, warning = false }: { x: number; z: number; warning?: boolean }) {
  return (
    <group position={[x, 0.38, z]}>
      <mesh castShadow>
        <boxGeometry args={[0.34, 0.75, 0.48]} />
        <meshStandardMaterial color={warning ? '#5c4535' : '#25333d'} roughness={0.42} metalness={0.55} />
      </mesh>
      {[0.12, 0.28, 0.44, 0.6].map((y) => <mesh key={y} position={[0, y - 0.36, 0.246]}><boxGeometry args={[0.27, 0.055, 0.012]} /><meshBasicMaterial color={warning ? '#ff9f43' : '#34d5a3'} /></mesh>)}
    </group>
  )
}

function FloorModel({ index, id }: { index: number; id: string }) {
  const selected = useFacilityStore((state) => state.selectedFloor)
  const setSelected = useFacilityStore((state) => state.setSelectedFloor)
  const y = index * 1.45
  const isSelected = selected === 'all' || selected === id
  const rackPositions = useMemo(() => [-1.7, -1.15, -0.6, 0.6, 1.15, 1.7], [])
  const onClick = (event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); setSelected(id) }

  return (
    <group position={[0, y, 0]} onClick={onClick}>
      <mesh receiveShadow>
        <boxGeometry args={[5.2, 0.12, 3.6]} />
        <meshStandardMaterial color={isSelected ? '#dfe9ec' : '#d8dee1'} transparent opacity={isSelected ? 1 : 0.2} />
      </mesh>
      <mesh position={[0, 0.77, -1.75]}>
        <boxGeometry args={[5.2, 1.45, 0.05]} />
        <meshPhysicalMaterial color="#cde5e8" transparent opacity={isSelected ? 0.27 : 0.06} roughness={0.1} transmission={0.18} />
      </mesh>
      {isSelected && rackPositions.map((x, rackIndex) => <Rack key={x} x={x} z={rackIndex % 2 === 0 ? -0.6 : 0.55} warning={id === '3f' && rackIndex === 4} />)}
      {id === '3f' && isSelected && (
        <Html position={[1.2, 1.15, 0.6]} center distanceFactor={8}>
          <div className="sensor-tag sensor-tag--alert"><i />CRAC-03 <b>26.8°C</b></div>
        </Html>
      )}
      {id === '2f' && isSelected && (
        <Html position={[-1.2, 1.05, -0.3]} center distanceFactor={8}>
          <div className="sensor-tag"><i />Rack A-08 <b>22.8°C</b></div>
        </Html>
      )}
      <Html position={[-3.05, 0.35, 0]} center distanceFactor={10}>
        <button className={`floor-label ${selected === id ? 'active' : ''}`} onClick={() => setSelected(id)}>{id.toUpperCase()}</button>
      </Html>
    </group>
  )
}

function Scene() {
  return (
    <>
      <color attach="background" args={['#edf3f4']} />
      <fog attach="fog" args={['#edf3f4', 12, 24]} />
      <ambientLight intensity={1.8} />
      <directionalLight castShadow position={[6, 10, 6]} intensity={2.2} color="#f8ffff" />
      <PerspectiveCamera makeDefault position={[8.5, 7.5, 9]} fov={35} />
      <group position={[0, -2.2, 0]} rotation={[0, -0.18, 0]}>
        {floors.slice().reverse().map((floor, index) => <FloorModel key={floor.id} index={index} id={floor.id} />)}
        <mesh position={[0, -0.12, 0]} receiveShadow><boxGeometry args={[6.2, 0.12, 4.6]} /><meshStandardMaterial color="#cad7da" /></mesh>
      </group>
      <gridHelper args={[30, 30, '#d5e2e4', '#dfe9eb']} position={[0, -2.35, 0]} />
      <OrbitControls makeDefault enablePan={false} minDistance={7} maxDistance={18} minPolarAngle={0.65} maxPolarAngle={1.42} target={[0, 0.8, 0]} />
    </>
  )
}

export const FacilityScene = memo(function FacilityScene() {
  return <Canvas shadows dpr={[1, 1.5]} gl={{ antialias: true }}><Suspense fallback={null}><Scene /></Suspense></Canvas>
})
