import {
  CircleComp,
  ColorComp,
  GameObj,
  PosComp,
  TextComp,
  Vec2,
  ZComp,
} from 'kaplay'

import { CLEANING_CONFIG } from '../constants/cleaning-config'
import { GAME_CONFIG } from '../constants/game-config'
import { GameObject } from './base'

export interface FaceArea {
  id: string
  position: Vec2
  size: Vec2
  currentMask: string | null
  areaType: string
  isOccupied: boolean
  cleanliness?: number // 0-1, for cleaning mechanic
  maskReady?: boolean // Ready for mask application
}

export interface CharacterConfig {
  id: string
  name: string
  position: Vec2
  satisfactionLevel: number
  preferredMaskTypes: string[]
  personalityTraits?: string[] // Customer personality affects gameplay
}

type VisualElement = GameObj<PosComp | ZComp>
type TextElement = GameObj<ColorComp | PosComp | ZComp | TextComp>
type CircleElement = GameObj<CircleComp | ColorComp | PosComp | ZComp>

interface FaceAreaVisuals {
  circle: CircleElement
  text: TextElement
}

export class Character extends GameObject {
  public name: string
  public satisfactionLevel: number
  public preferredMaskTypes: string[]
  public personalityTraits: string[]
  public faceAreas: FaceArea[]
  private visualElement: VisualElement | null = null
  private faceAreaVisuals: Map<string, FaceAreaVisuals> = new Map()
  private satisfactionIndicator: TextElement | null = null
  private satisfactionEmoji: TextElement | null = null
  private lastSatisfactionLevel: number = -1
  private lastSatisfactionEmoji: string = ''
  private lastUpdateFrame: number = 0
  private updateThrottle: number = 10 // Update satisfaction every 10 frames
  private satisfactionDecayRate: number = 0.98 // Gradual decay factor

  constructor(config: CharacterConfig) {
    super(config.id, config.position)
    this.name = config.name
    this.satisfactionLevel = 0 // Start at 0%, build up with actions
    this.preferredMaskTypes = config.preferredMaskTypes
    this.personalityTraits = config.personalityTraits || []
    this.faceAreas = this.createFaceAreas()
  }

  /**
   * Get satisfaction multiplier based on personality traits
   */
  private getSatisfactionMultiplier(): number {
    let multiplier = 1.0

    // Impatient customers are harder to please
    if (this.personalityTraits.includes('impatient')) {
      multiplier *= 0.8 // 20% less satisfaction gain
    }

    // Patient customers are easier to please
    if (this.personalityTraits.includes('patient')) {
      multiplier *= 1.2 // 20% more satisfaction gain
    }

    // Demanding customers need more work
    if (this.personalityTraits.includes('demanding')) {
      multiplier *= 0.85 // 15% less satisfaction gain
    }

    // Forgiving customers are easier to please
    if (this.personalityTraits.includes('forgiving')) {
      multiplier *= 1.15 // 15% more satisfaction gain
    }

    return multiplier
  }

  /**
   * Get score multiplier based on personality traits
   */
  public getScoreMultiplier(): number {
    let multiplier = 1.0

    // Generous customers give more points
    if (this.personalityTraits.includes('generous')) {
      multiplier *= 1.25 // 25% more score
    }

    // Extremely generous customers give even more
    if (this.personalityTraits.includes('extremely_generous')) {
      multiplier *= 1.5 // 50% more score
    }

    // High value customers give more points
    if (this.personalityTraits.includes('high_value')) {
      multiplier *= 1.3 // 30% more score
    }

    // Critical customers give less points
    if (this.personalityTraits.includes('critical')) {
      multiplier *= 0.9 // 10% less score
    }

    return multiplier
  }

  /**
   * Increase satisfaction when dirt is cleaned
   */
  public addCleaningSatisfaction(areaId: string): void {
    const area = this.faceAreas.find((a) => a.id === areaId)
    if (!area) return

    // Only give satisfaction if area was dirty and is now being cleaned
    if ((area.cleanliness || 0) < 1.0) {
      // Base satisfaction: 10% per cleaned area
      const baseGain = 10
      const multiplier = this.getSatisfactionMultiplier()
      const actualGain = Math.round(baseGain * multiplier)
      this.satisfactionLevel = Math.min(
        100,
        this.satisfactionLevel + actualGain,
      )
    }
  }

  /**
   * Increase satisfaction when mask is applied
   */
  public addMaskSatisfaction(maskId: string): void {
    const multiplier = this.getSatisfactionMultiplier()

    // Check if preferred mask type
    if (this.preferredMaskTypes.includes(maskId)) {
      // Preferred mask: +20% satisfaction (with personality multiplier)
      const baseGain = 20
      const actualGain = Math.round(baseGain * multiplier)
      this.satisfactionLevel = Math.min(
        100,
        this.satisfactionLevel + actualGain,
      )
    } else {
      // Regular mask: +15% satisfaction (with personality multiplier)
      const baseGain = 15
      const actualGain = Math.round(baseGain * multiplier)
      this.satisfactionLevel = Math.min(
        100,
        this.satisfactionLevel + actualGain,
      )
    }
  }

  /**
   * Get feedback text based on action and current state
   */
  public getCleaningFeedback(): string {
    const feedbacks: Record<string, string[]> = {
      patient: ['Thanks for cleaning!', 'Much better!', 'I appreciate it!'],
      impatient: ['Hurry up!', 'Finally!', 'About time!'],
      demanding: ['Is that all?', 'Make sure its thorough!', 'Check again!'],
      forgiving: ['Good job!', 'Thank you!', 'Perfect!'],
      knowledgeable: ['Proper technique!', 'Clean technique!', 'Good work!'],
      expert: ['Precise work!', 'Professional!', 'Excellent!'],
      celebrity: ['Not bad...', 'Acceptable', 'Will do'],
      default: ['Thanks!', 'Clean!', 'Nice!'],
    }

    // Find matching trait feedback
    for (const trait of this.personalityTraits) {
      if (feedbacks[trait]) {
        const options = feedbacks[trait]
        return options[Math.floor(Math.random() * options.length)]
      }
    }

    // Return default
    const defaults = feedbacks.default
    return defaults[Math.floor(Math.random() * defaults.length)]
  }

  /**
   * Get feedback for mask application
   */
  public getMaskFeedback(isPreferred: boolean): string {
    if (isPreferred) {
      const preferredFeedbacks: Record<string, string[]> = {
        patient: [
          'Exactly what I needed!',
          'Perfect choice!',
          'You know your stuff!',
        ],
        demanding: ['Acceptable choice', 'This will do', 'Good selection'],
        knowledgeable: ['Excellent selection!', 'Spot on!', 'Perfect match!'],
        expert: [
          'Precisely what I need!',
          'Impressive choice!',
          'You understand skin!',
        ],
        celebrity: [
          'This better work...',
          'I expect results!',
          'It better be good',
        ],
        default: ['Great choice!', 'Perfect!', 'Exactly!'],
      }

      for (const trait of this.personalityTraits) {
        if (preferredFeedbacks[trait]) {
          const options = preferredFeedbacks[trait]
          return options[Math.floor(Math.random() * options.length)]
        }
      }
      const defaults = preferredFeedbacks.default
      return defaults[Math.floor(Math.random() * defaults.length)]
    } else {
      const regularFeedbacks: Record<string, string[]> = {
        patient: ['This is fine', 'Thank you', 'I trust you'],
        demanding: [
          'Are you sure?',
          'This isnt what I wanted',
          'Why this one?',
        ],
        knowledgeable: [
          'Interesting choice',
          'Different approach',
          'Unconventional',
        ],
        expert: [
          'Questionable choice...',
          'Is this the best option?',
          'Hmm...',
        ],
        celebrity: ['This wont do!', 'Unacceptable!', 'Wrong choice!'],
        default: ['Okay', 'Thanks', 'Alright'],
      }

      for (const trait of this.personalityTraits) {
        if (regularFeedbacks[trait]) {
          const options = regularFeedbacks[trait]
          return options[Math.floor(Math.random() * options.length)]
        }
      }
      const defaults = regularFeedbacks.default
      return defaults[Math.floor(Math.random() * defaults.length)]
    }
  }

  /**
   * Get final treatment feedback based on satisfaction level
   */
  public getFinalFeedback(satisfaction: number): string {
    if (satisfaction >= 80) {
      const highFeedbacks: Record<string, string[]> = {
        patient: [
          'Wonderful experience!',
          'I feel amazing!',
          'Best spa day ever!',
        ],
        demanding: [
          'Exceeded expectations!',
          'Finally, quality service!',
          'Impressive!',
        ],
        expert: ['Professional work!', 'Skilled technique!', 'Outstanding!'],
        celebrity: [
          'I might come back',
          'Rarely impressed, but...',
          'Acceptable service',
        ],
        default: ['Amazing!', 'Wonderful!', 'Perfect!'],
      }

      for (const trait of this.personalityTraits) {
        if (highFeedbacks[trait]) {
          const options = highFeedbacks[trait]
          return options[Math.floor(Math.random() * options.length)]
        }
      }
      const defaults = highFeedbacks.default
      return defaults[Math.floor(Math.random() * defaults.length)]
    } else if (satisfaction >= 60) {
      const midFeedbacks: Record<string, string[]> = {
        patient: ['Good service', 'Thank you', 'Pleasant experience'],
        demanding: ['It was okay', 'Could be better', 'Mediocre'],
        expert: ['Decent work', 'Acceptable', 'Standard service'],
        celebrity: ['Not terrible', 'Passable', 'Fine I guess'],
        default: ['Good', 'Nice', 'Thanks'],
      }

      for (const trait of this.personalityTraits) {
        if (midFeedbacks[trait]) {
          const options = midFeedbacks[trait]
          return options[Math.floor(Math.random() * options.length)]
        }
      }
      const defaults = midFeedbacks.default
      return defaults[Math.floor(Math.random() * defaults.length)]
    } else {
      const lowFeedbacks: Record<string, string[]> = {
        patient: ['Could improve', 'Not what I hoped', 'Disappointing'],
        demanding: ['Unacceptable!', 'Terrible!', 'Never again!'],
        expert: ['Amateur work', 'Poor technique', 'Unprofessional'],
        celebrity: ['Outrageous!', 'Do you know who I am?!', 'Worst ever!'],
        default: ['Not good', 'Poor', 'Bad'],
      }

      for (const trait of this.personalityTraits) {
        if (lowFeedbacks[trait]) {
          const options = lowFeedbacks[trait]
          return options[Math.floor(Math.random() * options.length)]
        }
      }
      const defaults = lowFeedbacks.default
      return defaults[Math.floor(Math.random() * defaults.length)]
    }
  }

  /**
   * Initialize cleaning state for all face areas
   */
  initializeCleaningState(): void {
    this.faceAreas.forEach((area) => {
      area.cleanliness = 0.0 // Start dirty
      area.maskReady = false
    })
  }

  /**
   * Update cleanliness for a specific face area
   */
  updateAreaCleanliness(areaId: string, cleanlinessIncrease: number): void {
    const area = this.faceAreas.find((a) => a.id === areaId)
    if (!area) return

    area.cleanliness = Math.min(
      1.0,
      (area.cleanliness || 0) + cleanlinessIncrease,
    )
    area.maskReady =
      area.cleanliness >= CLEANING_CONFIG.faceRegions.requiredCleanliness

    if (area.maskReady) {
      this.emitRegionCleaned()
    }
  }

  /**
   * Get overall face cleanliness
   */
  getOverallCleanliness(): number {
    if (this.faceAreas.length === 0) return 0
    const totalCleanliness = this.faceAreas.reduce(
      (sum, area) => sum + (area.cleanliness || 0),
      0,
    )
    return totalCleanliness / this.faceAreas.length
  }

  /**
   * Check if face is ready for mask application
   */
  isFaceReadyForMask(): boolean {
    return this.faceAreas.every((area) => area.maskReady === true)
  }

  /**
   * Get face areas that need cleaning
   */
  getDirtyAreas(): FaceArea[] {
    return this.faceAreas.filter(
      (area) =>
        (area.cleanliness || 0) <
        CLEANING_CONFIG.faceRegions.requiredCleanliness,
    )
  }

  /**
   * Check if a position is within any face area
   */
  isPositionInFaceArea(position: Vec2): FaceArea | null {
    const worldPos = this.position
    return (
      this.faceAreas.find((area) => {
        const areaWorldPos = worldPos.add(area.position)
        const halfSize = vec2(area.size.x / 2, area.size.y / 2)
        const areaBounds = {
          left: areaWorldPos.x - halfSize.x,
          right: areaWorldPos.x + halfSize.x,
          top: areaWorldPos.y - halfSize.y,
          bottom: areaWorldPos.y + halfSize.y,
        }

        return (
          position.x >= areaBounds.left &&
          position.x <= areaBounds.right &&
          position.y >= areaBounds.top &&
          position.y <= areaBounds.bottom
        )
      }) || null
    )
  }

  /**
   * Emit region cleaned event
   */
  private emitRegionCleaned(): void {
    // Event emission will be implemented when integrated with scene
    // TODO: Emit event through scene event system
  }

  private createFaceAreas(): FaceArea[] {
    const characterSize = GAME_CONFIG.CHARACTER_SIZE
    const areaSize = 60

    // Define face areas relative to character position
    const areas: FaceArea[] = [
      {
        id: GAME_CONFIG.FACE_AREAS.FOREHEAD,
        position: vec2(0, -characterSize / 2 + areaSize),
        size: vec2(areaSize * 2, areaSize),
        currentMask: null,
        areaType: GAME_CONFIG.FACE_AREAS.FOREHEAD,
        isOccupied: false,
      },
      {
        id: GAME_CONFIG.FACE_AREAS.LEFT_CHEEK,
        position: vec2(-characterSize / 3, 0),
        size: vec2(areaSize, areaSize),
        currentMask: null,
        areaType: GAME_CONFIG.FACE_AREAS.LEFT_CHEEK,
        isOccupied: false,
      },
      {
        id: GAME_CONFIG.FACE_AREAS.RIGHT_CHEEK,
        position: vec2(characterSize / 3, 0),
        size: vec2(areaSize, areaSize),
        currentMask: null,
        areaType: GAME_CONFIG.FACE_AREAS.RIGHT_CHEEK,
        isOccupied: false,
      },
      {
        id: GAME_CONFIG.FACE_AREAS.CHIN,
        position: vec2(0, characterSize / 2 - areaSize),
        size: vec2(areaSize * 1.5, areaSize),
        currentMask: null,
        areaType: GAME_CONFIG.FACE_AREAS.CHIN,
        isOccupied: false,
      },
      {
        id: GAME_CONFIG.FACE_AREAS.NOSE,
        position: vec2(0, 0),
        size: vec2(areaSize * 0.8, areaSize),
        currentMask: null,
        areaType: GAME_CONFIG.FACE_AREAS.NOSE,
        isOccupied: false,
      },
    ]

    return areas
  }

  public update() {
    // Character update logic
    if (!this.isActive) return

    // Throttle satisfaction updates to prevent spazzing
    this.lastUpdateFrame++
    if (this.lastUpdateFrame >= this.updateThrottle) {
      this.updateSatisfaction()
      this.lastUpdateFrame = 0
    }
  }

  public render() {
    if (!this.isActive) return

    // Create visual element if it doesn't exist
    if (!this.visualElement) {
      // Load the character sprite
      loadSprite('character_base', 'sprites/face-eyes-closed.png')

      this.visualElement = add([
        sprite('character_base'),
        pos(this.position),
        anchor('center'),
        z(10),
      ]) as GameObj<PosComp | ZComp>
    } else {
      // Update position of existing visual element
      this.visualElement.pos = this.position
    }

    // Render face areas (for debugging or visual feedback)
    this.renderFaceAreas()
    this.renderSatisfactionFeedback()
  }

  private renderFaceAreas() {
    this.faceAreas.forEach((area) => {
      if (area.isOccupied) {
        // Create visual element if it doesn't exist
        if (!this.faceAreaVisuals.has(area.id)) {
          const maskVisual = add([
            circle(GAME_CONFIG.MASK_SIZE / 2),
            pos(this.position.add(area.position)),
            color(GAME_CONFIG.COLORS.MASK_HYDRATING),
            z(20),
          ])

          const maskText = add([
            text('H', { size: 24 }),
            pos(this.position.add(area.position)),
            anchor('center'),
            color(255, 255, 255),
            z(21),
          ])

          this.faceAreaVisuals.set(area.id, {
            circle: maskVisual,
            text: maskText,
          })
        } else {
          // Update position of existing visual elements
          const visuals = this.faceAreaVisuals.get(area.id)
          if (visuals) {
            visuals.circle.pos = this.position.add(area.position)
            visuals.text.pos = this.position.add(area.position)
          }
        }
      } else {
        // Remove visual elements if area is no longer occupied
        if (this.faceAreaVisuals.has(area.id)) {
          const visuals = this.faceAreaVisuals.get(area.id)
          if (visuals) {
            destroy(visuals.circle)
            destroy(visuals.text)
          }
          this.faceAreaVisuals.delete(area.id)
        }
      }
    })
  }

  public applyMask(faceAreaId: string, maskId: string): boolean {
    const faceArea = this.faceAreas.find((area) => area.id === faceAreaId)
    if (!faceArea || faceArea.isOccupied) {
      return false
    }

    faceArea.currentMask = maskId
    faceArea.isOccupied = true
    return true
  }

  public removeMask(faceAreaId: string): boolean {
    const faceArea = this.faceAreas.find((area) => area.id === faceAreaId)
    if (!faceArea || !faceArea.isOccupied) {
      return false
    }

    faceArea.currentMask = null
    faceArea.isOccupied = false
    return true
  }

  public clearAllMasks(): void {
    this.faceAreas.forEach((area) => {
      area.currentMask = null
      area.isOccupied = false
    })

    // Clean up visual elements
    this.faceAreaVisuals.forEach((visuals) => {
      destroy(visuals.circle)
      destroy(visuals.text)
    })
    this.faceAreaVisuals.clear()
  }

  public setSatisfaction(level: number): void {
    this.satisfactionLevel = Math.max(0, Math.min(100, level))
  }

  public getFaceAreaAtPosition(position: Vec2): FaceArea | null {
    const worldPos = this.position
    return (
      this.faceAreas.find((area) => {
        const areaWorldPos = worldPos.add(area.position)
        const halfSize = vec2(area.size.x / 2, area.size.y / 2)
        const areaBounds = {
          left: areaWorldPos.x - halfSize.x,
          right: areaWorldPos.x + halfSize.x,
          top: areaWorldPos.y - halfSize.y,
          bottom: areaWorldPos.y + halfSize.y,
        }

        return (
          position.x >= areaBounds.left &&
          position.x <= areaBounds.right &&
          position.y >= areaBounds.top &&
          position.y <= areaBounds.bottom
        )
      }) || null
    )
  }

  public getOccupiedAreas(): FaceArea[] {
    return this.faceAreas.filter((area) => area.isOccupied)
  }

  public getAvailableAreas(): FaceArea[] {
    return this.faceAreas.filter((area) => !area.isOccupied)
  }

  public hasAllAreasOccupied(): boolean {
    return this.faceAreas.every((area) => area.isOccupied)
  }

  private updateSatisfaction() {
    // Progressive satisfaction system - no decay
    // Satisfaction only increases through player actions:
    // - Cleaning dirt spots: +10% per area
    // - Applying masks: +15% (regular) or +20% (preferred)
    // This is handled by addCleaningSatisfaction() and addMaskSatisfaction()

    // Just ensure satisfaction stays within bounds
    this.satisfactionLevel = Math.max(0, Math.min(100, this.satisfactionLevel))
  }

  public getSatisfaction(): number {
    return this.satisfactionLevel
  }

  public isHappy(): boolean {
    return this.satisfactionLevel >= 70
  }

  public isNeutral(): boolean {
    return this.satisfactionLevel >= 40 && this.satisfactionLevel < 70
  }

  public isUnhappy(): boolean {
    return this.satisfactionLevel < 40
  }

  private renderSatisfactionFeedback() {
    // Position satisfaction feedback
    const indicatorY = 80 // Position for satisfaction percentage
    const emojiY = indicatorY - 40 // Emoji positioned above the percentage
    const currentEmoji = this.getSatisfactionEmoji()
    const roundedSatisfaction = Math.round(this.satisfactionLevel) // Round to whole number

    // Only update if satisfaction level actually changed
    if (roundedSatisfaction !== this.lastSatisfactionLevel) {
      this.lastSatisfactionLevel = roundedSatisfaction

      // Update or create satisfaction indicator (percentage text)
      if (!this.satisfactionIndicator) {
        this.satisfactionIndicator = add([
          text(`${roundedSatisfaction}%`, { size: 32, font: 'bold' }),
          pos(10, indicatorY),
          anchor('left'),
          color(255, 255, 255),
          z(30),
        ])
      } else {
        this.satisfactionIndicator.text = `${roundedSatisfaction}%`
        this.satisfactionIndicator.pos = vec2(10, indicatorY)
      }

      // Update indicator color based on satisfaction level
      if (roundedSatisfaction >= 80) {
        this.satisfactionIndicator.color = rgb(0, 255, 0) // Green
      } else if (roundedSatisfaction >= 60) {
        this.satisfactionIndicator.color = rgb(255, 255, 0) // Yellow
      } else {
        this.satisfactionIndicator.color = rgb(255, 0, 0) // Red
      }
    }

    // Only update emoji if it actually changed
    if (currentEmoji !== this.lastSatisfactionEmoji) {
      this.lastSatisfactionEmoji = currentEmoji

      if (!this.satisfactionEmoji) {
        this.satisfactionEmoji = add([
          text(currentEmoji, { size: 48 }),
          pos(10, emojiY), // Position above satisfaction percentage
          anchor('left'),
          color(255, 255, 255),
          z(30),
        ])
      } else {
        this.satisfactionEmoji.text = currentEmoji
        this.satisfactionEmoji.pos = vec2(10, emojiY)
      }
    }
  }

  private getSatisfactionEmoji(): string {
    if (this.satisfactionLevel >= 80) return '😊'
    if (this.satisfactionLevel >= 60) return '🙂'
    if (this.satisfactionLevel >= 40) return '😐'
    return '😞'
  }
}
