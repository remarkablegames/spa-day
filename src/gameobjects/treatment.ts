import { GAME_CONFIG } from '../constants/game-config'
import { GameObject } from './base'
import { Character } from './character'
import { FaceMask } from './mask'

export interface AppliedMask {
  maskId: string
  faceAreaId: string
  applicationTime: number
  completionTime: number | null
  effectiveness: number
}

export interface TreatmentConfig {
  sessionId: string
  characterId: string
  startTime: number
  duration: number
}

export enum SessionStatus {
  PREPARING = 'preparing',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  INTERRUPTED = 'interrupted',
}

export class TreatmentSession extends GameObject {
  public sessionId: string
  public characterId: string
  public startTime: number
  public duration: number
  public appliedMasks: AppliedMask[]
  public status: SessionStatus
  public score: number
  public satisfaction: number

  constructor(config: TreatmentConfig) {
    super(config.sessionId, vec2(0, 0))
    this.sessionId = config.sessionId
    this.characterId = config.characterId
    this.startTime = config.startTime
    this.duration = config.duration
    this.appliedMasks = []
    this.status = SessionStatus.PREPARING
    this.score = 0
    this.satisfaction = 0
  }

  public update() {
    if (!this.isActive) return

    const currentTime = Date.now()
    const elapsedTime = (currentTime - this.startTime) / 1000 // Convert to seconds

    // Update applied masks
    this.appliedMasks.forEach((mask) => {
      if (!mask.completionTime && elapsedTime >= mask.effectiveness) {
        mask.completionTime = currentTime
      }
    })

    // Check if treatment is complete
    if (this.status === SessionStatus.ACTIVE && elapsedTime >= this.duration) {
      this.completeTreatment()
    }
  }

  public render() {
    // Treatment session doesn't have direct visual rendering
    // This is handled by the character and mask entities
  }

  public startTreatment(): boolean {
    if (this.status !== SessionStatus.PREPARING) return false

    this.status = SessionStatus.ACTIVE
    this.startTime = Date.now()
    return true
  }

  public completeTreatment(): boolean {
    if (this.status !== SessionStatus.ACTIVE) return false

    this.status = SessionStatus.COMPLETED
    this.score = this.calculateScore()
    this.calculateSatisfaction()
    return true
  }

  public interruptTreatment(): boolean {
    if (this.status === SessionStatus.COMPLETED) return false

    this.status = SessionStatus.INTERRUPTED
    // Calculate partial score based on progress
    this.calculatePartialScore()
    return true
  }

  public applyMask(
    maskId: string,
    faceAreaId: string,
    character: Character,
  ): boolean {
    // Start treatment if not already started
    if (this.status === SessionStatus.PREPARING) {
      this.startTreatment()
    }

    if (this.status !== SessionStatus.ACTIVE) return false

    // Check if mask can be applied to this face area
    const success = character.applyMask(faceAreaId, maskId)
    if (!success) return false

    const appliedMask: AppliedMask = {
      maskId,
      faceAreaId,
      applicationTime: Date.now(),
      completionTime: null,
      effectiveness: this.calculateMaskEffectiveness(maskId, character),
    }

    this.appliedMasks.push(appliedMask)
    return true
  }

  public removeMask(faceAreaId: string, character: Character): boolean {
    if (this.status !== SessionStatus.ACTIVE) return false

    const success = character.removeMask(faceAreaId)
    if (!success) return false

    // Remove from applied masks
    this.appliedMasks = this.appliedMasks.filter(
      (mask) => mask.faceAreaId !== faceAreaId,
    )
    return true
  }

  public getElapsedTime(): number {
    if (this.status === SessionStatus.PREPARING) return 0
    return (Date.now() - this.startTime) / 1000
  }

  public getRemainingTime(): number {
    if (this.status === SessionStatus.COMPLETED) return 0
    return Math.max(0, this.duration - this.getElapsedTime())
  }

  public getProgress(): number {
    return Math.min(1, this.getElapsedTime() / this.duration)
  }

  public isComplete(): boolean {
    return this.status === SessionStatus.COMPLETED
  }

  public get treatmentActive(): boolean {
    return this.status === SessionStatus.ACTIVE
  }

  public getCompletedMasks(): AppliedMask[] {
    return this.appliedMasks.filter((mask) => mask.completionTime !== null)
  }

  public getAppliedMasksCount(): number {
    return this.appliedMasks.length
  }

  private calculateMaskEffectiveness(
    maskId: string,
    character: Character,
  ): number {
    // Base effectiveness
    let effectiveness = 80

    // Bonus for preferred mask types
    const mask = FaceMask.getMaskById(FaceMask.createMaskTypes(), maskId)
    if (mask && character.preferredMaskTypes.includes(mask.type)) {
      effectiveness += 20
    }

    return Math.min(100, effectiveness)
  }

  private calculateScore(): number {
    let totalScore = 0

    this.appliedMasks.forEach((mask) => {
      const baseScore = GAME_CONFIG.BASE_MASK_SCORE
      const effectivenessMultiplier = mask.effectiveness / 100
      totalScore += Math.floor(baseScore * effectivenessMultiplier)
    })

    // Bonus for completing all face areas
    if (this.appliedMasks.length >= GAME_CONFIG.FACE_AREA_COUNT) {
      totalScore += GAME_CONFIG.PERFECT_TIMING_BONUS
    }

    // Bonus for quick completion
    const completionTime = this.getElapsedTime()
    if (completionTime <= this.duration * 0.8) {
      totalScore += GAME_CONFIG.PERFECT_TIMING_BONUS
    }

    return totalScore
  }

  private calculatePartialScore(): void {
    const progress = this.getProgress()
    this.score = Math.floor(this.calculateScore() * progress)
  }

  private calculateSatisfaction(): void {
    if (this.appliedMasks.length === 0) {
      this.satisfaction = 0
      return
    }

    let satisfactionScore = 0
    this.appliedMasks.forEach((mask) => {
      satisfactionScore += mask.effectiveness
    })

    // Normalize to 0-100 range
    const maxPossibleScore = this.appliedMasks.length * 100
    this.satisfaction = Math.min(
      100,
      (satisfactionScore / maxPossibleScore) * 100,
    )

    // Apply satisfaction bonus multiplier to score
    if (this.satisfaction >= 70) {
      this.score = Math.floor(
        this.score * GAME_CONFIG.SATISFACTION_BONUS_MULTIPLIER,
      )
    }
  }

  public getSummary() {
    return {
      sessionId: this.sessionId,
      characterId: this.characterId,
      status: this.status,
      score: this.score,
      satisfaction: this.satisfaction,
      duration: this.duration,
      elapsedTime: this.getElapsedTime(),
      appliedMasksCount: this.getAppliedMasksCount(),
      completedMasksCount: this.getCompletedMasks().length,
    }
  }

  public static createNewSession(characterId: string): TreatmentSession {
    const sessionId = `treatment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const config: TreatmentConfig = {
      sessionId,
      characterId,
      startTime: Date.now(),
      duration: GAME_CONFIG.DEFAULT_TREATMENT_DURATION,
    }

    return new TreatmentSession(config)
  }

  public static isValidSession(session: TreatmentSession): boolean {
    return (
      session.sessionId.length > 0 &&
      session.characterId.length > 0 &&
      session.duration > 0 &&
      Object.values(SessionStatus).includes(session.status)
    )
  }
}
