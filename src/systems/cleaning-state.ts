/**
 * Cleaning State Management System
 *
 * Manages the global cleaning state including dirt spots,
 * scoring, progress tracking, and collision detection.
 */

import { DirtSpot } from '../gameobjects/dirt-spot'
import { EraserTool } from '../gameobjects/eraser'

export interface CleaningState {
  totalSpots: number
  cleanedSpots: number
  score: number
  isComplete: boolean
  startTime: number
  completionTime?: number
}

export interface CollisionResult {
  spot: DirtSpot
  wasCleaned: boolean
}

export class CleaningStateManager {
  private state: CleaningState
  private dirtSpots: Map<string, DirtSpot> = new Map()
  private eraser: EraserTool | null = null

  constructor() {
    this.state = {
      totalSpots: 0,
      cleanedSpots: 0,
      score: 0,
      isComplete: false,
      startTime: Date.now(),
    }
  }

  /**
   * Initialize the cleaning system
   */
  initialize(): void {
    this.reset()
  }

  /**
   * Reset the cleaning state
   */
  reset(): void {
    this.state = {
      totalSpots: 0,
      cleanedSpots: 0,
      score: 0,
      isComplete: false,
      startTime: Date.now(),
    }
    this.dirtSpots.clear()
  }

  /**
   * Set the eraser tool
   */
  setEraser(eraser: EraserTool): void {
    this.eraser = eraser
  }

  /**
   * Add a dirt spot to the system
   */
  addDirtSpot(spot: DirtSpot): void {
    this.dirtSpots.set(spot.id, spot)
    this.state.totalSpots = this.dirtSpots.size
  }

  /**
   * Remove a dirt spot from the system
   */
  removeDirtSpot(spotId: string): void {
    this.dirtSpots.delete(spotId)
    this.state.totalSpots = this.dirtSpots.size
  }

  /**
   * Check for collisions between eraser and dirt spots
   */
  checkCollisions(): CollisionResult[] {
    if (!this.eraser || !this.eraser.isActive) {
      return []
    }

    const results: CollisionResult[] = []
    const spots = Array.from(this.dirtSpots.values())

    for (const spot of spots) {
      if (spot.isCleaned) continue

      if (spot.overlapsWithCircle(this.eraser.position, this.eraser.radius)) {
        const wasCleaned = !spot.isCleaned
        spot.clean()

        if (wasCleaned) {
          this.state.cleanedSpots++
          this.state.score += spot.points
          results.push({ spot, wasCleaned })
        }
      }
    }

    if (results.length > 0) {
      this.emitProgress()
      this.checkCompletion()
    }

    return results
  }

  /**
   * Get current cleaning progress
   */
  getProgress(): number {
    if (this.state.totalSpots === 0) return 0
    return this.state.cleanedSpots / this.state.totalSpots
  }

  /**
   * Check if cleaning is complete
   */
  isComplete(): boolean {
    return this.state.isComplete
  }

  /**
   * Get current score
   */
  getScore(): number {
    return this.state.score
  }

  /**
   * Get total number of spots
   */
  getTotalSpots(): number {
    return this.state.totalSpots
  }

  /**
   * Get number of cleaned spots
   */
  getCleanedSpots(): number {
    return this.state.cleanedSpots
  }

  /**
   * Get all dirt spots
   */
  getDirtSpots(): DirtSpot[] {
    return Array.from(this.dirtSpots.values())
  }

  /**
   * Get uncleaned dirt spots
   */
  getUncleanedSpots(): DirtSpot[] {
    return Array.from(this.dirtSpots.values()).filter((spot) => !spot.isCleaned)
  }

  /**
   * Check if cleaning is complete and emit completion event
   */
  private checkCompletion(): void {
    if (
      this.state.cleanedSpots >= this.state.totalSpots &&
      !this.state.isComplete
    ) {
      this.state.isComplete = true
      this.state.completionTime = Date.now() - this.state.startTime
      this.emitCompleted()
    }
  }

  /**
   * Emit progress event
   */
  private emitProgress(): void {
    // Event emission will be implemented when integrated with scene
    // TODO: Emit event through scene event system
  }

  /**
   * Emit completion event
   */
  private emitCompleted(): void {
    // Event emission will be implemented when integrated with scene
    // TODO: Emit event through scene event system
  }
}
