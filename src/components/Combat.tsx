/**
 * Combat System - Attack mechanics and damage indicators
 * Ported from Python combat logic in game.py
 */

import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'

interface DamageIndicator {
  id: number
  position: THREE.Vector3
  damage: number
  time: number
}

interface CombatSystemProps {
  playerPosition: { x: number; y: number; z: number }
}

export function CombatSystem({ playerPosition }: CombatSystemProps) {
  const [indicators, setIndicators] = useState<DamageIndicator[]>([])
  const attackCooldownRef = useRef(0)
  const idCounterRef = useRef(0)

  const { playerStats } = useGameStore()

  // Attack input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && attackCooldownRef.current <= 0) {
        performAttack()
        attackCooldownRef.current = 0.5 // 0.5 second cooldown
      }
    }

    const handleClick = () => {
      if (attackCooldownRef.current <= 0) {
        performAttack()
        attackCooldownRef.current = 0.5
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('click', handleClick)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerPosition, playerStats.level])

  const performAttack = () => {
    // Base damage + level bonus
    const baseDamage = 10 + playerStats.level * 2

    // Check for enemies in range (attack range = 3 units)
    const damageEnemy = (window as unknown as { damageEnemy?: (id: number, damage: number) => void }).damageEnemy

    // In a full implementation, we'd check collision with enemies within range
    // For now, the enemy system handles proximity-based combat
    if (damageEnemy) {
      // Enemies handle their own attack logic based on proximity
    }

    // Show attack indicator
    const newIndicator: DamageIndicator = {
      id: idCounterRef.current++,
      position: new THREE.Vector3(
        playerPosition.x + (Math.random() - 0.5) * 2,
        playerPosition.y + 1.5,
        playerPosition.z + (Math.random() - 0.5) * 2
      ),
      damage: baseDamage,
      time: 0,
    }

    setIndicators((prev) => [...prev, newIndicator])
  }

  // Update cooldown and indicators
  useFrame((_, delta) => {
    if (attackCooldownRef.current > 0) {
      attackCooldownRef.current -= delta
    }

    // Update indicators
    setIndicators((prev) =>
      prev
        .map((ind) => ({ ...ind, time: ind.time + delta }))
        .filter((ind) => ind.time < 1) // Remove after 1 second
    )
  })

  return (
    <group>
      {/* Attack range indicator when attacking */}
      {attackCooldownRef.current > 0 && (
        <mesh
          position={[playerPosition.x, 0.02, playerPosition.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[2.8, 3, 32]} />
          <meshBasicMaterial color="#f44336" transparent opacity={0.5} />
        </mesh>
      )}

      {/* Damage indicators */}
      {indicators.map((ind) => (
        <sprite
          key={ind.id}
          position={[
            ind.position.x,
            ind.position.y + ind.time * 2, // Float upward
            ind.position.z,
          ]}
          scale={[1 - ind.time * 0.5, 1 - ind.time * 0.5, 1]}
        >
          <spriteMaterial
            color="#FFD700"
            transparent
            opacity={1 - ind.time}
          />
        </sprite>
      ))}
    </group>
  )
}
