/**
 * Random Events System - Rivers of Reckoning
 * 
 * Handles procedural events that occur during gameplay.
 */

import { useGameStore } from '../store/gameStore'

type GameStoreType = ReturnType<typeof useGameStore.getState>

export interface RandomEvent {
  id: string
  name: string
  description: string
  chance: number // 0-1
  action: (store: GameStoreType) => void
}

export const RANDOM_EVENTS: RandomEvent[] = [
  {
    id: 'gold_find',
    name: 'Lucky Find',
    description: 'You found some gold on the ground!',
    chance: 0.05,
    action: (store: GameStoreType) => {
      const amount = Math.floor(Math.random() * 50) + 10
      store.addGold(amount)
    }
  },
  {
    id: 'health_shrine',
    name: 'Ancient Shrine',
    description: 'You feel a surge of vitality.',
    chance: 0.03,
    action: (store: GameStoreType) => {
      store.healPlayer(30)
    }
  },
  {
    id: 'sudden_storm',
    name: 'Sudden Storm',
    description: 'The weather turns for the worse!',
    chance: 0.02,
    action: (store: GameStoreType) => {
      store.changeWeather()
    }
  },
  {
    id: 'bandit_ambush',
    name: 'Bandit Ambush',
    description: 'Bandits stole some of your gold!',
    chance: 0.02,
    action: (store: GameStoreType) => {
      const currentGold = store.playerStats.gold
      const loss = Math.min(currentGold, 20 + Math.floor(Math.random() * 30))
      store.addGold(-loss)
    }
  }
]

export function useRandomEvents() {
  const store = useGameStore()
  
  const triggerRandomEvent = (seed?: number) => {
    const roll = seed !== undefined ? (() => {
      const x = Math.sin(seed) * 10000
      return x - Math.floor(x)
    })() : Math.random()
    
    let cumulativeChance = 0
    
    for (const event of RANDOM_EVENTS) {
      cumulativeChance += event.chance
      if (roll < cumulativeChance) {
        event.action(store)
        return event
      }
    }
    return null
  }

  return { triggerRandomEvent }
}
