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
  intensity: number // 0-1, based on eraser speed/pressure
}

export class CleaningStateManager {
  private state: CleaningState
  private dirtSpots: Map<string, DirtSpot> = new Map()
  private eraser: EraserTool | null = null
  private lastEraserPosition: { x: number; y: number } | null = null
  private eraserSpeed: number = 0

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

    // Calculate eraser speed for intensity
    this.calculateEraserSpeed()

    const results: CollisionResult[] = []
    const spots = Array.from(this.dirtSpots.values())

    for (const spot of spots) {
      if (spot.isCleaned) continue

      if (spot.overlapsWithCircle(this.eraser.position, this.eraser.radius)) {
        const wasCleaned = !spot.isCleaned
        const intensity = this.calculateCleaningIntensity()

        spot.clean()

        if (wasCleaned) {
          // Apply intensity-based scoring
          const points = Math.floor(spot.points * (0.5 + intensity * 0.5)) // 0.5x to 1x points based on intensity
          this.state.cleanedSpots++
          this.state.score += points
          results.push({ spot, wasCleaned, intensity })
        }
      }
    }

    // Update animations for all spots
    this.updateSpotAnimations()

    if (results.length > 0) {
      this.emitProgress()
      this.checkCompletion()
    }

    return results
  }

  /**
   * Calculate eraser speed based on position change
   */
  private calculateEraserSpeed(): void {
    if (!this.eraser) return

    if (this.lastEraserPosition) {
      const dx = this.eraser.position.x - this.lastEraserPosition.x
      const dy = this.eraser.position.y - this.lastEraserPosition.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Simple speed calculation (pixels per frame)
      this.eraserSpeed = distance
    }

    this.lastEraserPosition = { ...this.eraser.position }
  }

  /**
   * Calculate cleaning intensity based on eraser speed and other factors
   */
  private calculateCleaningIntensity(): number {
    // Base intensity from speed (0.3 to 1.0)
    const intensity = Math.min(1.0, 0.3 + this.eraserSpeed * 0.02)

    // Bonus intensity for continuous cleaning (staying in same area)
    // This could be enhanced with time-based factors

    return Math.max(0.1, Math.min(1.0, intensity))
  }

  /**
   * Update spot animations
   */
  private updateSpotAnimations(): void {
    const deltaTime = 1 / 60 // Assuming 60 FPS
    const spots = Array.from(this.dirtSpots.values())
    for (const spot of spots) {
      spot.updateAnimation(deltaTime)
    }
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
   * Validate face cleanliness for mask application
   */
  validateFaceCleanliness(): {
    isValid: boolean
    cleanliness: number
    requiredCleanliness: number
    message: string
  } {
    const cleanliness = this.getProgress()
    const requiredCleanliness = 0.8 // 80% required for mask application

    return {
      isValid: cleanliness >= requiredCleanliness,
      cleanliness,
      requiredCleanliness,
      message:
        cleanliness >= requiredCleanliness
          ? 'Face is ready for mask application!'
          : `Face needs more cleaning. Current: ${Math.round(cleanliness * 100)}%, Required: ${Math.round(requiredCleanliness * 100)}%`,
    }
  }

  /**
   * Check if specific cleanliness threshold is met
   */
  isCleanlinessMet(threshold: number = 0.8): boolean {
    return this.getProgress() >= threshold
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
