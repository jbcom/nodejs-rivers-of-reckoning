/**
 * Enemy System - Procedural enemy generation and AI
 * Ported from Python enemy.py and procedural_enemies.py
 */

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Enemy types with different stats
const ENEMY_TYPES = [
  { name: 'Slime', color: '#4CAF50', speed: 2, damage: 5, health: 20, xp: 10 },
  { name: 'Goblin', color: '#8BC34A', speed: 4, damage: 8, health: 30, xp: 20 },
  { name: 'Orc', color: '#795548', speed: 3, damage: 15, health: 50, xp: 35 },
  { name: 'Wraith', color: '#9C27B0', speed: 5, damage: 12, health: 25, xp: 30 },
  { name: 'Wolf', color: '#607D8B', speed: 6, damage: 10, health: 35, xp: 25 },
]

// Seeded random for deterministic spawning
class SeededRandom {
  private seed: number
  constructor(seed: number) { this.seed = seed }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }
  nextInt(max: number): number {
    return Math.floor(this.next() * max)
  }
}

interface EnemyData {
  id: number
  type: typeof ENEMY_TYPES[0]
  position: THREE.Vector3
  health: number
  maxHealth: number
  state: 'idle' | 'wandering' | 'chasing' | 'attacking'
  targetPosition: THREE.Vector3
  stateTimer: number
}

interface EnemySystemProps {
  seed: number
  playerPosition: { x: number; y: number; z: number }
  heightFunction: (x: number, z: number) => number
  onEnemyDefeated: (xp: number, gold: number) => void
  onPlayerDamage: (damage: number) => void
}

export function EnemySystem({
  seed,
  playerPosition,
  heightFunction,
  onEnemyDefeated,
  onPlayerDamage,
}: EnemySystemProps) {
  const enemiesRef = useRef<EnemyData[]>([])
  const meshRefs = useRef<Map<number, THREE.Mesh>>(new Map())
  const lastAttackRef = useRef<Map<number, number>>(new Map())

  // Initialize enemies
  useEffect(() => {
    const rng = new SeededRandom(seed)
    const enemies: EnemyData[] = []

    // Spawn 10-15 enemies
    const count = 10 + rng.nextInt(6)

    for (let i = 0; i < count; i++) {
      const type = ENEMY_TYPES[rng.nextInt(ENEMY_TYPES.length)]
      const x = (rng.next() - 0.5) * 180
      const z = (rng.next() - 0.5) * 180
      const y = heightFunction(x, z) + 0.5

      enemies.push({
        id: i,
        type,
        position: new THREE.Vector3(x, Math.max(0.5, y), z),
        health: type.health,
        maxHealth: type.health,
        state: 'wandering',
        targetPosition: new THREE.Vector3(x, y, z),
        stateTimer: rng.next() * 5,
      })
    }

    enemiesRef.current = enemies
  }, [seed, heightFunction])

  // Enemy AI update
  useFrame((_, delta) => {
    const playerPos = new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z)

    enemiesRef.current.forEach((enemy) => {
      if (enemy.health <= 0) return

      const mesh = meshRefs.current.get(enemy.id)
      if (!mesh) return

      const distToPlayer = enemy.position.distanceTo(playerPos)

      // State machine
      enemy.stateTimer -= delta

      // Detection range
      const detectRange = 20
      const attackRange = 2

      if (distToPlayer < attackRange) {
        enemy.state = 'attacking'
      } else if (distToPlayer < detectRange) {
        enemy.state = 'chasing'
      } else if (enemy.stateTimer <= 0) {
        enemy.state = enemy.state === 'idle' ? 'wandering' : 'idle'
        enemy.stateTimer = 2 + Math.random() * 3

        if (enemy.state === 'wandering') {
          // Pick random wander target
          enemy.targetPosition.set(
            enemy.position.x + (Math.random() - 0.5) * 20,
            enemy.position.y,
            enemy.position.z + (Math.random() - 0.5) * 20
          )
        }
      }

      // Movement based on state
      const moveDir = new THREE.Vector3()

      if (enemy.state === 'chasing' || enemy.state === 'attacking') {
        moveDir.subVectors(playerPos, enemy.position).normalize()
      } else if (enemy.state === 'wandering') {
        moveDir.subVectors(enemy.targetPosition, enemy.position).normalize()
      }

      // Apply movement
      if (enemy.state !== 'idle') {
        const speed = enemy.state === 'attacking' ? 0 : enemy.type.speed
        enemy.position.x += moveDir.x * speed * delta
        enemy.position.z += moveDir.z * speed * delta

        // Clamp to bounds
        enemy.position.x = Math.max(-95, Math.min(95, enemy.position.x))
        enemy.position.z = Math.max(-95, Math.min(95, enemy.position.z))

        // Update Y to terrain
        const terrainY = heightFunction(enemy.position.x, enemy.position.z)
        enemy.position.y = Math.max(0.5, terrainY + 0.5)
      }

      // Attack player
      if (enemy.state === 'attacking') {
        const lastAttack = lastAttackRef.current.get(enemy.id) || 0
        const now = Date.now()
        if (now - lastAttack > 1000) { // Attack every 1 second
          onPlayerDamage(enemy.type.damage)
          lastAttackRef.current.set(enemy.id, now)
        }
      }

      // Update mesh
      mesh.position.copy(enemy.position)
      if (moveDir.lengthSq() > 0) {
        mesh.rotation.y = Math.atan2(moveDir.x, moveDir.z)
      }
    })
  })

  // Handle enemy damage (called from combat)
  const damageEnemy = (enemyId: number, damage: number) => {
    const enemy = enemiesRef.current.find(e => e.id === enemyId)
    if (enemy && enemy.health > 0) {
      enemy.health -= damage
      if (enemy.health <= 0) {
        // Enemy defeated
        const goldReward = Math.floor(enemy.type.xp / 2)
        onEnemyDefeated(enemy.type.xp, goldReward)
      }
    }
  }

  // Expose damageEnemy through window for combat system
  useEffect(() => {
    (window as unknown as { damageEnemy: typeof damageEnemy }).damageEnemy = damageEnemy
    return () => {
      delete (window as unknown as { damageEnemy?: typeof damageEnemy }).damageEnemy
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onEnemyDefeated])

  return (
    <group>
      {enemiesRef.current.map((enemy) => {
        if (enemy.health <= 0) return null

        const healthPercent = enemy.health / enemy.maxHealth

        return (
          <group key={enemy.id}>
            {/* Enemy body */}
            <mesh
              ref={(ref) => {
                if (ref) meshRefs.current.set(enemy.id, ref)
              }}
              position={enemy.position}
              castShadow
            >
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshStandardMaterial
                color={enemy.type.color}
                roughness={0.6}
                metalness={0.2}
              />
            </mesh>

            {/* Health bar */}
            <mesh
              position={[enemy.position.x, enemy.position.y + 0.8, enemy.position.z]}
              rotation={[0, 0, 0]}
            >
              <planeGeometry args={[0.8 * healthPercent, 0.1]} />
              <meshBasicMaterial
                color={healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FF9800' : '#f44336'}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
