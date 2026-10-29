import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Group } from 'three';

type Coord = [number, number, number];

const gold = '#efbd58';
const lightGold = '#ffe7a2';

function CurvedTube({ points, radius = 0.065, color = gold }: { points: Coord[]; radius?: number; color?: string }) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
    return new THREE.TubeGeometry(curve, 56, radius, 10, false);
  }, [points, radius]);

  return (
    <mesh geometry={geometry} dispose={null}>
      <meshPhysicalMaterial color={color} metalness={0.86} roughness={0.19} clearcoat={1} />
    </mesh>
  );
}

const upperPipe: Coord[] = [[-1.92, 0.31, 0], [-1.5, 0.32, 0], [-1.4, 0.44, 0], [-1.25, 0.44, 0], [-1.12, 0.24, 0], [0.7, 0.24, 0]];
const lowerPipe: Coord[] = [[-1.42, -0.23, 0], [-1.42, -0.56, 0], [-1.1, -0.65, 0], [-0.68, -0.55, 0], [-0.54, -0.22, 0], [0.72, -0.18, 0]];
const backBend: Coord[] = [[-1.9, 0.3, 0], [-2.08, 0.26, 0], [-2.13, 0.08, 0], [-2.04, -0.16, 0], [-1.7, -0.26, 0], [-1.42, -0.23, 0]];

function Trumpet() {
  const bell = useMemo(() => new THREE.LatheGeometry([
    new THREE.Vector2(0.13, -0.2), new THREE.Vector2(0.135, 0.0),
    new THREE.Vector2(0.16, 0.46), new THREE.Vector2(0.18, 0.85),
    new THREE.Vector2(0.26, 1.13), new THREE.Vector2(0.43, 1.39),
    new THREE.Vector2(0.7, 1.67), new THREE.Vector2(0.76, 1.72),
  ], 64), []);

  return (
    <group rotation={[0.05, -0.27, 0.10]} scale={0.92}>
      {/* Campana acampanada, con interior oscuro y ribete brillante. */}
      <mesh geometry={bell} rotation={[0, 0, -Math.PI / 2]} position={[0.05, 0.04, 0]}>
        <meshPhysicalMaterial color={gold} metalness={0.91} roughness={0.16} side={THREE.DoubleSide} clearcoat={1} />
      </mesh>
      <mesh position={[1.775, 0.04, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.724, 64]} />
        <meshStandardMaterial color="#39210e" metalness={0.75} roughness={0.31} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[1.779, 0.04, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.73, 0.034, 12, 80]} />
        <meshPhysicalMaterial color={lightGold} metalness={0.88} roughness={0.13} />
      </mesh>
      <CurvedTube points={upperPipe} radius={0.078} />
      <CurvedTube points={lowerPipe} radius={0.071} />
      <CurvedTube points={backBend} radius={0.069} />
      {/* Boquilla */}
      <mesh position={[-2.12, 0.34, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.16, 0.11, 0.19, 32]} />
        <meshPhysicalMaterial color={lightGold} metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-2.25, 0.34, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.13, 0.13, 0.06, 32]} />
        <meshStandardMaterial color="#e8b750" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Pistones cromados en oro */}
      {[-0.68, -0.31, 0.06].map((x) => (
        <group key={x} position={[x, 0.1, -0.03]}>
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.105, 0.105, 0.73, 24]} />
            <meshPhysicalMaterial color="#d49b36" metalness={0.92} roughness={0.19} />
          </mesh>
          <mesh position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.135, 0.135, 0.07, 24]} />
            <meshPhysicalMaterial color={lightGold} metalness={0.78} roughness={0.17} />
          </mesh>
          <mesh position={[0, -0.35, 0]}>
            <cylinderGeometry args={[0.125, 0.125, 0.06, 24]} />
            <meshPhysicalMaterial color="#f6cd75" metalness={0.9} roughness={0.15} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function MusicNote({ position, size = 1 }: { position: Coord; size?: number }) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.6 + position[0]) * 0.3;
  });
  return (
    <group ref={ref} position={position} scale={size}>
      <mesh rotation={[0, 0, -0.3]}>
        <torusGeometry args={[0.12, 0.036, 10, 24]} />
        <meshStandardMaterial color="#efc779" emissive="#e4a72b" emissiveIntensity={0.25} metalness={0.5} roughness={0.2} />
      </mesh>
      <mesh position={[0.13, 0.28, 0]} rotation={[0, 0, -0.04]}>
        <cylinderGeometry args={[0.026, 0.026, 0.58, 12]} />
        <meshStandardMaterial color="#efc779" emissive="#d19c40" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

function Sculpture({ reducedMotion }: { reducedMotion: boolean }) {
  const model = useRef<Group>(null);
  useFrame(({ pointer, clock }, delta) => {
    if (!model.current || reducedMotion) return;
    model.current.rotation.y = THREE.MathUtils.damp(model.current.rotation.y, -pointer.x * 0.18, 2, delta);
    model.current.rotation.x = THREE.MathUtils.damp(model.current.rotation.x, pointer.y * 0.10, 2, delta);
    model.current.rotation.z = Math.sin(clock.elapsedTime * 0.3) * 0.018;
  });
  return (
    <>
      <ambientLight intensity={1.65} />
      <pointLight position={[-3, 4, 4]} color="#ffe0a3" intensity={85} distance={14} />
      <pointLight position={[3, -2, 4]} color="#e19e40" intensity={48} distance={10} />
      <pointLight position={[0, 3, -3]} color="#fff0ce" intensity={65} distance={10} />
      <group ref={model}>
        <Float speed={reducedMotion ? 0 : 1.8} floatIntensity={reducedMotion ? 0 : 0.35} rotationIntensity={reducedMotion ? 0 : 0.11}>
          <Trumpet />
        </Float>
        <MusicNote position={[-2.15, 1.45, -0.3]} size={0.72} />
        <MusicNote position={[2.3, 1.12, -1.0]} size={1.03} />
        <MusicNote position={[1.4, -1.5, -0.7]} size={0.67} />
      </group>
      {!reducedMotion && <Sparkles count={50} speed={0.24} size={2.4} opacity={0.7} scale={[6.8, 5.2, 3.3]} color="#f0c36c" />}
    </>
  );
}

export default function MariachiScene({ reducedMotion = false }: { reducedMotion?: boolean }) {
  return (
    <div className="scene-canvas" role="img" aria-label="Trompeta de mariachi dorada en una escena tridimensional interactiva">
      <Suspense fallback={<span className="scene-fallback">El brillo de nuestra música</span>}>
        <Canvas frameloop={reducedMotion ? 'demand' : 'always'} dpr={[1, 1.65]} gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }} camera={{ position: [0, 0, 7.7], fov: 39 }}>
          <Sculpture reducedMotion={reducedMotion} />
        </Canvas>
      </Suspense>
    </div>
  );
}
