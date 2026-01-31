import {
  CircleComp,
  ColorComp,
  GameObj,
  PosComp,
  TextComp,
  Vec2,
  ZComp,
} from 'kaplay'

import { GAME_CONFIG } from '../constants/game-config'
import { GameObject } from './base'

export interface FaceArea {
  id: string
  position: Vec2
  size: Vec2
  currentMask: string | null
  areaType: string
  isOccupied: boolean
}

export interface CharacterConfig {
  id: string
  name: string
  position: Vec2
  satisfactionLevel: number
  preferredMaskTypes: string[]
}

type VisualElement = GameObj<ColorComp | PosComp | ZComp>
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
    this.satisfactionLevel = config.satisfactionLevel
    this.preferredMaskTypes = config.preferredMaskTypes
    this.faceAreas = this.createFaceAreas()
  }

  private createFaceAreas(): FaceArea[] {
    const characterSize = GAME_CONFIG.CHARACTER_SIZE
    const areaSize = 30

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
      this.visualElement = add([
        circle(GAME_CONFIG.CHARACTER_SIZE / 2),
        pos(this.position),
        color(255, 200, 150), // Skin color
        z(10),
      ])
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
            text('H', { size: 12 }),
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
    const occupiedAreas = this.getOccupiedAreas()

    if (occupiedAreas.length === 0) {
      // Gradual decay instead of immediate drop to 0
      const newSatisfaction = Math.max(
        0,
        this.satisfactionLevel * this.satisfactionDecayRate,
      )
      if (newSatisfaction !== this.satisfactionLevel) {
        this.satisfactionLevel = newSatisfaction
      }
      return
    }

    let satisfactionScore = 0
    occupiedAreas.forEach((area) => {
      if (
        area.currentMask &&
        this.preferredMaskTypes.includes(area.currentMask)
      ) {
        satisfactionScore += 20 // Bonus for preferred masks
      } else {
        satisfactionScore += 10 // Base score for any mask
      }
    })

    // Normalize to 0-100 range
    const maxPossibleScore = this.faceAreas.length * 20
    const calculatedSatisfaction = Math.min(
      100,
      (satisfactionScore / maxPossibleScore) * 100,
    )

    // Blend calculated satisfaction with current level for smoother transitions
    const blendFactor = 0.3 // How quickly to adapt to new satisfaction
    const newSatisfactionLevel =
      this.satisfactionLevel * (1 - blendFactor) +
      calculatedSatisfaction * blendFactor

    // Only update if satisfaction actually changed significantly
    if (Math.abs(newSatisfactionLevel - this.satisfactionLevel) > 0.5) {
      this.satisfactionLevel = newSatisfactionLevel
    }
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
    const indicatorY = this.position.y - GAME_CONFIG.CHARACTER_SIZE / 2 - 30
    const currentEmoji = this.getSatisfactionEmoji()
    const roundedSatisfaction = Math.round(this.satisfactionLevel) // Round to whole number

    // Only update if satisfaction level actually changed
    if (roundedSatisfaction !== this.lastSatisfactionLevel) {
      this.lastSatisfactionLevel = roundedSatisfaction

      // Update or create satisfaction indicator
      if (!this.satisfactionIndicator) {
        this.satisfactionIndicator = add([
          text(`${roundedSatisfaction}%`, { size: 16, font: 'bold' }),
          pos(this.position.x, indicatorY),
          anchor('center'),
          color(255, 255, 255),
          z(30),
        ])
      } else {
        this.satisfactionIndicator.text = `${roundedSatisfaction}%`
        this.satisfactionIndicator.pos = vec2(this.position.x, indicatorY)
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
      const emojiY = indicatorY - 25

      if (!this.satisfactionEmoji) {
        this.satisfactionEmoji = add([
          text(currentEmoji, { size: 24 }),
          pos(this.position.x, emojiY),
          anchor('center'),
          color(255, 255, 255),
          z(30),
        ])
      } else {
        this.satisfactionEmoji.text = currentEmoji
        this.satisfactionEmoji.pos = vec2(this.position.x, emojiY)
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
