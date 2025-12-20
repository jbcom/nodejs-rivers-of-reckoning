/**
 * Rivers of Reckoning - Main Application
 * 
 * Full Strata integration with ported pygame logic.
 * Uses Strata's built-in terrain, water, weather, and day/night systems.
 */

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import {
  Water,
  Terrain,
  Vegetation,
  Sky,
  Player,
  GameState as StrataGameState,
  WeatherSystem,
  HUD,
} from '@jbcom/strata'
import { useGameStore } from './store/gameStore'
import { BIOME_CONFIGS, BiomeType, WeatherType, TimePhase } from './types/game'
import { TitleScreen } from './components/TitleScreen'
import { GameOverScreen } from './components/GameOverScreen'
import { PauseMenu } from './components/PauseMenu'
import { GameHUD } from './components/GameHUD'
import { useEffect } from 'react'

// Convert our biome configs to Strata format
const strataBiomes = Object.entries(BIOME_CONFIGS).map(([key, config]) => ({
  name: config.name,
  temperature: config.temperature,
  moisture: config.moisture,
  color: config.baseColor,
  vegetationDensity: config.treeDensity + config.rockDensity,
}))

// Map our weather types to Strata weather
const mapWeatherToStrata = (weather: WeatherType): string => {
  switch (weather) {
    case WeatherType.CLEAR: return 'clear'
    case WeatherType.RAIN: return 'rain'
    case WeatherType.FOG: return 'fog'
    case WeatherType.SNOW: return 'snow'
    case WeatherType.STORM: return 'storm'
    default: return 'clear'
  }
}

// Map our time phase to Strata time
const mapTimeToStrata = (phase: TimePhase, hour: number): number => {
  // Strata uses 0-1 for time of day
  return hour / 24
}

function Game() {
  const {
    playerPosition,
    playerHealth,
    weather,
    timeOfDay,
    worldState,
    movePlayer,
    updateTime,
    updateWeather,
  } = useGameStore()

  // Game loop - update systems every frame
  useEffect(() => {
    const interval = setInterval(() => {
      const dt = 1 / 60
      updateTime(dt)
      updateWeather(dt)
    }, 1000 / 60)

    return () => clearInterval(interval)
  }, [updateTime, updateWeather])

  return (
    <>
      <Canvas
        camera={{ position: [0, 50, 100], fov: 60 }}
        style={{ width: '100vw', height: '100vh' }}
      >
        <StrataGameState
          biomes={strataBiomes}
          initialBiome={BIOME_CONFIGS[worldState.currentBiome].name}
          weather={mapWeatherToStrata(weather.current)}
          seed={worldState.seed}
        >
          {/* Dynamic sky with day/night cycle */}
          <Sky
            timeOfDay={mapTimeToStrata(timeOfDay.phase, timeOfDay.hour)}
            turbidity={weather.current === WeatherType.STORM ? 10 : 2}
          />

          {/* Procedural terrain - GPU powered */}
          <Terrain
            size={2000}
            resolution={256}
            heightScale={50}
          />

          {/* Realistic water with caustics */}
          <Water
            size={2000}
            distortionScale={weather.windSpeed * 0.5}
          />

          {/* Instanced vegetation */}
          <Vegetation
            count={10000}
            spread={1000}
            types={['grass', 'tree', 'rock', 'bush']}
          />

          {/* Weather effects */}
          <WeatherSystem
            type={mapWeatherToStrata(weather.current)}
            intensity={weather.intensity}
            windSpeed={weather.windSpeed}
            windDirection={weather.windAngle}
          />

          {/* Player character */}
          <Player
            position={[playerPosition.x, playerPosition.y, playerPosition.z]}
            health={playerHealth.current}
            maxHealth={playerHealth.maximum}
            onMove={(dx: number, dy: number, dz: number) => movePlayer(dx, dy, dz)}
          />

          {/* Camera controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={10}
            maxDistance={200}
          />

          {/* Lighting */}
          <ambientLight intensity={timeOfDay.phase === TimePhase.NIGHT ? 0.2 : 0.5} />
          <directionalLight
            position={[100, 100, 50]}
            intensity={timeOfDay.phase === TimePhase.NIGHT ? 0.1 : 1}
            castShadow
          />
        </StrataGameState>
      </Canvas>

      {/* HUD overlay */}
      <GameHUD />
    </>
  )
}

export default function App() {
  const { gameState } = useGameStore()

  switch (gameState) {
    case 'title':
      return <TitleScreen />
    case 'playing':
      return <Game />
    case 'paused':
      return (
        <>
          <Game />
          <PauseMenu />
        </>
      )
    case 'gameover':
      return <GameOverScreen />
    default:
      return <TitleScreen />
  }
}
