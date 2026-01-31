import { Vec2 } from 'kaplay'

export interface BaseGameObject {
  id: string
  position: Vec2
  isActive: boolean
}

export abstract class GameObject implements BaseGameObject {
  public readonly id: string
  public position: Vec2
  public isActive: boolean

  constructor(id: string, position: Vec2) {
    this.id = id
    this.position = position
    this.isActive = true
  }

  abstract update(): void
  abstract render(): void

  public activate() {
    this.isActive = true
  }

  public deactivate() {
    this.isActive = false
  }

  public setPosition(position: Vec2) {
    this.position = position
  }

  public destroy() {
    this.deactivate()
  }
}

export interface GameEvent {
  type: string
  data?: unknown
}

export class EventEmitter {
  private listeners: Map<string, Array<(data?: unknown) => void>> = new Map()

  public on(event: string, callback: (data?: unknown) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  public off(event: string, callback: (data?: unknown) => void) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  public emit(event: string, data?: unknown) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach((callback) => callback(data))
    }
  }
}

export interface GameState {
  isPaused: boolean
  currentScene: string
  score: number
  level: number
  completions: number
  averageSatisfaction: number
}

export class GameStateManager extends EventEmitter {
  private state: GameState = {
    isPaused: false,
    currentScene: 'preload',
    score: 0,
    level: 1,
    completions: 0,
    averageSatisfaction: 50,
  }

  public getState(): GameState {
    return { ...this.state }
  }

  public setState(updates: Partial<GameState>) {
    const previousState = { ...this.state }
    this.state = { ...this.state, ...updates }

    // Emit state change events
    if (previousState.isPaused !== this.state.isPaused) {
      this.emit('pauseChanged', this.state.isPaused)
    }

    if (previousState.currentScene !== this.state.currentScene) {
      this.emit('sceneChanged', this.state.currentScene)
    }

    if (previousState.score !== this.state.score) {
      this.emit('scoreChanged', this.state.score)
    }

    if (previousState.level !== this.state.level) {
      this.emit('levelChanged', this.state.level)
    }
  }

  public pause() {
    this.setState({ isPaused: true })
  }

  public resume() {
    this.setState({ isPaused: false })
  }

  public isPaused(): boolean {
    return this.state.isPaused
  }

  public addScore(points: number) {
    this.setState({ score: this.state.score + points })
  }

  public setScore(score: number) {
    this.setState({ score })
  }

  public getScore(): number {
    return this.state.score
  }

  public nextLevel() {
    this.setState({ level: this.state.level + 1 })
  }

  public incrementCompletions() {
    this.setState({ completions: this.state.completions + 1 })
  }

  public setCompletions(completions: number) {
    this.setState({ completions })
  }

  public getCompletions(): number {
    return this.state.completions
  }

  public setAverageSatisfaction(satisfaction: number) {
    this.setState({ averageSatisfaction: satisfaction })
  }

  public getAverageSatisfaction(): number {
    return this.state.averageSatisfaction
  }

  public setLevel(level: number) {
    this.setState({ level })
  }

  public getLevel(): number {
    return this.state.level
  }

  public setCurrentScene(scene: string) {
    this.setState({ currentScene: scene })
  }

  public getCurrentScene(): string {
    return this.state.currentScene
  }
}

// Global game state manager instance
let gameStateManager: GameStateManager | null = null

export function initGameStateManager() {
  if (!gameStateManager) {
    gameStateManager = new GameStateManager()
  }
  return gameStateManager
}

export function getGameStateManager(): GameStateManager {
  if (!gameStateManager) {
    throw new Error(
      'Game state manager not initialized. Call initGameStateManager() first.',
    )
  }
  return gameStateManager
}
