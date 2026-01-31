/**
 * Game over and restart system
 */

export interface GameOverState {
  isGameOver: boolean
  reason: 'completed' | 'failed' | 'quit' | 'timeout'
  finalScore: number
  satisfactionLevel: number
  treatmentCompleted: boolean
}

export class GameOverManager {
  private gameOverState: GameOverState = {
    isGameOver: false,
    reason: 'completed',
    finalScore: 0,
    satisfactionLevel: 0,
    treatmentCompleted: false,
  }

  private onGameOverCallbacks: Array<(state: GameOverState) => void> = []

  constructor() {}

  public triggerGameOver(
    reason: GameOverState['reason'],
    finalScore: number,
    satisfactionLevel: number,
    treatmentCompleted: boolean,
  ): void {
    if (this.gameOverState.isGameOver) return

    this.gameOverState = {
      isGameOver: true,
      reason,
      finalScore,
      satisfactionLevel,
      treatmentCompleted,
    }

    // Show game over UI
    this.showGameOverUI()

    // Trigger callbacks
    this.onGameOverCallbacks.forEach((callback) => callback(this.gameOverState))
  }

  private showGameOverUI(): void {
    // Create game over overlay
    add([
      rect(width(), height()),
      color(0, 0, 0),
      opacity(0.8),
      z(2000),
      'gameover_overlay',
    ])

    // Game over title
    const titleText = this.getGameOverTitle()
    add([
      text(titleText, { size: 48 }),
      pos(center().x, center().y - 100),
      anchor('center'),
      color(255, 255, 255),
      z(2001),
      'gameover_title',
    ])

    // Final score
    add([
      text(`Final Score: ${this.gameOverState.finalScore}`, { size: 24 }),
      pos(center().x, center().y - 40),
      anchor('center'),
      color(255, 255, 255),
      z(2001),
      'gameover_score',
    ])

    // Satisfaction level
    const satisfactionText = this.getSatisfactionText()
    add([
      text(satisfactionText, { size: 20 }),
      pos(center().x, center().y),
      anchor('center'),
      color(255, 255, 255),
      z(2001),
      'gameover_satisfaction',
    ])

    // Instructions
    add([
      text('Press SPACE to play again\nPress ESC for menu', { size: 16 }),
      pos(center().x, center().y + 50),
      anchor('center'),
      color(200, 200, 200),
      z(2001),
      'gameover_instructions',
    ])

    // Add keyboard listeners
    onKeyPress('space', () => {
      this.restart()
    })

    onKeyPress('escape', () => {
      this.goToMenu()
    })
  }

  private getGameOverTitle(): string {
    switch (this.gameOverState.reason) {
      case 'completed':
        return 'Treatment Complete!'
      case 'failed':
        return 'Treatment Failed'
      case 'quit':
        return 'Treatment Abandoned'
      case 'timeout':
        return "Time's Up!"
      default:
        return 'Game Over'
    }
  }

  private getSatisfactionText(): string {
    const satisfaction = this.gameOverState.satisfactionLevel
    let emoji = '😐'
    let text = 'Neutral'

    if (satisfaction >= 80) {
      emoji = '😊'
      text = 'Very Satisfied'
    } else if (satisfaction >= 60) {
      emoji = '🙂'
      text = 'Satisfied'
    } else if (satisfaction >= 40) {
      emoji = '😐'
      text = 'Neutral'
    } else if (satisfaction >= 20) {
      emoji = '😕'
      text = 'Dissatisfied'
    } else {
      emoji = '😢'
      text = 'Very Dissatisfied'
    }

    return `${emoji} Customer ${text} (${Math.round(satisfaction)}%)`
  }

  public restart(): void {
    // Clean up game over UI
    this.hideGameOverUI()

    // Reset game over state
    this.reset()

    // Restart current scene
    // This would need to be implemented based on scene management
    // For now, we'll just hide the UI
  }

  public goToMenu(): void {
    // Clean up game over UI
    this.hideGameOverUI()

    // Reset game over state
    this.reset()

    // Go to menu scene
    // This would need to be implemented based on scene management
    // For now, we'll just hide the UI
  }

  private hideGameOverUI(): void {
    // Remove all game over UI elements
    destroyAll('gameover_overlay')
    destroyAll('gameover_title')
    destroyAll('gameover_score')
    destroyAll('gameover_satisfaction')
    destroyAll('gameover_instructions')
  }

  public isGameOver(): boolean {
    return this.gameOverState.isGameOver
  }

  public getGameOverState(): GameOverState {
    return { ...this.gameOverState }
  }

  public onGameOver(callback: (state: GameOverState) => void): void {
    this.onGameOverCallbacks.push(callback)
  }

  public reset(): void {
    this.gameOverState = {
      isGameOver: false,
      reason: 'completed',
      finalScore: 0,
      satisfactionLevel: 0,
      treatmentCompleted: false,
    }
  }

  // Convenience methods for specific game over scenarios
  public completeTreatment(score: number, satisfaction: number): void {
    this.triggerGameOver('completed', score, satisfaction, true)
  }

  public failTreatment(score: number, satisfaction: number): void {
    this.triggerGameOver('failed', score, satisfaction, false)
  }

  public quitTreatment(score: number, satisfaction: number): void {
    this.triggerGameOver('quit', score, satisfaction, false)
  }

  public timeoutTreatment(score: number, satisfaction: number): void {
    this.triggerGameOver('timeout', score, satisfaction, false)
  }
}

// Global game over manager instance
let gameOverManager: GameOverManager | null = null

export function initGameOverManager(): GameOverManager {
  if (!gameOverManager) {
    gameOverManager = new GameOverManager()
  }
  return gameOverManager
}

export function getGameOverManager(): GameOverManager {
  if (!gameOverManager) {
    throw new Error('Game over manager not initialized')
  }
  return gameOverManager
}

// Helper functions for common game over operations
export function completeGame(score: number, satisfaction: number): void {
  const manager = getGameOverManager()
  manager.completeTreatment(score, satisfaction)
}

export function failGame(score: number, satisfaction: number): void {
  const manager = getGameOverManager()
  manager.failTreatment(score, satisfaction)
}

export function quitGame(score: number, satisfaction: number): void {
  const manager = getGameOverManager()
  manager.quitTreatment(score, satisfaction)
}

export function timeoutGame(score: number, satisfaction: number): void {
  const manager = getGameOverManager()
  manager.timeoutTreatment(score, satisfaction)
}

export function isGameOver(): boolean {
  const manager = getGameOverManager()
  return manager.isGameOver()
}
