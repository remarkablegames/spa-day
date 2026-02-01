/**
 * Moisturizer Trail Game Object
 *
 * Visual representation of applied moisturizer cream.
 * Renders smooth cream texture along the drag path using Kaplay components.
 */

import type { GameObj, OpacityComp, PosComp, RectComp } from 'kaplay'

import { MOISTURIZING_CONFIG } from '../constants/moisturizing-config'
import type { Position } from '../events/moisturizing-types'

type TrailSegment = GameObj<PosComp | RectComp | OpacityComp>

export class MoisturizerTrail {
  private segments: TrailSegment[] = []
  private maxSegments: number
  private trailWidth: number
  private minTrailDistance: number
  private trailColor: [number, number, number]
  private lastPosition: Position | null = null

  constructor(color: string = MOISTURIZING_CONFIG.colors.basic) {
    this.maxSegments = MOISTURIZING_CONFIG.visual.maxTrailSegments
    this.trailWidth = MOISTURIZING_CONFIG.visual.trailWidth
    this.minTrailDistance = MOISTURIZING_CONFIG.visual.minTrailDistance
    this.trailColor = this.hexToRgbTuple(color)
  }

  /**
   * Add a segment to the trail at the given position
   * Returns true if segment was added, false if skipped (too close to last)
   */
  public addSegment(position: Position): boolean {
    // Check minimum distance from last position to prevent dot spam
    if (this.lastPosition) {
      const dx = position.x - this.lastPosition.x
      const dy = position.y - this.lastPosition.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < this.minTrailDistance) {
        return false // Skip this position, too close to last
      }
    }

    // Create trail segment using Kaplay components
    // Note: Using Kaplay's color() with RGB tuple
    const [r, g, b] = this.trailColor
    const segment = add([
      rect(this.trailWidth, this.trailWidth),
      pos(position.x, position.y),
      color(r, g, b),
      opacity(MOISTURIZING_CONFIG.visual.trailOpacity),
      anchor('center'),
    ]) as TrailSegment

    this.segments.push(segment)
    this.lastPosition = { ...position }

    // Remove oldest segment if at max capacity (performance optimization)
    if (this.segments.length > this.maxSegments) {
      const oldestSegment = this.segments.shift()
      if (oldestSegment) {
        destroy(oldestSegment)
      }
    }

    return true
  }

  /**
   * Clear all trail segments
   */
  public clear(): void {
    this.segments.forEach((segment) => {
      destroy(segment)
    })
    this.segments = []
    this.lastPosition = null
  }

  /**
   * Update trail color for future segments
   * Note: Existing segments keep their original color
   */
  public setColor(color: string): void {
    this.trailColor = this.hexToRgbTuple(color)
  }

  /**
   * Get current segment count
   */
  public getSegmentCount(): number {
    return this.segments.length
  }

  /**
   * Check if trail has any segments
   */
  public hasSegments(): boolean {
    return this.segments.length > 0
  }

  /**
   * Get the last position where a segment was added
   */
  public getLastPosition(): Position | null {
    return this.lastPosition ? { ...this.lastPosition } : null
  }

  /**
   * Convert hex color to RGB tuple for Kaplay
   */
  private hexToRgbTuple(hex: string): [number, number, number] {
    const cleanHex = hex.replace('#', '')
    const bigint = parseInt(cleanHex, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return [r, g, b]
  }
}
