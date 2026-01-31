import { Vec2 } from 'kaplay'

export interface TouchInput {
  startPos: Vec2
  currentPos: Vec2
  isDragging: boolean
  dragTarget: string | null
}

export class InputSystem {
  private touchInput: TouchInput = {
    startPos: vec2(0, 0),
    currentPos: vec2(0, 0),
    isDragging: false,
    dragTarget: null,
  }

  constructor() {
    this.setupTouchHandlers()
  }

  private setupTouchHandlers() {
    onTouchStart((pos) => this.handleTouchStart(pos))
    onTouchMove((pos) => this.handleTouchMove(pos))
    onTouchEnd((pos) => this.handleTouchEnd(pos))

    // Mouse support for desktop testing
    onMousePress((btn) => {
      if (btn === 'left') {
        this.handleTouchStart(mousePos())
      }
    })

    onMouseRelease((btn) => {
      if (btn === 'left') {
        this.handleTouchEnd(mousePos())
      }
    })

    onMouseMove(() => {
      if (this.touchInput.isDragging) {
        this.handleTouchMove(mousePos())
      }
    })
  }

  private handleTouchStart(pos: Vec2) {
    this.touchInput.startPos = pos
    this.touchInput.currentPos = pos
    this.touchInput.isDragging = true
    this.touchInput.dragTarget = null
  }

  private handleTouchMove(pos: Vec2) {
    if (!this.touchInput.isDragging) return

    this.touchInput.currentPos = pos
  }

  private handleTouchEnd(pos: Vec2) {
    if (!this.touchInput.isDragging) return

    this.touchInput.currentPos = pos
    this.touchInput.isDragging = false
    this.touchInput.dragTarget = null
  }

  public getTouchInput(): TouchInput {
    return { ...this.touchInput }
  }

  public isTouching(): boolean {
    return this.touchInput.isDragging
  }

  public getTouchDelta(): Vec2 {
    return this.touchInput.currentPos.sub(this.touchInput.startPos)
  }

  public setDragTarget(target: string) {
    this.touchInput.dragTarget = target
  }
}

// Global input system instance
let inputSystem: InputSystem | null = null

export function initInputSystem() {
  if (!inputSystem) {
    inputSystem = new InputSystem()
  }
  return inputSystem
}

export function getInputSystem(): InputSystem {
  if (!inputSystem) {
    throw new Error(
      'Input system not initialized. Call initInputSystem() first.',
    )
  }
  return inputSystem
}
