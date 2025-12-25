/**
 * Quest System - Rivers of Reckoning
 * 
 * Procedurally generates and manages player quests.
 */

import { useGameStore } from '../store/gameStore'
import { Quest, QuestType } from '../types/game'

export function useQuestSystem() {
  const { activeQuests, completeQuest } = useGameStore()

  const generateQuest = (level: number, seed: number): Quest => {
    const types = [QuestType.DEFEAT_ENEMIES, QuestType.TRAVEL_DISTANCE, QuestType.COLLECT_GOLD]
    
    // Simple deterministic PRNG from seed
    const seededRandom = (s: number) => {
      const x = Math.sin(s) * 10000
      return x - Math.floor(x)
    }

    const type = types[Math.floor(seededRandom(seed) * types.length)]
    const id = `quest_${seed}_${level}_${type}`
    
    let description = ''
    let targetAmount = 0
    let rewardGold = 0
    let rewardExp = 0

    switch (type) {
      case QuestType.DEFEAT_ENEMIES:
        targetAmount = 3 + Math.floor(level * 1.5)
        description = `Defeat ${targetAmount} enemies`
        rewardGold = targetAmount * 10
        rewardExp = targetAmount * 20
        break
      case QuestType.TRAVEL_DISTANCE:
        targetAmount = 100 + level * 50
        description = `Travel ${targetAmount} meters`
        rewardGold = Math.floor(targetAmount / 2)
        rewardExp = Math.floor(targetAmount / 1.5)
        break
      case QuestType.COLLECT_GOLD:
        targetAmount = 50 + level * 25
        description = `Collect ${targetAmount} gold`
        rewardGold = Math.floor(targetAmount * 0.5) // Bonus gold
        rewardExp = targetAmount
        break
    }

    return {
      id,
      type,
      description,
      targetAmount,
      currentAmount: 0,
      rewardGold,
      rewardExp,
      isCompleted: false,
    }
  }

  const checkQuests = () => {
    activeQuests.forEach(quest => {
      if (quest.isCompleted) {
        // Automatically complete and reward
        completeQuest(quest.id)
        console.log(`Quest Completed: ${quest.description}`)
      }
    })
  }

  return { generateQuest, checkQuests }
}
