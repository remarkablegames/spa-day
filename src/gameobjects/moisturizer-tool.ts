/**
 * Moisturizer Tool Game Object
 *
 * Interactive tool for applying moisturizer cream to the face.
 * Mirrors the EraserTool pattern with modifications for moisturizer application.
 */

import { MOISTURIZING_CONFIG } from '../constants/moisturizing-config'
import {
  type BoundingBox,
  MoisturizingEventManager,
  type Position,
} from '../events'

export interface MoisturizerToolState {
  id: string
  position: Position
  radius: number
  isActive: boolean
  moisturizerTypeId: string
}

export class MoisturizerTool {
  public readonly id: string
  public position: Position
  public radius: number
  public isActive: boolean
  public isFollowingMouse: boolean = false
  public moisturizerTypeId: string
  public visualElement: unknown = null // Kaplay.js game object
  public targetPosition: Position | null = null
  public smoothingFactor: number
  public allowedBounds: BoundingBox | null = null
  public lastMoveTime: number = 0
  public velocity: number = 0

  private eventManager: MoisturizingEventManager
  private sessionId: string

  constructor(
    id: string,
    initialPosition: Position,
    moisturizerTypeId: string,
    sessionId: string,
  ) {
    this.id = id
    this.position = { ...initialPosition }
    this.targetPosition = { ...initialPosition }
    this.radius = MOISTURIZING_CONFIG.tool.defaultRadius
    this.isActive = false
    this.moisturizerTypeId = moisturizerTypeId
    this.smoothingFactor = MOISTURIZING_CONFIG.tool.smoothingFactor
    this.eventManager = MoisturizingEventManager.getInstance()
    this.sessionId = sessionId
  }

  /**
   * Set allowed boundaries for tool movement
   */
  public setAllowedBounds(bounds: BoundingBox): void {
    this.allowedBounds = { ...bounds }
  }

  /**
   * Check if position is within allowed bounds
   */
  public isPositionInBounds(position: Position): boolean {
    if (!this.allowedBounds) return true

    return (
      position.x >= this.allowedBounds.x &&
      position.x <= this.allowedBounds.x + this.allowedBounds.width &&
      position.y >= this.allowedBounds.y &&
      position.y <= this.allowedBounds.y + this.allowedBounds.height
    )
  }

  /**
   * Constrain position to allowed bounds
   */
  public constrainToBounds(position: Position): Position {
    if (!this.allowedBounds) return position

    return {
      x: Math.max(
        this.allowedBounds.x,
        Math.min(this.allowedBounds.x + this.allowedBounds.width, position.x),
      ),
      y: Math.max(
        this.allowedBounds.y,
        Math.min(this.allowedBounds.y + this.allowedBounds.height, position.y),
      ),
    }
  }

  /**
   * Update smooth movement towards target
   */
  public updateSmoothMovement(): void {
    if (this.targetPosition && this.isFollowingMouse) {
      // Calculate velocity for event emission
      const dx = this.targetPosition.x - this.position.x
      const dy = this.targetPosition.y - this.position.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      this.velocity = distance

      // Smooth interpolation towards target position
      this.position.x += dx * this.smoothingFactor
      this.position.y += dy * this.smoothingFactor

      // Update visual element if exists
      if (this.visualElement) {
        // TODO: Update visual position when integrated with scene
        // this.visualElement.pos = this.position
      }

      // Emit move event if moved significantly
      const currentTime = Date.now()
      if (
        distance > MOISTURIZING_CONFIG.tool.minMovementThreshold &&
        currentTime - this.lastMoveTime >
          MOISTURIZING_CONFIG.performance.batchUpdateInterval
      ) {
        this.emitMoved()
        this.lastMoveTime = currentTime
      }
    }
  }

  /**
   * Set target position for smooth following
   */
  public setTargetPosition(position: Position): void {
    // Constrain to bounds if set
    const constrainedPosition = this.constrainToBounds(position)
    this.targetPosition = { ...constrainedPosition }
  }

  /**
   * Move the tool to a new position (immediate)
   */
  public moveTo(position: Position): void {
    // Constrain to bounds if set
    const constrainedPosition = this.constrainToBounds(position)

    // Calculate velocity
    const dx = constrainedPosition.x - this.position.x
    const dy = constrainedPosition.y - this.position.y
    this.velocity = Math.sqrt(dx * dx + dy * dy)

    this.position = { ...constrainedPosition }
    this.targetPosition = { ...constrainedPosition }

    if (this.isActive) {
      this.emitMoved()
      this.lastMoveTime = Date.now()
    }
  }

  /**
   * Start smooth following of a position
   */
  public startFollowing(position: Position): void {
    this.isFollowingMouse = true
    this.setTargetPosition(position)
  }

  /**
   * Stop smooth following
   */
  public stopFollowing(): void {
    this.isFollowingMouse = false
    this.targetPosition = null
    this.velocity = 0
  }

  /**
   * Set smoothing factor for movement
   */
  public setSmoothingFactor(factor: number): void {
    this.smoothingFactor = Math.max(0.01, Math.min(1.0, factor))
  }

  /**
   * Activate the moisturizer tool
   */
  public activate(): void {
    if (!this.isActive) {
      this.isActive = true
      this.showActivationFeedback()
      this.emitActivated()
    }
  }

  /**
   * Deactivate the moisturizer tool
   */
  public deactivate(): void {
    if (this.isActive) {
      this.isActive = false
      this.stopFollowing()
      this.emitDeactivated()
    }
  }

  /**
   * Set the tool radius
   */
  public setRadius(radius: number): void {
    this.radius = Math.max(
      MOISTURIZING_CONFIG.tool.minRadius,
      Math.min(MOISTURIZING_CONFIG.tool.maxRadius, radius),
    )
  }

  /**
   * Check if a point is within the tool's circular area
   */
  public containsPoint(point: Position): boolean {
    const dx = point.x - this.position.x
    const dy = point.y - this.position.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance <= this.radius
  }

  /**
   * Show activation feedback (placeholder for visual effects)
   */
  private showActivationFeedback(): void {
    // Visual feedback will be implemented when integrated with scene
    // This could include a brief pulse animation or color change
  }

  /**
   * Emit tool activated event
   */
  private emitActivated(): void {
    this.eventManager.emitToolActivated({
      sessionId: this.sessionId,
      toolId: this.id,
      position: { ...this.position },
      timestamp: Date.now(),
    })
  }

  /**
   * Emit tool moved event
   */
  private emitMoved(): void {
    this.eventManager.emitToolMoved({
      sessionId: this.sessionId,
      toolId: this.id,
      position: { ...this.position },
      velocity: this.velocity,
      timestamp: Date.now(),
    })
  }

  /**
   * Emit tool deactivated event
   */
  private emitDeactivated(): void {
    this.eventManager.emitToolDeactivated({
      sessionId: this.sessionId,
      toolId: this.id,
      position: { ...this.position },
      timestamp: Date.now(),
    })
  }
}
