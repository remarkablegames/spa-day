/**
 * Eraser Tool Game Object
 *
 * Interactive tool for cleaning dirt spots from the character's face.
 * Follows mouse/touch input and provides round collision detection.
 */

import { CLEANING_CONFIG } from '../constants/cleaning-config'

export interface EraserToolState {
  id: string
  position: { x: number; y: number }
  radius: number
  isActive: boolean
}

export class EraserTool {
  public readonly id: string
  public position: { x: number; y: number }
  public radius: number
  public isActive: boolean

  constructor(id: string, initialPosition: { x: number; y: number }) {
    this.id = id
    this.position = { ...initialPosition }
    this.radius = CLEANING_CONFIG.eraser.defaultRadius
    this.isActive = false
  }

  /**
   * Activate the eraser tool
   */
  activate(): void {
    if (!this.isActive) {
      this.isActive = true
      this.emitActivated()
    }
  }

  /**
   * Deactivate the eraser tool
   */
  deactivate(): void {
    if (this.isActive) {
      this.isActive = false
      this.emitDeactivated()
    }
  }

  /**
   * Move the eraser to a new position
   */
  moveTo(position: { x: number; y: number }): void {
    this.position = { ...position }

    if (this.isActive) {
      this.emitMoved()
    }
  }

  /**
   * Set the eraser radius
   */
  setRadius(radius: number): void {
    const clampedRadius = Math.max(
      CLEANING_CONFIG.eraser.minRadius,
      Math.min(CLEANING_CONFIG.eraser.maxRadius, radius),
    )
    this.radius = clampedRadius
  }

  /**
   * Check if a point is within the eraser's circular area
   */
  containsPoint(point: { x: number; y: number }): boolean {
    const dx = point.x - this.position.x
    const dy = point.y - this.position.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance <= this.radius
  }

  /**
   * Emit eraser activated event
   */
  private emitActivated(): void {
    // Event emission will be implemented when integrated with scene
    // TODO: Emit event through scene event system
  }

  /**
   * Emit eraser moved event
   */
  private emitMoved(): void {
    // Event emission will be implemented when integrated with scene
    // TODO: Emit event through scene event system
  }

  /**
   * Emit eraser deactivated event
   */
  private emitDeactivated(): void {
    // Event emission will be implemented when integrated with scene
    // TODO: Emit event through scene event system
  }
}
