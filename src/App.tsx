/**
 * Rivers of Reckoning - Main Game Component
 *
 * A procedural 3D RPG using @jbcom/strata for terrain, water, vegetation,
 * weather, audio, and game systems.
 *
 * Ported from Python/pygame version with full use of Strata's actual API.
 */

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stats } from '@react-three/drei'
import { Suspense, useMemo, useRef, useCallback, useEffect } from 'react'
import * as THREE from 'three'
import {
  // Core algorithms
  fbm,
  noise3D,
  getTerrainHeight,
  getBiomeAt,
  // Vegetation instances
  createGrassInstances,
  createTreeInstances,
  createRockInstances,
  // Components
  ProceduralSky,
  Water,
  Rain,
  Snow,
  // Audio components
  AudioProvider,
  AudioListener,
  AmbientAudio,
  WeatherAudio,
  FootstepAudio,
  // State management
  GameStateProvider,
  useGameState,
  // UI components
  HealthBar,
  Minimap,
  Notification,
  // Triggers and input
  TriggerComposer,
  CharacterController,
} from '@jbcom/strata'
import type { BiomeData, TimeOfDayState, WeatherState } from '@jbcom/strata'

// =============================================================================
// GAME CONSTANTS (ported from Python)
// =============================================================================

const BIOME_CONFIGS: BiomeData[] = [
  { name: 'grassland', threshold: 0, color: 0x3a5a2a, vegetation: 1.0 },
  { name: 'forest', threshold: 0.3, color: 0x2a4a1a, vegetation: 1.5 },
  { name: 'marsh', threshold: 0.5, color: 0x4a6a3a, vegetation: 0.8 },
  { name: 'desert', threshold: 0.7, color: 0xedc9af, vegetation: 0.2 },
  { name: 'tundra', threshold: 0.85, color: 0xf5f5f5, vegetation: 0.3 },
]

// =============================================================================
// SEEDED RANDOM NUMBER GENERATOR (addressing PR feedback)
// =============================================================================

class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }

  nextInRange(min: number, max: number): number {
    return min + this.next() * (max - min)
  }
}

// =============================================================================
// PROCEDURAL TERRAIN (using real Strata API)
// =============================================================================

interface ProceduralTerrainProps {
  size: number
  segments: number
  seed: number
}

function ProceduralTerrain({ size, segments, seed }: ProceduralTerrainProps) {
  const { geometry, colors } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, segments, segments)
    geo.rotateX(-Math.PI / 2)

    const positions = geo.attributes.position
    const colorData = new Float32Array(positions.count * 3)

    // Use Strata's fbm for terrain generation
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const z = positions.getZ(i)

      // Multi-layer terrain using Strata's fbm
      const baseHeight = fbm(x * 0.02, z * 0.02, 6, 2.2, seed) * 8
      const largeScale = fbm(x * 0.008, z * 0.008, 4, 2.0, seed + 100) * 12
      const detail = fbm(x * 0.1, z * 0.1, 2, 3.0, seed + 300) * 1.5

      // River valley carving
      const riverDist = Math.abs(z - 10 + Math.sin(x * 0.05) * 15)
      const riverCarve = Math.max(0, 1 - riverDist / 20) * -4

      let height = baseHeight + largeScale + detail + riverCarve
      const waterLevel = -0.5
      height = Math.max(waterLevel, height)

      positions.setY(i, height)

      // Biome-based coloring using Strata's noise
      const biomeVal = fbm(x * 0.03, z * 0.03, 3, 2.0, seed + 500)
      const moisture = fbm(x * 0.05, z * 0.05, 2, 2.0, seed + 600)

      let color = new THREE.Color()
      if (height < waterLevel + 0.5) {
        color.setHex(0xd4c5a3) // Beach
      } else if (height < waterLevel + 2 && moisture > 0.3) {
        color.setHex(0x4a6a3a) // Wetland/Marsh
      } else if (biomeVal > 0.6) {
        color.setHex(0x7a7a6a) // Rocky
      } else if (biomeVal > 0.3) {
        color.setHex(0x2a4a2a) // Forest
      } else if (height > 8 * 1.2) {
        color.setHex(0x8a9a8a) // Alpine
      } else {
        color.setHex(0x3a5a2a) // Grassland
      }

      colorData[i * 3] = color.r
      colorData[i * 3 + 1] = color.g
      colorData[i * 3 + 2] = color.b
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colorData, 3))
    geo.computeVertexNormals()

    return { geometry: geo, colors: colorData }
  }, [size, segments, seed])

  return (
    <mesh geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial vertexColors roughness={0.95} metalness={0.05} />
    </mesh>
  )
}

// =============================================================================
// VEGETATION SYSTEM (using real Strata API)
// =============================================================================

interface VegetationProps {
  seed: number
  areaSize: number
  grassCount: number
  treeCount: number
  rockCount: number
}

function Vegetation({ seed, areaSize, grassCount, treeCount, rockCount }: VegetationProps) {
  // Height function matching terrain
  const heightFunction = useCallback(
    (x: number, z: number) => {
      const height =
        fbm(x * 0.02, z * 0.02, 6, 2.2, seed) * 8 +
        fbm(x * 0.008, z * 0.008, 4, 2.0, seed + 100) * 12
      return Math.max(0, height)
    },
    [seed]
  )

  const grassMesh = useMemo(() => {
    if (grassCount === 0) return null
    return createGrassInstances(grassCount, areaSize, BIOME_CONFIGS, {
      heightFunction,
      seed,
      enableWind: true,
      windStrength: 0.5,
    })
  }, [grassCount, areaSize, seed, heightFunction])

  const treeMesh = useMemo(() => {
    if (treeCount === 0) return null
    return createTreeInstances(treeCount, areaSize, BIOME_CONFIGS, {
      heightFunction,
      seed: seed + 1000,
      enableWind: true,
      windStrength: 0.3,
    })
  }, [treeCount, areaSize, seed, heightFunction])

  const rockMesh = useMemo(() => {
    if (rockCount === 0) return null
    return createRockInstances(rockCount, areaSize, BIOME_CONFIGS, {
      heightFunction,
      seed: seed + 2000,
    })
  }, [rockCount, areaSize, seed, heightFunction])

  return (
    <>
      {grassMesh && <primitive object={grassMesh} castShadow />}
      {treeMesh && <primitive object={treeMesh} castShadow />}
      {rockMesh && <primitive object={rockMesh} castShadow />}
    </>
  )
}

// =============================================================================
// WATER SYSTEM
// =============================================================================

function WaterPlane({ size }: { size: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const { uniforms, vertexShader, fragmentShader } = useMemo(
    () => ({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x1a5f7a) },
        uOpacity: { value: 0.85 },
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vPosition;

        void main() {
          vUv = uv;
          vec3 pos = position;

          // Wave animation
          float wave1 = sin(pos.x * 0.5 + uTime) * 0.3;
          float wave2 = sin(pos.z * 0.3 + uTime * 0.7) * 0.2;
          float wave3 = sin((pos.x + pos.z) * 0.2 + uTime * 1.3) * 0.15;
          pos.y += wave1 + wave2 + wave3;

          vPosition = pos;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vPosition;

        void main() {
          vec3 viewDir = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - max(dot(viewDir, vec3(0.0, 1.0, 0.0)), 0.0), 2.0);
          float caustic = sin(vUv.x * 20.0 + uTime) * sin(vUv.y * 20.0 + uTime * 0.8) * 0.1;
          vec3 finalColor = uColor + vec3(fresnel * 0.3) + vec3(caustic);
          gl_FragColor = vec4(finalColor, uOpacity);
        }
      `,
    }),
    []
  )

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[size, size, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// =============================================================================
// WEATHER SYSTEM (using real Strata API)
// =============================================================================

type WeatherType = 'clear' | 'rain' | 'fog' | 'snow' | 'storm'

interface WeatherEffectsProps {
  weather: WeatherType
  intensity: number
}

function WeatherEffects({ weather, intensity }: WeatherEffectsProps) {
  switch (weather) {
    case 'rain':
    case 'storm':
      return <Rain intensity={intensity} />
    case 'snow':
      return <Snow intensity={intensity} />
    default:
      return null
  }
}

// =============================================================================
// GAME LOOP WITH requestAnimationFrame (addressing PR feedback)
// =============================================================================

interface GameLoopProps {
  onUpdate: (deltaTime: number) => void
}

function GameLoop({ onUpdate }: GameLoopProps) {
  const lastTimeRef = useRef(performance.now())

  useFrame(() => {
    const currentTime = performance.now()
    const deltaTime = (currentTime - lastTimeRef.current) / 1000
    lastTimeRef.current = currentTime
    onUpdate(deltaTime)
  })

  return null
}

// =============================================================================
// GAME STATE MANAGEMENT
// =============================================================================

interface GameState {
  // Time
  hour: number
  dayCount: number
  // Weather
  weather: WeatherType
  weatherIntensity: number
  weatherDuration: number
  // Player
  health: number
  maxHealth: number
  gold: number
  score: number
  level: number
  experience: number
  distanceTraveled: number
  // World
  seed: number
  isPaused: boolean
}

function useGameLogic() {
  const rngRef = useRef<SeededRandom | null>(null)
  const stateRef = useRef<GameState>({
    hour: 8,
    dayCount: 1,
    weather: 'clear',
    weatherIntensity: 0.5,
    weatherDuration: 300,
    health: 100,
    maxHealth: 100,
    gold: 0,
    score: 0,
    level: 1,
    experience: 0,
    distanceTraveled: 0,
    seed: Date.now(),
    isPaused: false,
  })

  // Initialize seeded RNG
  useEffect(() => {
    rngRef.current = new SeededRandom(stateRef.current.seed)
  }, [])

  const getRandomWeather = useCallback((): WeatherType => {
    if (!rngRef.current) return 'clear'
    const r = rngRef.current.next()
    if (r < 0.5) return 'clear'
    if (r < 0.7) return 'rain'
    if (r < 0.85) return 'fog'
    if (r < 0.95) return 'snow'
    return 'storm'
  }, [])

  const updateGame = useCallback(
    (dt: number) => {
      if (stateRef.current.isPaused) return

      // Update time (1 game hour = 60 real seconds)
      stateRef.current.hour += (dt * 60) / 3600
      if (stateRef.current.hour >= 24) {
        stateRef.current.hour -= 24
        stateRef.current.dayCount += 1
      }

      // Update weather
      stateRef.current.weatherDuration -= dt
      if (stateRef.current.weatherDuration <= 0) {
        stateRef.current.weather = getRandomWeather()
        stateRef.current.weatherIntensity = rngRef.current
          ? rngRef.current.nextInRange(0.3, 1.0)
          : 0.5
        stateRef.current.weatherDuration = rngRef.current
          ? rngRef.current.nextInRange(60, 300)
          : 120
      }
    },
    [getRandomWeather]
  )

  return { state: stateRef.current, updateGame }
}

// =============================================================================
// HUD COMPONENT
// =============================================================================

interface HUDProps {
  state: GameState
}

function HUD({ state }: HUDProps) {
  const getTimePhase = (hour: number): string => {
    if (hour >= 5 && hour < 7) return 'Dawn'
    if (hour >= 7 && hour < 18) return 'Day'
    if (hour >= 18 && hour < 20) return 'Dusk'
    return 'Night'
  }

  const weatherLabels: Record<WeatherType, string> = {
    clear: 'Clear',
    rain: 'Rain',
    fog: 'Fog',
    snow: 'Snow',
    storm: 'Storm',
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '10px 20px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
        color: 'white',
        fontFamily: 'monospace',
        fontSize: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        zIndex: 100,
      }}
    >
      <div>
        <div>
          ❤️ {Math.round(state.health)}/{state.maxHealth}
        </div>
        <div>💰 {state.gold}</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Rivers of Reckoning</div>
        <div>
          Day {state.dayCount} • {getTimePhase(state.hour)} ({Math.floor(state.hour)}:
          {String(Math.floor((state.hour % 1) * 60)).padStart(2, '0')})
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div>🌤️ {weatherLabels[state.weather]}</div>
        <div>📍 {Math.round(state.distanceTraveled)}m</div>
      </div>
    </div>
  )
}

// =============================================================================
// MAIN SCENE
// =============================================================================

function Scene({ seed }: { seed: number }) {
  const { state, updateGame } = useGameLogic()

  // Time of day for sky
  const timeOfDay: Partial<TimeOfDayState> = useMemo(
    () => ({
      sunAngle: ((state.hour - 6) / 12) * 180, // 6am = 0°, 6pm = 180°
      sunIntensity: state.hour >= 6 && state.hour <= 18 ? 1.0 : 0.0,
      ambientLight: state.hour >= 6 && state.hour <= 18 ? 0.8 : 0.2,
      starVisibility: state.hour < 6 || state.hour > 18 ? 1.0 : 0.0,
    }),
    [state.hour]
  )

  // Weather state for sky
  const weatherState: Partial<WeatherState> = useMemo(
    () => ({
      intensity: state.weather !== 'clear' ? state.weatherIntensity : 0,
    }),
    [state.weather, state.weatherIntensity]
  )

  return (
    <>
      {/* Game loop using requestAnimationFrame */}
      <GameLoop onUpdate={updateGame} />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[50, 50, 25]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />

      {/* Procedural sky with day/night cycle */}
      <ProceduralSky timeOfDay={timeOfDay} weather={weatherState} size={[300, 150]} distance={100} />

      {/* Weather effects */}
      <WeatherEffects weather={state.weather} intensity={state.weatherIntensity} />

      {/* Procedural terrain */}
      <ProceduralTerrain size={200} segments={256} seed={seed} />

      {/* Procedural water */}
      <WaterPlane size={200} />

      {/* Vegetation */}
      <Vegetation seed={seed} areaSize={100} grassCount={5000} treeCount={200} rockCount={100} />

      {/* Camera controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={10}
        maxDistance={150}
      />

      {/* Performance stats (dev only) */}
      {process.env.NODE_ENV === 'development' && <Stats />}
    </>
  )
}

// =============================================================================
// MAIN APP
// =============================================================================

export default function App() {
  const seed = useMemo(() => Date.now(), [])
  const { state } = useGameLogic()

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* HUD Overlay */}
      <HUD state={state} />

      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [40, 30, 40], fov: 60 }}
        style={{ background: 'linear-gradient(to bottom, #87ceeb, #e0f7fa)' }}
      >
        <Suspense fallback={null}>
          <Scene seed={seed} />
        </Suspense>
      </Canvas>

      {/* Controls help */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          color: 'white',
          fontFamily: 'monospace',
          fontSize: '12px',
          background: 'rgba(0,0,0,0.5)',
          padding: '10px',
          borderRadius: '8px',
        }}
      >
        <div>🖱️ Mouse: Rotate/Zoom camera</div>
        <div>🌍 Seed: {seed}</div>
      </div>
    </div>
  )
}
