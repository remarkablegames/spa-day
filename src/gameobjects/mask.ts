import {
  AnchorComp,
  ColorComp,
  GameObj,
  PosComp,
  TextComp,
  Vec2,
  ZComp,
} from 'kaplay'

import { GAME_CONFIG } from '../constants/game-config'
import { GameObject } from './base'

export interface MaskConfig {
  id: string
  name: string
  type: string
  duration: number
  effectiveness: number
  position: Vec2
  unlockRequirement?: {
    type: string
    value: number
  }
}

type VisualElement = GameObj<ColorComp | PosComp | ZComp>
type LockTextElement = GameObj<PosComp | ZComp | TextComp | AnchorComp>

export class FaceMask extends GameObject {
  public name: string
  public type: string
  public duration: number
  public effectiveness: number
  public unlockRequirement?: {
    type: string
    value: number
  }
  public isUnlocked: boolean
  public isApplied: boolean
  private visualElement: VisualElement | null = null
  private textElement: VisualElement | null = null
  private lockVisual: VisualElement | null = null
  private lockText: LockTextElement | null = null

  constructor(config: MaskConfig) {
    super(config.id, config.position)
    this.name = config.name
    this.type = config.type
    this.duration = config.duration
    this.effectiveness = config.effectiveness
    this.unlockRequirement = config.unlockRequirement
    this.isUnlocked = false
    this.isApplied = false
  }

  public update() {
    if (!this.isActive) return

    // Mask update logic
    if (this.isApplied) {
      // Update treatment progress
    }
  }

  public render(): void {
    // Don't render if mask is applied
    if (this.isApplied) return

    // Create visual elements if they don't exist
    if (!this.visualElement) {
      this.visualElement = add([
        circle(GAME_CONFIG.MASK_SIZE / 2),
        pos(this.position),
        color(GAME_CONFIG.COLORS.MASK_HYDRATING),
        z(50),
      ])

      this.textElement = add([
        text(this.name[0], { size: 32 }),
        pos(this.position),
        anchor('center'),
        color(255, 255, 255),
        z(51),
      ])
    } else {
      // Update position of existing visual elements
      this.visualElement.pos = this.position
      if (this.textElement) {
        this.textElement.pos = this.position
      }
    }

    // Render lock indicator if not unlocked
    if (!this.isUnlocked) {
      if (!this.lockVisual) {
        this.lockVisual = add([
          circle(GAME_CONFIG.MASK_SIZE / 2),
          pos(this.position),
          color(0, 0, 0),
          z(100),
        ])
      }
      if (!this.lockText) {
        this.lockText = add([
          text('🔒', { size: 32 }),
          pos(this.position),
          anchor('center'),
          z(101),
        ])
      }
    } else {
      // Clean up lock visuals if mask is unlocked
      if (this.lockVisual) {
        destroy(this.lockVisual)
        this.lockVisual = null
      }
      if (this.lockText) {
        destroy(this.lockText)
        this.lockText = null
      }
    }
  }

  public unlock(): boolean {
    if (this.isUnlocked) return false

    this.isUnlocked = true
    return true
  }

  public destroy(): void {
    // Clean up all visual elements
    if (this.visualElement) {
      destroy(this.visualElement)
      this.visualElement = null
    }
    if (this.textElement) {
      destroy(this.textElement)
      this.textElement = null
    }
    if (this.lockVisual) {
      destroy(this.lockVisual)
      this.lockVisual = null
    }
    if (this.lockText) {
      destroy(this.lockText)
      this.lockText = null
    }
  }

  public apply(): boolean {
    if (!this.isUnlocked || this.isApplied) return false

    this.isApplied = true
    return true
  }

  public remove(): boolean {
    if (!this.isApplied) return false

    this.isApplied = false
    return true
  }

  public getRemainingTime(): number {
    if (!this.isApplied) return 0
    // Calculate remaining treatment time
    return this.duration
  }

  public getEffectiveness(): number {
    return this.effectiveness
  }

  public isCompatibleWith(): boolean {
    // All masks are compatible with all face areas for now
    // Could be extended to have specific compatibility rules
    return true
  }

  public static createMaskTypes(): FaceMask[] {
    const maskConfigs: MaskConfig[] = [
      {
        id: 'mask_hydrating',
        name: 'Hydrating Mask',
        type: GAME_CONFIG.MASK_TYPES.HYDRATING,
        duration: 30,
        effectiveness: 85,
        position: vec2(0, 0),
        unlockRequirement: {
          type: 'score',
          value: 100,
        },
      },
      {
        id: 'mask_clarifying',
        name: 'Clarifying Mask',
        type: GAME_CONFIG.MASK_TYPES.CLARIFYING,
        duration: 25,
        effectiveness: 90,
        position: vec2(0, 0),
        unlockRequirement: {
          type: 'treatments',
          value: 3,
        },
      },
      {
        id: 'mask_anti_aging',
        name: 'Anti-Aging Mask',
        type: GAME_CONFIG.MASK_TYPES.ANTI_AGING,
        duration: 45,
        effectiveness: 95,
        position: vec2(0, 0),
        unlockRequirement: {
          type: 'score',
          value: 500,
        },
      },
      {
        id: 'mask_soothing',
        name: 'Soothing Mask',
        type: GAME_CONFIG.MASK_TYPES.SOOTHING,
        duration: 20,
        effectiveness: 80,
        position: vec2(0, 0),
        unlockRequirement: {
          type: 'level',
          value: 2,
        },
      },
      {
        id: 'mask_detoxifying',
        name: 'Detoxifying Mask',
        type: GAME_CONFIG.MASK_TYPES.DETOXIFYING,
        duration: 35,
        effectiveness: 88,
        position: vec2(0, 0),
        unlockRequirement: {
          type: 'score',
          value: 1000,
        },
      },
    ]

    return maskConfigs.map((config) => new FaceMask(config))
  }

  public static getUnlockedMasks(allMasks: FaceMask[]): FaceMask[] {
    return allMasks.filter((mask) => mask.isUnlocked)
  }

  public static getLockedMasks(allMasks: FaceMask[]): FaceMask[] {
    return allMasks.filter((mask) => !mask.isUnlocked)
  }

  public static getAppliedMasks(allMasks: FaceMask[]): FaceMask[] {
    return allMasks.filter((mask) => mask.isApplied)
  }

  public static getMaskById(
    allMasks: FaceMask[],
    id: string,
  ): FaceMask | undefined {
    return allMasks.find((mask) => mask.id === id)
  }

  public static getMasksByType(allMasks: FaceMask[], type: string): FaceMask[] {
    return allMasks.filter((mask) => mask.type === type)
  }

  public calculateScore(baseScore: number): number {
    const effectivenessMultiplier = this.effectiveness / 100
    return Math.floor(baseScore * effectivenessMultiplier)
  }

  public getDescription(): string {
    return `${this.name} - ${this.duration}s treatment with ${this.effectiveness}% effectiveness`
  }

  public getUnlockDescription(): string {
    if (!this.unlockRequirement) return 'Available from start'

    switch (this.unlockRequirement.type) {
      case 'score':
        return `Unlock with ${this.unlockRequirement.value} points`
      case 'treatments':
        return `Unlock after ${this.unlockRequirement.value} treatments`
      case 'level':
        return `Unlock at level ${this.unlockRequirement.value}`
      default:
        return 'Unlock requirements unknown'
    }
  }

  public canUnlock(
    playerScore: number,
    completedTreatments: number,
    playerLevel: number,
  ): boolean {
    if (!this.unlockRequirement || this.isUnlocked) return true

    switch (this.unlockRequirement.type) {
      case 'score':
        return playerScore >= this.unlockRequirement.value
      case 'treatments':
        return completedTreatments >= this.unlockRequirement.value
      case 'level':
        return playerLevel >= this.unlockRequirement.value
      default:
        return false
    }
  }
}
