import {
  canUnlockNextLevel,
  createLevel,
  CUSTOMER_TEMPLATES,
  LEVEL_CONFIGS,
  MAX_LEVELS,
  validateLevelCompletion,
} from '../constants/level-config'
import type {
  Challenge,
  CompletedLevel,
  CustomerTemplate,
  Level,
  LevelCompletionResult,
  LevelConfig,
  LevelProgress,
  TreatmentResults,
} from '../types/level'
import { storageManager } from './storage'

/**
 * LevelManager - Manages level progression, state, and completion
 * User Story 1: Progressive Difficulty Levels
 */
export class LevelManager {
  private static instance: LevelManager
  private currentLevel: number = 1
  private progress: LevelProgress
  private eventHandlers: Map<string, ((...args: unknown[]) => void)[]> =
    new Map()
  private initialized = false

  private constructor() {
    this.progress = this.getDefaultProgress()
  }

  public static getInstance(): LevelManager {
    if (!LevelManager.instance) {
      LevelManager.instance = new LevelManager()
    }
    return LevelManager.instance
  }

  public initialize(): void {
    if (this.initialized) return

    this.loadProgress()
    this.initialized = true
    this.emit('level-initialized', this.progress)
  }

  public isInitialized(): boolean {
    return this.initialized
  }

  /**
   * Get the current level
   */
  public getCurrentLevel(): Level {
    return createLevel(this.currentLevel)
  }

  /**
   * Get level by number
   */
  public getLevel(levelNumber: number): Level | null {
    if (levelNumber < 1 || levelNumber > MAX_LEVELS) {
      return null
    }
    return createLevel(levelNumber)
  }

  /**
   * Get the next level
   */
  public getNextLevel(): Level | null {
    const nextLevelNumber = this.currentLevel + 1
    if (nextLevelNumber > MAX_LEVELS) {
      return null
    }
    return createLevel(nextLevelNumber)
  }

  /**
   * Set current level
   */
  public setCurrentLevel(levelNumber: number): boolean {
    if (levelNumber < 1 || levelNumber > MAX_LEVELS) {
      return false
    }

    if (!this.isLevelUnlocked(levelNumber.toString())) {
      return false
    }

    this.currentLevel = levelNumber
    this.progress.currentLevel = levelNumber
    this.emit('level-changed', this.getCurrentLevel())
    return true
  }

  /**
   * Check if a level is unlocked
   */
  public isLevelUnlocked(levelId: string): boolean {
    return this.progress.unlockedLevels.includes(levelId)
  }

  /**
   * Unlock a specific level
   */
  public unlockLevel(levelId: string): boolean {
    if (this.progress.unlockedLevels.includes(levelId)) {
      return true
    }

    const levelNum = parseInt(levelId, 10)
    if (isNaN(levelNum) || levelNum < 1 || levelNum > MAX_LEVELS) {
      return false
    }

    this.progress.unlockedLevels.push(levelId)
    this.emit('level-unlocked', levelId)
    this.saveProgress()
    return true
  }

  /**
   * Validate level completion
   */
  public validateLevelCompletion(score: number, satisfaction: number): boolean {
    return validateLevelCompletion(this.currentLevel, score, satisfaction)
  }

  /**
   * Complete a level and process results
   */
  public completeLevel(results: TreatmentResults): LevelCompletionResult {
    const level = this.getCurrentLevel()
    const config = LEVEL_CONFIGS[this.currentLevel]

    const success = this.validateLevelCompletion(
      results.score,
      results.satisfaction,
    )

    // Calculate currency earned (score to currency conversion)
    const currencyEarned = Math.floor(results.score * config.scoreMultiplier)

    // Check if next level should unlock
    const nextLevelUnlocked =
      success &&
      canUnlockNextLevel(this.currentLevel, results.score, results.satisfaction)

    // Track completed challenges
    const challengesCompleted = this.checkCompletedChallenges(results)

    // Record completion
    if (success) {
      const completedLevel: CompletedLevel = {
        levelId: level.id,
        completionDate: new Date(),
        score: results.score,
        satisfaction: results.satisfaction,
        currencyEarned,
        challengesCompleted,
      }

      this.progress.completedLevels.push(completedLevel)

      // Update best score if better
      if (
        !this.progress.bestScores[level.id] ||
        results.score > this.progress.bestScores[level.id]
      ) {
        this.progress.bestScores[level.id] = results.score
      }

      // Update total currency
      this.progress.totalCurrency += currencyEarned

      // Unlock next level if criteria met
      if (nextLevelUnlocked) {
        const nextLevelId = (this.currentLevel + 1).toString()
        this.unlockLevel(nextLevelId)
      }

      this.saveProgress()
    }

    const completionResult: LevelCompletionResult = {
      levelId: level.id,
      success,
      score: results.score,
      satisfaction: results.satisfaction,
      timeUsed: results.timeUsed,
      currencyEarned,
      nextLevelUnlocked,
      challengesCompleted,
    }

    this.emit('level-completed', completionResult)
    return completionResult
  }

  /**
   * Check which challenges were completed
   */
  private checkCompletedChallenges(results: TreatmentResults): string[] {
    const completed: string[] = []
    const level = this.getCurrentLevel()
    const challenges = level.unlockCriteria.optionalChallenges

    for (const challenge of challenges) {
      if (this.isChallengeCompleted(challenge, results)) {
        completed.push(challenge.id)
      }
    }

    return completed
  }

  /**
   * Check if a specific challenge is completed
   */
  private isChallengeCompleted(
    challenge: Challenge,
    results: TreatmentResults,
  ): boolean {
    switch (challenge.id) {
      case 'perfect_satisfaction_1':
        return results.satisfaction >= 100
      case 'quick_completion_2':
        return results.timeUsed < 30
      case 'combo_master_3':
        // Would need combo tracking - placeholder
        return false
      case 'expert_status_4':
        return results.satisfaction >= 90
      default:
        return false
    }
  }

  /**
   * Retry current level
   */
  public retryLevel(): boolean {
    this.emit('level-retry', this.getCurrentLevel())
    return true
  }

  /**
   * Get player's progress
   */
  public getLevelProgress(): LevelProgress {
    return { ...this.progress }
  }

  /**
   * Get all unlocked levels
   */
  public getUnlockedLevels(): Level[] {
    return this.progress.unlockedLevels
      .map((id) => this.getLevel(parseInt(id, 10)))
      .filter((level): level is Level => level !== null)
  }

  /**
   * Get best score for a level
   */
  public getBestScore(levelId: string): number {
    return this.progress.bestScores[levelId] || 0
  }

  /**
   * Get customer template for current level
   */
  public getCustomerTemplate(): CustomerTemplate {
    return CUSTOMER_TEMPLATES[this.currentLevel]
  }

  /**
   * Get level configuration
   */
  public getLevelConfig(): LevelConfig {
    return LEVEL_CONFIGS[this.currentLevel]
  }

  /**
   * Save progress to storage
   */
  public saveProgress(): void {
    storageManager.saveLevelProgress(this.progress)
    this.emit('progress-saved', this.progress)
  }

  /**
   * Load progress from storage
   */
  public loadProgress(): void {
    const savedProgress = storageManager.loadLevelProgress()
    if (savedProgress) {
      this.progress = savedProgress
      this.currentLevel = savedProgress.currentLevel
    } else {
      this.progress = this.getDefaultProgress()
      this.currentLevel = 1
    }
    this.emit('progress-loaded', this.progress)
  }

  /**
   * Reset all progress
   */
  public resetProgress(): void {
    this.progress = this.getDefaultProgress()
    this.currentLevel = 1
    storageManager.clearLevelData()
    this.emit('progress-reset')
  }

  /**
   * Get default progress
   */
  private getDefaultProgress(): LevelProgress {
    return {
      currentLevel: 1,
      unlockedLevels: ['1'],
      completedLevels: [],
      bestScores: {},
      totalCurrency: 0,
    }
  }

  /**
   * Event handling
   */
  public on(event: string, callback: (...args: unknown[]) => void): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event)!.push(callback)

    // Return unsubscribe function
    return () => {
      this.off(event, callback)
    }
  }

  public off(event: string, callback: (...args: unknown[]) => void): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      const index = handlers.indexOf(callback)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  private emit(event: string, ...args: unknown[]): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach((callback) => callback(...args))
    }
  }

  /**
   * Get level info display data
   */
  public getLevelInfo(): {
    currentLevel: number
    maxLevels: number
    unlockedCount: number
    completionRate: number
    totalCurrency: number
  } {
    const unlockedCount = this.progress.unlockedLevels.length
    const completionRate = Math.round(
      (this.progress.completedLevels.length / MAX_LEVELS) * 100,
    )

    return {
      currentLevel: this.currentLevel,
      maxLevels: MAX_LEVELS,
      unlockedCount,
      completionRate,
      totalCurrency: this.progress.totalCurrency,
    }
  }
}

// Global instance
export const levelManager = LevelManager.getInstance()

// Convenience functions
export function getLevelManager(): LevelManager {
  return LevelManager.getInstance()
}

export function initializeLevelManager(): void {
  levelManager.initialize()
}
