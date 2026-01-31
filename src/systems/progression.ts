/**
 * Progression system for the spa day game
 * Handles player progression, unlocks, and achievements
 */

import { GAME_CONFIG } from '../constants/game-config'
import { getMaskTypeConfig, MaskType } from '../constants/mask-types'
import { getGameStateManager } from '../gameobjects/base'

export interface PlayerProgress {
  totalScore: number
  completions: number
  averageSatisfaction: number
  unlockedMaskTypes: MaskType[]
  currentLevel: number
  achievements: Achievement[]
  lastPlayed: Date
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: Date
  requirement: {
    type: 'score' | 'completions' | 'satisfaction' | 'mask_types'
    value: number
  }
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_treatment',
    name: 'First Treatment',
    description: 'Complete your first spa treatment',
    icon: '🌟',
    requirement: {
      type: 'completions',
      value: 1,
    },
  },
  {
    id: 'spa_master',
    name: 'Spa Master',
    description: 'Complete 10 spa treatments',
    icon: '👑',
    requirement: {
      type: 'completions',
      value: 10,
    },
  },
  {
    id: 'high_satisfaction',
    name: 'Customer Delight',
    description: 'Achieve 90% average satisfaction',
    icon: '😊',
    requirement: {
      type: 'satisfaction',
      value: 90,
    },
  },
  {
    id: 'score_hunter',
    name: 'Score Hunter',
    description: 'Reach 1000 total score',
    icon: '🏆',
    requirement: {
      type: 'score',
      value: 1000,
    },
  },
  {
    id: 'collector',
    name: 'Mask Collector',
    description: 'Unlock all mask types',
    icon: '🎭',
    requirement: {
      type: 'mask_types',
      value: Object.keys(MaskType).length,
    },
  },
]

export class ProgressionSystem {
  private progress: PlayerProgress
  private stateManager = getGameStateManager()

  constructor() {
    this.progress = this.loadProgress()
  }

  private loadProgress(): PlayerProgress {
    const saved = getData(GAME_CONFIG.STORAGE_KEYS.PLAYER_PROGRESS)
    if (saved && typeof saved === 'string') {
      try {
        const parsed = JSON.parse(saved)
        // Convert string dates back to Date objects
        if (parsed.lastPlayed) {
          parsed.lastPlayed = new Date(parsed.lastPlayed)
        }
        if (parsed.achievements) {
          parsed.achievements = parsed.achievements.map((a: Achievement) => ({
            ...a,
            unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : undefined,
          }))
        }
        return parsed
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load progress:', error)
      }
    }

    // Default progress
    return {
      totalScore: 0,
      completions: 0,
      averageSatisfaction: 50,
      unlockedMaskTypes: [MaskType.HYDRATING], // Start with basic mask
      currentLevel: 1,
      achievements: [],
      lastPlayed: new Date(),
    }
  }

  private saveProgress(): void {
    try {
      setData(
        GAME_CONFIG.STORAGE_KEYS.PLAYER_PROGRESS,
        JSON.stringify(this.progress),
      )
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to save progress:', error)
    }
  }

  public getProgress(): PlayerProgress {
    return { ...this.progress }
  }

  public updateProgress(score: number, satisfaction: number): void {
    this.progress.totalScore += score
    this.progress.completions += 1

    // Update average satisfaction
    const totalSatisfaction =
      this.progress.averageSatisfaction * (this.progress.completions - 1) +
      satisfaction
    this.progress.averageSatisfaction = Math.round(
      totalSatisfaction / this.progress.completions,
    )

    // Update level based on score
    this.progress.currentLevel = Math.floor(this.progress.totalScore / 500) + 1

    // Check for new unlocks
    this.checkUnlocks()

    // Check achievements
    this.checkAchievements()

    // Update last played
    this.progress.lastPlayed = new Date()

    // Save progress
    this.saveProgress()

    // Update game state manager
    this.stateManager.setScore(this.progress.totalScore)
    this.stateManager.setCompletions(this.progress.completions)
    this.stateManager.setAverageSatisfaction(this.progress.averageSatisfaction)
  }

  private checkUnlocks(): void {
    const newlyUnlocked: MaskType[] = []

    Object.values(MaskType).forEach((maskType) => {
      if (!this.progress.unlockedMaskTypes.includes(maskType)) {
        const config = getMaskTypeConfig(maskType)
        const { type: reqType, value: reqValue } = config.unlockRequirement

        let shouldUnlock = false

        switch (reqType) {
          case 'score':
            shouldUnlock = this.progress.totalScore >= reqValue
            break
          case 'completions':
            shouldUnlock = this.progress.completions >= reqValue
            break
          case 'satisfaction':
            shouldUnlock = this.progress.averageSatisfaction >= reqValue
            break
        }

        if (shouldUnlock) {
          this.progress.unlockedMaskTypes.push(maskType)
          newlyUnlocked.push(maskType)
        }
      }
    })

    // Emit unlock events for newly unlocked masks
    newlyUnlocked.forEach((maskType) => {
      const config = getMaskTypeConfig(maskType)
      this.stateManager.emit('maskUnlocked', {
        maskType,
        name: config.name,
        icon: config.icon,
      })
    })
  }

  private checkAchievements(): void {
    ACHIEVEMENTS.forEach((achievement) => {
      if (!this.isAchievementUnlocked(achievement.id)) {
        let shouldUnlock = false

        switch (achievement.requirement.type) {
          case 'score':
            shouldUnlock =
              this.progress.totalScore >= achievement.requirement.value
            break
          case 'completions':
            shouldUnlock =
              this.progress.completions >= achievement.requirement.value
            break
          case 'satisfaction':
            shouldUnlock =
              this.progress.averageSatisfaction >= achievement.requirement.value
            break
          case 'mask_types':
            shouldUnlock =
              this.progress.unlockedMaskTypes.length >=
              achievement.requirement.value
            break
        }

        if (shouldUnlock) {
          this.unlockAchievement(achievement)
        }
      }
    })
  }

  private unlockAchievement(achievement: Achievement): void {
    const unlockedAchievement = {
      ...achievement,
      unlockedAt: new Date(),
    }

    this.progress.achievements.push(unlockedAchievement)

    // Emit achievement unlock event
    this.stateManager.emit('achievementUnlocked', unlockedAchievement)
  }

  public isAchievementUnlocked(achievementId: string): boolean {
    return this.progress.achievements.some((a) => a.id === achievementId)
  }

  public isMaskTypeUnlocked(maskType: MaskType): boolean {
    return this.progress.unlockedMaskTypes.includes(maskType)
  }

  public getUnlockedMaskTypes(): MaskType[] {
    return [...this.progress.unlockedMaskTypes]
  }

  public getUnlockedAchievements(): Achievement[] {
    return this.progress.achievements.filter((a) => a.unlockedAt)
  }

  public getLockedAchievements(): Achievement[] {
    return ACHIEVEMENTS.filter((a) => !this.isAchievementUnlocked(a.id))
  }

  public getNextUnlocks(): { maskType: MaskType; progress: number }[] {
    const nextUnlocks: { maskType: MaskType; progress: number }[] = []

    Object.values(MaskType).forEach((maskType) => {
      if (!this.progress.unlockedMaskTypes.includes(maskType)) {
        const config = getMaskTypeConfig(maskType)
        const { type: reqType, value: reqValue } = config.unlockRequirement

        let progress = 0

        switch (reqType) {
          case 'score':
            progress = Math.min(
              100,
              (this.progress.totalScore / reqValue) * 100,
            )
            break
          case 'completions':
            progress = Math.min(
              100,
              (this.progress.completions / reqValue) * 100,
            )
            break
          case 'satisfaction':
            progress = Math.min(
              100,
              (this.progress.averageSatisfaction / reqValue) * 100,
            )
            break
        }

        nextUnlocks.push({ maskType, progress })
      }
    })

    return nextUnlocks.sort((a, b) => b.progress - a.progress)
  }

  public resetProgress(): void {
    this.progress = {
      totalScore: 0,
      completions: 0,
      averageSatisfaction: 50,
      unlockedMaskTypes: [MaskType.HYDRATING],
      currentLevel: 1,
      achievements: [],
      lastPlayed: new Date(),
    }
    this.saveProgress()
  }

  public getLevelProgress(): {
    current: number
    next: number
    progress: number
  } {
    const currentLevel = this.progress.currentLevel
    const currentLevelScore = (currentLevel - 1) * 500
    const nextLevelScore = currentLevel * 500
    const progress =
      ((this.progress.totalScore - currentLevelScore) /
        (nextLevelScore - currentLevelScore)) *
      100

    return {
      current: currentLevel,
      next: currentLevel + 1,
      progress: Math.min(100, Math.max(0, progress)),
    }
  }
}

// Singleton instance
let progressionSystem: ProgressionSystem | null = null

export function getProgressionSystem(): ProgressionSystem {
  if (!progressionSystem) {
    progressionSystem = new ProgressionSystem()
  }
  return progressionSystem
}
