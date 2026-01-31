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
  public isFollowingMouse: boolean = false
  public visualElement: unknown = null // Kaplay.js game object
  public targetPosition: { x: number; y: number } | null = null
  public smoothingFactor: number = 0.2 // Smooth following speed
  public allowedBounds: {
    x: number
    y: number
    width: number
    height: number
  } | null = null

  constructor(id: string, initialPosition: { x: number; y: number }) {
    this.id = id
    this.position = { ...initialPosition }
    this.targetPosition = { ...initialPosition }
    this.radius = CLEANING_CONFIG.eraser.defaultRadius
    this.isActive = false
  }

  /**
   * Set allowed boundaries for eraser movement
   */
  setAllowedBounds(bounds: {
    x: number
    y: number
    width: number
    height: number
  }): void {
    this.allowedBounds = { ...bounds }
  }

  /**
   * Check if position is within allowed bounds
   */
  isPositionInBounds(position: { x: number; y: number }): boolean {
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
  constrainToBounds(position: { x: number; y: number }): {
    x: number
    y: number
  } {
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
  updateSmoothMovement(): void {
    if (this.targetPosition && this.isFollowingMouse) {
      // Smooth interpolation towards target position
      const dx = this.targetPosition.x - this.position.x
      const dy = this.targetPosition.y - this.position.y

      this.position.x += dx * this.smoothingFactor
      this.position.y += dy * this.smoothingFactor

      // Update visual element if exists
      if (this.visualElement) {
        // TODO: Update visual position
        // this.visualElement.pos = this.position
      }
    }
  }

  /**
   * Set target position for smooth following
   */
  setTargetPosition(position: { x: number; y: number }): void {
    // Constrain to bounds if set
    const constrainedPosition = this.constrainToBounds(position)
    this.targetPosition = { ...constrainedPosition }
  }

  /**
   * Move the eraser to a new position (immediate)
   */
  moveTo(position: { x: number; y: number }): void {
    // Constrain to bounds if set
    const constrainedPosition = this.constrainToBounds(position)
    this.position = { ...constrainedPosition }
    this.targetPosition = { ...constrainedPosition }

    if (this.isActive) {
      this.emitMoved()
    }
  }

  /**
   * Start smooth following of a position
   */
  startFollowing(position: { x: number; y: number }): void {
    this.isFollowingMouse = true
    this.setTargetPosition(position)
  }

  /**
   * Stop smooth following
   */
  stopFollowing(): void {
    this.isFollowingMouse = false
    this.targetPosition = null
  }

  /**
   * Set smoothing factor for movement
   */
  setSmoothingFactor(factor: number): void {
    this.smoothingFactor = Math.max(0.01, Math.min(1.0, factor))
  }

  /**
   * Setup mouse and touch input handling
   */
  setupInputHandling(): void {
    // Mouse input will be implemented when integrated with scene
    // TODO: Setup onMouseMove, onMouseDown, onMouseUp events
    this.setupMouseInput()
    this.setupTouchInput()
  }

  /**
   * Setup mouse input handlers
   */
  private setupMouseInput(): void {
    // Mouse input will be implemented when integrated with scene
    // TODO:
    // onMouseMove((pos) => {
    //   if (this.isActive) {
    //     this.moveTo(pos)
    //     this.isFollowingMouse = true
    //   }
    // })
    //
    // onMousePress(() => {
    //   this.activate()
    // })
    //
    // onMouseRelease(() => {
    //   this.deactivate()
    //   this.isFollowingMouse = false
    // })
  }

  /**
   * Setup touch input handlers
   */
  private setupTouchInput(): void {
    // Touch input will be implemented when integrated with scene
    // TODO:
    // onTouchMove((pos) => {
    //   if (this.isActive) {
    //     this.moveTo(pos)
    //     this.isFollowingMouse = true
    //   }
    // })
    //
    // onTouchStart(() => {
    //   this.activate()
    // })
    //
    // onTouchEnd(() => {
    //   this.deactivate()
    //   this.isFollowingMouse = false
    // })
  }

  /**
   * Create visual representation of the eraser
   */
  createVisual(): void {
    if (this.visualElement) return

    // Visual creation will be implemented when integrated with scene
    // TODO: Create Kaplay.js visual element for eraser
    // this.visualElement = add([
    //   circle(this.radius),
    //   pos(this.position),
    //   color(255, 255, 255, 0.5), // Semi-transparent white
    //   area({ shape: new Circle(vec2(0), this.radius) }),
    //   'eraser',
    // ])
  }

  /**
   * Update visual feedback based on tool state
   */
  updateVisualFeedback(): void {
    if (!this.visualElement) return

    // Visual updates will be implemented when integrated with scene
    // TODO: Update visual based on state
    if (this.isActive) {
      // Active state - more opaque, different color
      // this.visualElement.color = rgba(255, 255, 255, 0.8)
      // this.visualElement.scale = vec2(1.1) // Slightly larger when active
    } else {
      // Inactive state - less opaque
      // this.visualElement.color = rgba(255, 255, 255, 0.3)
      // this.visualElement.scale = vec2(1.0)
    }

    if (this.isFollowingMouse) {
      // Following state - add glow effect
      // this.visualElement.color = rgba(100, 200, 255, 0.6)
    }
  }

  /**
   * Show activation feedback
   */
  showActivationFeedback(): void {
    // Visual feedback will be implemented when integrated with scene
    // TODO: Show brief animation or effect when activated
    // add([
    //   circle(this.radius * 1.5),
    //   pos(this.position),
    //   color(255, 255, 255),
    //   opacity(0),
    //   'activation_feedback',
    // ])
    //
    // tween(0, 1, 0.2, (val) => {
    //   get('activation_feedback')[0]?.opacity = val
    // }, () => {
    //   tween(1, 0, 0.3, (val) => {
    //     get('activation_feedback')[0]?.opacity = val
    //   }, () => {
    //     destroy(get('activation_feedback')[0])
    //   })
    // })
  }

  /**
   * Activate the eraser tool
   */
  activate(): void {
    if (!this.isActive) {
      this.isActive = true
      this.showActivationFeedback()
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
