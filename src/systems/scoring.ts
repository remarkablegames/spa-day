import { GAME_CONFIG } from '../constants/game-config'
import { Character } from '../gameobjects/character'
import { FaceMask } from '../gameobjects/mask'
import { TreatmentSession } from '../gameobjects/treatment'

export interface ScoreBreakdown {
  baseScore: number
  effectivenessBonus: number
  timingBonus: number
  completionBonus: number
  satisfactionBonus: number
  comboMultiplier: number
  totalScore: number
}

export interface ScoringEvent {
  type:
    | 'mask_applied'
    | 'treatment_completed'
    | 'combo_achieved'
    | 'milestone_reached'
  score: number
  details?: Record<string, unknown>
  timestamp: number
}

export class ScoringSystem {
  private currentScore: number
  private highScore: number
  private comboCount: number
  private lastActionTime: number
  private scoringHistory: ScoringEvent[]
  private scoreCallbacks: Array<
    (score: number, breakdown: ScoreBreakdown) => void
  >

  constructor() {
    this.currentScore = 0
    this.highScore = 0
    this.comboCount = 0
    this.lastActionTime = 0
    this.scoringHistory = []
    this.scoreCallbacks = []
  }

  public getCurrentScore(): number {
    return this.currentScore
  }

  public getHighScore(): number {
    return this.highScore
  }

  public getComboCount(): number {
    return this.comboCount
  }

  public addScoreCallback(
    callback: (score: number, breakdown: ScoreBreakdown) => void,
  ): void {
    this.scoreCallbacks.push(callback)
  }

  public removeScoreCallback(
    callback: (score: number, breakdown: ScoreBreakdown) => void,
  ): void {
    const index = this.scoreCallbacks.indexOf(callback)
    if (index > -1) {
      this.scoreCallbacks.splice(index, 1)
    }
  }

  public calculateMaskScore(
    mask: FaceMask,
    character: Character,
    faceAreaId: string,
    appliedMasksCount: number,
  ): ScoreBreakdown {
    const baseScore = GAME_CONFIG.BASE_MASK_SCORE
    const effectivenessBonus = this.calculateEffectivenessBonus(mask, character)
    const timingBonus = this.calculateTimingBonus(appliedMasksCount)
    const completionBonus = this.calculateCompletionBonus(appliedMasksCount)
    const comboMultiplier = this.getComboMultiplier()

    const subtotal =
      baseScore + effectivenessBonus + timingBonus + completionBonus
    const totalScore = Math.floor(subtotal * comboMultiplier)

    const breakdown: ScoreBreakdown = {
      baseScore,
      effectivenessBonus,
      timingBonus,
      completionBonus,
      satisfactionBonus: 0, // Added in treatment completion
      comboMultiplier,
      totalScore,
    }

    // Update combo
    this.updateCombo()

    // Record scoring event
    this.recordScoringEvent({
      type: 'mask_applied',
      score: totalScore,
      details: {
        maskId: mask.id,
        maskType: mask.type,
        effectiveness: mask.effectiveness,
        faceAreaId,
      },
      timestamp: Date.now(),
    })

    return breakdown
  }

  public calculateTreatmentScore(
    session: TreatmentSession,
    character: Character,
  ): ScoreBreakdown {
    const appliedMasks = session.appliedMasks
    let totalMaskScore = 0
    let totalEffectiveness = 0

    // Calculate scores for all applied masks
    appliedMasks.forEach((appliedMask) => {
      const mask = FaceMask.getMaskById(
        FaceMask.createMaskTypes(),
        appliedMask.maskId,
      )
      if (mask) {
        const maskBreakdown = this.calculateMaskScore(
          mask,
          character,
          appliedMask.faceAreaId,
          appliedMasks.length,
        )
        totalMaskScore += maskBreakdown.totalScore
        totalEffectiveness += appliedMask.effectiveness
      }
    })

    // Calculate satisfaction bonus
    const satisfactionBonus = this.calculateSatisfactionBonus(
      character,
      totalEffectiveness,
      appliedMasks.length,
    )

    // Apply satisfaction multiplier
    const satisfactionMultiplier =
      character.getSatisfaction() >= 70
        ? GAME_CONFIG.SATISFACTION_BONUS_MULTIPLIER
        : 1
    const finalScore = Math.floor(totalMaskScore * satisfactionMultiplier)

    const breakdown: ScoreBreakdown = {
      baseScore: totalMaskScore,
      effectivenessBonus: 0, // Already included in mask scores
      timingBonus: 0, // Already included in mask scores
      completionBonus: 0, // Already included in mask scores
      satisfactionBonus,
      comboMultiplier: satisfactionMultiplier,
      totalScore: finalScore,
    }

    // Update high score
    if (finalScore > this.highScore) {
      this.highScore = finalScore
    }

    // Record scoring event
    this.recordScoringEvent({
      type: 'treatment_completed',
      score: finalScore,
      details: {
        sessionId: session.sessionId,
        satisfaction: character.getSatisfaction(),
        masksApplied: appliedMasks.length,
        totalEffectiveness,
      },
      timestamp: Date.now(),
    })

    return breakdown
  }

  public calculateQuickCompletionBonus(
    duration: number,
    expectedDuration: number,
  ): number {
    if (duration < expectedDuration * 0.5) {
      return GAME_CONFIG.PERFECT_TIMING_BONUS
    } else if (duration < expectedDuration * 0.8) {
      return Math.floor(GAME_CONFIG.PERFECT_TIMING_BONUS * 0.5)
    }
    return 0
  }

  public calculatePerfectPlacementBonus(allFaceAreasOccupied: boolean): number {
    return allFaceAreasOccupied ? GAME_CONFIG.PERFECT_TIMING_BONUS : 0
  }

  private calculateEffectivenessBonus(
    mask: FaceMask,
    character: Character,
  ): number {
    let bonus = 0

    // Bonus for preferred mask types
    if (character.preferredMaskTypes.includes(mask.type)) {
      bonus = Math.floor(GAME_CONFIG.BASE_MASK_SCORE * 0.2) // 20% bonus
    }

    // Bonus for high effectiveness
    if (mask.effectiveness >= 90) {
      bonus += Math.floor(GAME_CONFIG.BASE_MASK_SCORE * 0.1) // 10% bonus
    }

    return bonus
  }

  private calculateTimingBonus(appliedMasksCount: number): number {
    // Bonus for quick application
    if (appliedMasksCount === 1) {
      return Math.floor(GAME_CONFIG.BASE_MASK_SCORE * 0.1) // 10% bonus for first mask
    } else if (appliedMasksCount === 3) {
      return Math.floor(GAME_CONFIG.BASE_MASK_SCORE * 0.15) // 15% bonus for third mask
    }
    return 0
  }

  private calculateCompletionBonus(appliedMasksCount: number): number {
    const totalFaceAreas = GAME_CONFIG.FACE_AREA_COUNT
    const completionRatio = appliedMasksCount / totalFaceAreas

    if (completionRatio >= 1.0) {
      return GAME_CONFIG.PERFECT_TIMING_BONUS // Perfect completion
    } else if (completionRatio >= 0.8) {
      return Math.floor(GAME_CONFIG.PERFECT_TIMING_BONUS * 0.7) // 70% of perfect bonus
    } else if (completionRatio >= 0.6) {
      return Math.floor(GAME_CONFIG.PERFECT_TIMING_BONUS * 0.4) // 40% of perfect bonus
    }

    return 0
  }

  private calculateSatisfactionBonus(
    character: Character,
    totalEffectiveness: number,
    appliedMasksCount: number,
  ): number {
    const satisfactionLevel = character.getSatisfaction()
    const averageEffectiveness = totalEffectiveness / appliedMasksCount

    // Bonus based on satisfaction level
    let satisfactionBonus = 0
    if (satisfactionLevel >= 90) {
      satisfactionBonus = Math.floor(GAME_CONFIG.BASE_MASK_SCORE * 0.5) // 50% bonus
    } else if (satisfactionLevel >= 70) {
      satisfactionBonus = Math.floor(GAME_CONFIG.BASE_MASK_SCORE * 0.3) // 30% bonus
    }

    // Bonus for high average effectiveness
    if (averageEffectiveness >= 85) {
      satisfactionBonus += Math.floor(GAME_CONFIG.BASE_MASK_SCORE * 0.2) // 20% bonus
    }

    return satisfactionBonus
  }

  private getComboMultiplier(): number {
    const currentTime = Date.now()
    const timeSinceLastAction = currentTime - this.lastActionTime

    // Reset combo if too much time has passed
    if (timeSinceLastAction > GAME_CONFIG.EFFECT_DURATION) {
      this.comboCount = 0
    }

    // Calculate combo multiplier
    if (this.comboCount >= 3) {
      return GAME_CONFIG.COMBO_MULTIPLIER
    } else if (this.comboCount >= 2) {
      return 1.2
    }

    return 1
  }

  private updateCombo(): void {
    this.comboCount++
    this.lastActionTime = Date.now()

    // Record combo achievement
    if (this.comboCount === 3) {
      this.recordScoringEvent({
        type: 'combo_achieved',
        score: Math.floor(GAME_CONFIG.BASE_MASK_SCORE * 0.5),
        details: { comboCount: this.comboCount },
        timestamp: Date.now(),
      })
    }
  }

  public resetCombo(): void {
    this.comboCount = 0
  }

  public addScore(score: number, breakdown?: ScoreBreakdown): void {
    this.currentScore += score

    // Update high score
    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore
    }

    // Notify callbacks
    this.scoreCallbacks.forEach((callback) => {
      callback(
        score,
        breakdown || {
          baseScore: score,
          effectivenessBonus: 0,
          timingBonus: 0,
          completionBonus: 0,
          satisfactionBonus: 0,
          comboMultiplier: 1,
          totalScore: score,
        },
      )
    })
  }

  public resetScore(): void {
    this.currentScore = 0
    this.comboCount = 0
    this.lastActionTime = 0
    this.scoringHistory = []
  }

  public getScoringHistory(): ScoringEvent[] {
    return [...this.scoringHistory]
  }

  public getScoreStatistics() {
    const recentEvents = this.scoringHistory.slice(-10) // Last 10 events
    const totalRecentScore = recentEvents.reduce(
      (sum, event) => sum + event.score,
      0,
    )
    const averageRecentScore =
      recentEvents.length > 0 ? totalRecentScore / recentEvents.length : 0

    return {
      currentScore: this.currentScore,
      highScore: this.highScore,
      comboCount: this.comboCount,
      averageRecentScore,
      totalEvents: this.scoringHistory.length,
      recentEvents: recentEvents.length,
    }
  }

  private recordScoringEvent(event: ScoringEvent): void {
    this.scoringHistory.push(event)

    // Keep only last 100 events to prevent memory issues
    if (this.scoringHistory.length > 100) {
      this.scoringHistory = this.scoringHistory.slice(-100)
    }
  }
}

// Global scoring system instance
let scoringSystem: ScoringSystem | null = null

export function initScoringSystem(): ScoringSystem {
  if (!scoringSystem) {
    scoringSystem = new ScoringSystem()
  }
  return scoringSystem
}

export function getScoringSystem(): ScoringSystem {
  if (!scoringSystem) {
    throw new Error(
      'Scoring system not initialized. Call initScoringSystem() first.',
    )
  }
  return scoringSystem
}
