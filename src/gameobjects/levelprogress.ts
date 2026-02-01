import type { GameObj } from 'kaplay'

import { GAME_CONFIG } from '../constants/game-config'
import { Scene } from '../constants/scene'
import { getLevelManager, levelManager } from '../systems/levelmanager'
import type { Level } from '../types/level'

/**
 * Level Progress UI Component
 * User Story 1: Progressive Difficulty Levels
 * Displays level information and progress during gameplay
 */

interface LevelProgressUI {
  container: GameObj | null
  levelText: GameObj | null
  progressBar: GameObj | null
  currencyText: GameObj | null
  timerText: GameObj | null
}

const uiState: LevelProgressUI = {
  container: null,
  levelText: null,
  progressBar: null,
  currencyText: null,
  timerText: null,
}

/**
 * Create the level progress UI
 */
export function createLevelProgressUI(): void {
  const levelManager = getLevelManager()
  const currentLevel = levelManager.getCurrentLevel()
  const progress = levelManager.getLevelProgress()

  // Container for all level UI elements
  uiState.container = add([pos(width() - 200, 10), z(100)])

  // Level number display
  uiState.levelText = add([
    text(`Level ${currentLevel.number}: ${currentLevel.name}`, { size: 18 }),
    pos(width() - 190, 15),
    color(GAME_CONFIG.COLORS.UI_TEXT),
    z(101),
  ])

  // Currency display (coins)
  uiState.currencyText = add([
    text(`Coins: ${progress.totalCurrency}`, { size: 16 }),
    pos(width() - 190, 40),
    color(255, 215, 0), // Gold color
    z(101),
  ])

  // Level unlock progress bar background
  add([
    rect(180, 10),
    pos(width() - 195, 65),
    color(Color.fromHex('#333333')),
    z(100),
  ])

  // Progress bar fill
  const unlockedCount = progress.unlockedLevels.length
  const maxLevels = 5 // MAX_LEVELS
  const progressPercent = unlockedCount / maxLevels

  uiState.progressBar = add([
    rect(180 * progressPercent, 10),
    pos(width() - 195, 65),
    color(Color.fromHex(GAME_CONFIG.COLORS.UI_ACCENT)),
    z(101),
  ])

  // Progress text
  add([
    text(`${unlockedCount}/${maxLevels} unlocked`, { size: 12 }),
    pos(width() - 100, 80),
    anchor('center'),
    color(GAME_CONFIG.COLORS.UI_TEXT),
    z(101),
  ])

  // Listen for currency updates
  levelManager.on('level-completed', () => {
    updateCurrencyDisplay()
  })
}

/**
 * Update the currency display
 */
export function updateCurrencyDisplay(): void {
  const levelManager = getLevelManager()
  const progress = levelManager.getLevelProgress()

  if (uiState.currencyText) {
    uiState.currencyText.text = `Coins: ${progress.totalCurrency}`
  }
}

/**
 * Show level completion UI
 */
export function showLevelCompleteUI(
  score: number,
  satisfaction: number,
  currencyEarned: number,
  nextLevelUnlocked: boolean,
): void {
  // Semi-transparent overlay
  add([
    rect(width(), height()),
    pos(0, 0),
    color(0, 0, 0),
    opacity(0.7),
    z(200),
  ])

  // Success panel
  add([
    rect(400, 300),
    pos(center().x, center().y),
    anchor('center'),
    color(Color.fromHex(GAME_CONFIG.COLORS.UI_PANEL)),
    z(201),
  ])

  // Success title
  add([
    text('Level Complete!', { size: 32, font: 'bold' }),
    pos(center().x, center().y - 100),
    anchor('center'),
    color(Color.fromHex(GAME_CONFIG.COLORS.SATISFACTION_HIGH)),
    z(202),
  ])

  // Score display
  add([
    text(`Score: ${score}`, { size: 24 }),
    pos(center().x, center().y - 40),
    anchor('center'),
    color(GAME_CONFIG.COLORS.UI_TEXT),
    z(202),
  ])

  // Satisfaction display
  const satisfactionColor =
    satisfaction >= 80
      ? Color.fromHex(GAME_CONFIG.COLORS.SATISFACTION_HIGH)
      : satisfaction >= 60
        ? Color.fromHex(GAME_CONFIG.COLORS.UI_ACCENT)
        : Color.fromHex(GAME_CONFIG.COLORS.SATISFACTION_LOW)

  add([
    text(`Satisfaction: ${satisfaction}%`, { size: 24 }),
    pos(center().x, center().y),
    anchor('center'),
    color(satisfactionColor),
    z(202),
  ])

  // Currency earned
  add([
    text(`+${currencyEarned} Coins`, { size: 24 }),
    pos(center().x, center().y + 40),
    anchor('center'),
    color(255, 215, 0), // Gold
    z(202),
  ])

  // Next level unlock notification
  if (nextLevelUnlocked) {
    add([
      text('New Level Unlocked!', { size: 20, font: 'bold' }),
      pos(center().x, center().y + 80),
      anchor('center'),
      color(Color.fromHex(GAME_CONFIG.COLORS.UI_ACCENT)),
      z(202),
    ])
  }

  // Continue button
  const continueButton = add([
    rect(150, 40),
    pos(center().x, center().y + 120),
    anchor('center'),
    color(Color.fromHex(GAME_CONFIG.COLORS.UI_BUTTON)),
    area(),
    z(202),
  ])

  add([
    text('Continue', { size: 20 }),
    pos(center().x, center().y + 120),
    anchor('center'),
    color(Color.WHITE),
    z(203),
  ])

  continueButton.onClick(async () => {
    // Go to level select or shop
    if (nextLevelUnlocked) {
      go(Scene.LevelSelect)
    } else {
      go(Scene.Shop)
    }
  })
}

/**
 * Show level failed UI
 */
export function showLevelFailedUI(): void {
  // Semi-transparent overlay
  add([
    rect(width(), height()),
    pos(0, 0),
    color(0, 0, 0),
    opacity(0.7),
    z(200),
  ])

  // Failure panel
  add([
    rect(400, 250),
    pos(center().x, center().y),
    anchor('center'),
    color(Color.fromHex(GAME_CONFIG.COLORS.UI_PANEL)),
    z(201),
  ])

  // Failure title
  add([
    text('Level Failed', { size: 32, font: 'bold' }),
    pos(center().x, center().y - 70),
    anchor('center'),
    color(Color.fromHex(GAME_CONFIG.COLORS.SATISFACTION_LOW)),
    z(202),
  ])

  // Failure message
  add([
    text('Try again to meet the requirements!', { size: 18 }),
    pos(center().x, center().y - 20),
    anchor('center'),
    color(GAME_CONFIG.COLORS.UI_TEXT),
    z(202),
  ])

  // Retry button
  const retryButton = add([
    rect(120, 40),
    pos(center().x - 70, center().y + 40),
    anchor('center'),
    color(Color.fromHex(GAME_CONFIG.COLORS.UI_BUTTON)),
    area(),
    z(202),
  ])

  add([
    text('Retry', { size: 20 }),
    pos(center().x - 70, center().y + 40),
    anchor('center'),
    color(Color.WHITE),
    z(203),
  ])

  retryButton.onClick(() => {
    levelManager.retryLevel()
    // Restart current scene
    const currentLevel = levelManager.getCurrentLevel()
    go(Scene.Game, { levelId: currentLevel.id })
  })

  // Level select button
  const levelSelectButton = add([
    rect(120, 40),
    pos(center().x + 70, center().y + 40),
    anchor('center'),
    color(Color.fromHex(GAME_CONFIG.COLORS.UI_BUTTON)),
    area(),
    z(202),
  ])

  add([
    text('Levels', { size: 20 }),
    pos(center().x + 70, center().y + 40),
    anchor('center'),
    color(Color.WHITE),
    z(203),
  ])

  levelSelectButton.onClick(() => {
    go(Scene.LevelSelect)
  })
}

/**
 * Destroy level progress UI
 */
export function destroyLevelProgressUI(): void {
  if (uiState.container) {
    destroy(uiState.container)
    uiState.container = null
  }
  uiState.levelText = null
  uiState.progressBar = null
  uiState.currencyText = null
  uiState.timerText = null
}

/**
 * Get current level info for display
 */
export function getCurrentLevelDisplayInfo(): {
  level: Level
  bestScore: number
  isUnlocked: boolean
} {
  const levelManager = getLevelManager()
  const level = levelManager.getCurrentLevel()
  const bestScore = levelManager.getBestScore(level.id)
  const isUnlocked = levelManager.isLevelUnlocked(level.id)

  return {
    level,
    bestScore,
    isUnlocked,
  }
}
