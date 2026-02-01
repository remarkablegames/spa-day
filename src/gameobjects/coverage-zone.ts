/**
 * Coverage Zone Game Object
 *
 * Represents a subdivided area of the face for coverage tracking.
 * Zones track coverage state and provide collision detection with the tool.
 * Includes visual feedback for covered zones.
 */

import type { GameObj, OpacityComp, PosComp, RectComp, ZComp } from 'kaplay'

import { MOISTURIZING_CONFIG } from '../constants/moisturizing-config'
import type { BoundingBox, Position } from '../events/moisturizing-types'

type ZoneVisual = GameObj<PosComp | RectComp | OpacityComp | ZComp>

export class CoverageZone {
  public readonly id: string
  public readonly bounds: BoundingBox
  public isCovered: boolean = false
  public coverageTimestamp: number | null = null
  public overlapCount: number = 0
  public visualElement: ZoneVisual | null = null

  constructor(id: string, bounds: BoundingBox) {
    this.id = id
    this.bounds = bounds
  }

  /**
   * Check if a circular tool overlaps with this rectangular zone
   * Uses circle-rectangle intersection detection
   */
  public overlapsWithTool(toolPosition: Position, toolRadius: number): boolean {
    // Find the closest point on the rectangle to the circle center
    const closestX = Math.max(
      this.bounds.x,
      Math.min(toolPosition.x, this.bounds.x + this.bounds.width),
    )
    const closestY = Math.max(
      this.bounds.y,
      Math.min(toolPosition.y, this.bounds.y + this.bounds.height),
    )

    // Calculate distance from closest point to circle center
    const distanceX = toolPosition.x - closestX
    const distanceY = toolPosition.y - closestY
    const distanceSquared = distanceX * distanceX + distanceY * distanceY

    // If distance is less than radius, there's an overlap
    return distanceSquared < toolRadius * toolRadius
  }

  /**
   * Mark zone as covered (idempotent - prevents double-counting)
   * Returns true if this was a new coverage, false if already covered
   */
  public cover(): boolean {
    if (this.isCovered) {
      this.overlapCount++
      return false // Was already covered
    }

    this.isCovered = true
    this.coverageTimestamp = Date.now()
    this.overlapCount = 1

    // Show visual feedback for newly covered zone
    this.showCoveredVisual()

    return true // New coverage
  }

  /**
   * Reset zone to uncovered state
   */
  public reset(): void {
    this.isCovered = false
    this.coverageTimestamp = null
    this.overlapCount = 0
    this.hideVisual()
  }

  /**
   * Get the center position of the zone
   */
  public getCenter(): Position {
    return {
      x: this.bounds.x + this.bounds.width / 2,
      y: this.bounds.y + this.bounds.height / 2,
    }
  }

  /**
   * Get the area of the zone
   */
  public getArea(): number {
    return this.bounds.width * this.bounds.height
  }

  /**
   * Create a visual representation of this zone
   * Used for debug mode or visual feedback
   */
  public createVisual(
    zoneColor: [number, number, number] = [255, 255, 255],
  ): void {
    if (this.visualElement) return

    const [r, g, b] = zoneColor
    this.visualElement = add([
      rect(this.bounds.width, this.bounds.height),
      pos(this.bounds.x, this.bounds.y),
      color(r, g, b),
      opacity(0),
      z(40), // Below trail but above face
      anchor('topleft'),
    ]) as ZoneVisual
  }

  /**
   * Show visual feedback when zone is covered
   */
  public showCoveredVisual(): void {
    if (!this.visualElement) {
      // Create visual if it doesn't exist
      this.createVisual([220, 240, 255]) // Light blue tint for coverage
    }

    if (this.visualElement) {
      this.visualElement.opacity = MOISTURIZING_CONFIG.visual.coveredZoneOpacity
    }
  }

  /**
   * Hide visual representation
   */
  public hideVisual(): void {
    if (this.visualElement) {
      this.visualElement.opacity = 0
    }
  }

  /**
   * Destroy visual element
   */
  public destroyVisual(): void {
    if (this.visualElement) {
      destroy(this.visualElement)
      this.visualElement = null
    }
  }

  /**
   * Set visual opacity directly
   */
  public setVisualOpacity(opacity: number): void {
    if (this.visualElement) {
      this.visualElement.opacity = opacity
    }
  }
}
