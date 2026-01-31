/**
 * Pause/Resume system for game state management
 */

export interface PauseState {
  isPaused: boolean
  pauseTime: number | null
  totalPausedDuration: number
  lastPauseStart: number | null
  realTimeAtPause: number | null
}

export class PauseManager {
  private pauseState: PauseState = {
    isPaused: false,
    pauseTime: null,
    totalPausedDuration: 0,
    lastPauseStart: null,
    realTimeAtPause: null,
  }

  private onPauseCallbacks: Array<() => void> = []
  private onResumeCallbacks: Array<() => void> = []
  private keyboardControlsActive = false

  constructor() {
    this.setupKeyboardControls()
  }

  public setupKeyboardControls(): void {
    if (this.keyboardControlsActive) return

    // Listen for pause key (ESC or P)
    onKeyPress('escape', () => {
      this.togglePause()
    })

    onKeyPress('p', () => {
      this.togglePause()
    })

    this.keyboardControlsActive = true
  }

  private cleanupKeyboardControls(): void {
    // Note: Kaplay.js doesn't provide a direct way to remove specific keyboard listeners
    // We'll use the keyboardControlsActive flag to prevent multiple setups
    this.keyboardControlsActive = false
  }

  public togglePause(): void {
    if (this.pauseState.isPaused) {
      this.resume()
    } else {
      this.pause()
    }
  }

  public pause(): void {
    if (this.pauseState.isPaused) return

    this.pauseState.isPaused = true
    this.pauseState.lastPauseStart = Date.now()
    this.pauseState.realTimeAtPause = Date.now()

    // Pause all game timers and animations
    this.pauseGameSystems()

    // Show pause UI
    this.showPauseUI()

    // Trigger pause callbacks
    this.onPauseCallbacks.forEach((callback) => callback())
  }

  public getAdjustedGameTime(): number {
    // If paused, return the time when pause started
    if (this.pauseState.isPaused && this.pauseState.realTimeAtPause) {
      return (
        this.pauseState.realTimeAtPause - this.pauseState.totalPausedDuration
      )
    }

    // Return current time adjusted for pause duration
    const currentTime = Date.now()
    return currentTime - this.pauseState.totalPausedDuration
  }

  public resume(): void {
    if (!this.pauseState.isPaused) return

    // Calculate paused duration
    if (this.pauseState.lastPauseStart && this.pauseState.realTimeAtPause) {
      const pauseDuration = Date.now() - this.pauseState.lastPauseStart
      this.pauseState.totalPausedDuration += pauseDuration
    }

    this.pauseState.isPaused = false
    this.pauseState.lastPauseStart = null
    this.pauseState.realTimeAtPause = null

    // Resume all game timers and animations
    this.resumeGameSystems()

    // Hide pause UI
    this.hidePauseUI()

    // Trigger resume callbacks
    this.onResumeCallbacks.forEach((callback) => callback())
  }

  private pauseGameSystems(): void {
    // Pause game systems
    // Time is handled through getAdjustedGameTime() method
    // This ensures treatment timers don't progress while paused
  }

  private resumeGameSystems(): void {
    // Resume game systems
    // Time is handled through getAdjustedGameTime() method
    // This ensures treatment timers resume correctly
  }

  private showPauseUI(): void {
    // Create pause overlay
    add([
      rect(width(), height()),
      color(0, 0, 0),
      opacity(0.7),
      z(1000),
      'pause_overlay',
    ])

    // Pause text
    add([
      text('PAUSED', { size: 48 }),
      pos(center().x, center().y - 50),
      anchor('center'),
      color(255, 255, 255),
      z(1001),
      'pause_text',
    ])

    // Instructions
    add([
      text('Press ESC or P to resume', { size: 20 }),
      pos(center().x, center().y + 20),
      anchor('center'),
      color(255, 255, 255),
      z(1001),
      'pause_instructions',
    ])

    // Additional options
    add([
      text('Press R to restart\nPress M for menu', { size: 16 }),
      pos(center().x, center().y + 60),
      anchor('center'),
      color(200, 200, 200),
      z(1001),
      'pause_options',
    ])

    // Add keyboard listeners for pause menu options
    onKeyPress('r', () => {
      if (this.pauseState.isPaused) {
        this.restart()
      }
    })

    onKeyPress('m', () => {
      if (this.pauseState.isPaused) {
        this.goToMenu()
      }
    })
  }

  private hidePauseUI(): void {
    // Remove all pause UI elements
    destroyAll('pause_overlay')
    destroyAll('pause_text')
    destroyAll('pause_instructions')
    destroyAll('pause_options')
  }

  public restart(): void {
    // Resume first to clean up UI
    this.resume()

    // Restart current scene - this would need to be implemented based on scene management
    // For now, we'll just resume
  }

  public goToMenu(): void {
    // Resume first to clean up UI
    this.resume()

    // Go to menu scene - this would need to be implemented based on scene management
    // For now, we'll just resume
  }

  public isPaused(): boolean {
    return this.pauseState.isPaused
  }

  public getPauseState(): PauseState {
    return { ...this.pauseState }
  }

  public getAdjustedTime(originalTime: number): number {
    // Adjust time by subtracting paused duration
    return originalTime - this.pauseState.totalPausedDuration
  }

  public onPause(callback: () => void): void {
    this.onPauseCallbacks.push(callback)
  }

  public onResume(callback: () => void): void {
    this.onResumeCallbacks.push(callback)
  }

  public reset(): void {
    // Clean up pause UI if visible
    if (this.pauseState.isPaused) {
      this.hidePauseUI()
    }

    // Clean up keyboard controls
    this.cleanupKeyboardControls()

    // Reset pause state
    this.pauseState = {
      isPaused: false,
      pauseTime: null,
      totalPausedDuration: 0,
      lastPauseStart: null,
      realTimeAtPause: null,
    }

    // Clear callbacks
    this.onPauseCallbacks = []
    this.onResumeCallbacks = []
  }
}

// Global pause manager instance
let pauseManager: PauseManager | null = null

export function initPauseManager(): PauseManager {
  if (!pauseManager) {
    pauseManager = new PauseManager()
  } else {
    // If already exists, reset it to clean state and re-setup controls
    pauseManager.reset()
    pauseManager.setupKeyboardControls()
  }
  return pauseManager
}

export function getPauseManager(): PauseManager {
  if (!pauseManager) {
    throw new Error('Pause manager not initialized')
  }
  return pauseManager
}

// Helper functions for common pause operations
export function togglePause(): void {
  const manager = getPauseManager()
  manager.togglePause()
}

export function pauseGame(): void {
  const manager = getPauseManager()
  manager.pause()
}

export function resumeGame(): void {
  const manager = getPauseManager()
  manager.resume()
}

export function isGamePaused(): boolean {
  const manager = getPauseManager()
  return manager.isPaused()
}
