/**
 * Dirt Spot Game Object
 *
 * Individual dirt spots that can be cleaned from the character's face.
 * Each spot has position, points value, and cleaning state.
 */

import { CLEANING_CONFIG } from '../constants/cleaning-config'

export interface DirtSpotState {
  id: string
  position: { x: number; y: number }
  points: number
  isCleaned: boolean
  size: number
}

export class DirtSpot {
  public readonly id: string
  public position: { x: number; y: number }
  public readonly points: number
  public isCleaned: boolean
  public readonly size: number
  public visualElement: unknown = null // Kaplay.js game object
  public cleaningAnimation: number = 0 // Animation progress

  constructor(id: string, position: { x: number; y: number }, points?: number) {
    this.id = id
    this.position = { ...position }
    this.points = points ?? CLEANING_CONFIG.dirtSpots.minPoints
    this.isCleaned = false
    this.size = CLEANING_CONFIG.dirtSpots.size
  }

  /**
   * Create visual representation
   */
  createVisual(): void {
    if (this.visualElement) return

    // Visual creation will be implemented when integrated with scene
    // TODO: Create Kaplay.js visual element for dirt spot
  }

  /**
   * Clean the dirt spot
   */
  clean(): void {
    if (!this.isCleaned) {
      this.isCleaned = true
      this.startCleaningAnimation()
      this.emitCleaned()
    }
  }

  /**
   * Start cleaning animation
   */
  private startCleaningAnimation(): void {
    this.cleaningAnimation = 0

    // Animation will be implemented when integrated with scene
    // TODO: Start fade out or scale down animation
  }

  /**
   * Update cleaning animation
   */
  updateAnimation(deltaTime: number): void {
    if (this.cleaningAnimation < 1) {
      this.cleaningAnimation = Math.min(
        1,
        this.cleaningAnimation + deltaTime * 2,
      )

      // Update visual based on animation progress
      if (this.visualElement) {
        // TODO: Update visual properties (opacity, scale, etc.)
        // this.visualElement.opacity = 1 - this.cleaningAnimation
        // this.visualElement.scale = vec2(1 + this.cleaningAnimation * 0.5)
      }

      // Remove spot when animation completes
      if (this.cleaningAnimation >= 1) {
        this.remove()
      }
    }
  }

  /**
   * Remove the dirt spot (after cleaning animation)
   */
  remove(): void {
    if (this.visualElement) {
      // Removal will be implemented when integrated with scene
      // TODO: Destroy Kaplay.js visual element
      // destroy(this.visualElement)
      this.visualElement = null
    }
  }

  /**
   * Check if this spot overlaps with a circular area
   */
  overlapsWithCircle(
    center: { x: number; y: number },
    radius: number,
  ): boolean {
    const dx = this.position.x - center.x
    const dy = this.position.y - center.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance <= radius + this.size
  }

  /**
   * Emit dirt spot cleaned event
   */
  private emitCleaned(): void {
    // Event emission will be implemented when integrated with scene
    // TODO: Emit event through scene event system
  }
}
