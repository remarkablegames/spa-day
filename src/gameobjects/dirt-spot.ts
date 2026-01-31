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

  constructor(id: string, position: { x: number; y: number }, points?: number) {
    this.id = id
    this.position = { ...position }
    this.points = points ?? CLEANING_CONFIG.dirtSpots.minPoints
    this.isCleaned = false
    this.size = CLEANING_CONFIG.dirtSpots.size
  }

  /**
   * Clean the dirt spot
   */
  clean(): void {
    if (!this.isCleaned) {
      this.isCleaned = true
      this.emitCleaned()
    }
  }

  /**
   * Remove the dirt spot (after cleaning animation)
   */
  remove(): void {
    // Removal logic will be implemented when integrated with scene
    // TODO: Remove from scene/game objects
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
