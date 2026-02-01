import { GAME_CONFIG } from '../constants/game-config'
import { getAllLevels, MAX_LEVELS } from '../constants/level-config'
import { Scene } from '../constants/scene'
import { getLevelManager, levelManager } from '../systems/levelmanager'
import type { Level } from '../types/level'

/**
 * Level Selection Scene
 * User Story 1: Progressive Difficulty Levels
 * Allows players to select and navigate between unlocked levels
 */
export function createLevelSelectScene() {
  scene(Scene.LevelSelect, () => {
    // Ensure level manager is initialized
    if (!levelManager.isInitialized()) {
      levelManager.initialize()
    }

    // Background
    add([
      rect(width(), height()),
      pos(0, 0),
      color(GAME_CONFIG.COLORS.BACKGROUND),
      z(-100),
    ])

    // Title
    add([
      text('Select Level', { size: 48, font: 'bold' }),
      pos(center().x, 50),
      anchor('center'),
      color(GAME_CONFIG.COLORS.UI_TEXT),
      z(100),
    ])

    // Get level info for display
    const levelInfo = levelManager.getLevelInfo()

    // Progress summary
    add([
      text(`Progress: ${levelInfo.unlockedCount}/${MAX_LEVELS} unlocked`, {
        size: 24,
      }),
      pos(center().x, 100),
      anchor('center'),
      color(GAME_CONFIG.COLORS.UI_TEXT),
      z(100),
    ])

    // Currency display
    add([
      text(`Coins: ${levelInfo.totalCurrency}`, { size: 24 }),
      pos(width() - 20, 20),
      anchor('topright'),
      color(255, 215, 0), // Gold color
      z(100),
    ])

    // Create level buttons
    createLevelButtons()

    // Back to menu button
    createBackButton()
  })
}

function createLevelButtons() {
  const levels = getAllLevels()
  const levelManager = getLevelManager()
  const cols = 3
  const buttonWidth = 140
  const buttonHeight = 100
  const spacing = 20

  // Calculate starting position to center the grid
  const totalWidth = cols * buttonWidth + (cols - 1) * spacing
  const startX = (width() - totalWidth) / 2 + buttonWidth / 2
  const startY = 180

  levels.forEach((level: Level, index: number) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    const x = startX + col * (buttonWidth + spacing)
    const y = startY + row * (buttonHeight + spacing + 40)

    const isUnlocked = levelManager.isLevelUnlocked(level.id)
    const isCurrentLevel =
      level.number === levelManager.getCurrentLevel().number
    const bestScore = levelManager.getBestScore(level.id)

    // Button background
    const buttonColor = isUnlocked
      ? isCurrentLevel
        ? Color.fromHex(GAME_CONFIG.COLORS.UI_ACCENT)
        : Color.fromHex(GAME_CONFIG.COLORS.UI_BUTTON)
      : rgb(128, 128, 128)

    const button = add([
      rect(buttonWidth, buttonHeight),
      pos(x, y),
      anchor('center'),
      color(buttonColor),
      area(),
      z(10),
    ])

    // Level number
    add([
      text(`${level.number}`, { size: 36, font: 'bold' }),
      pos(x, y - 15),
      anchor('center'),
      color(isUnlocked ? Color.WHITE : Color.fromHex('#CCCCCC')),
      z(11),
    ])

    // Level name (truncated if needed)
    const displayName =
      level.name.length > 12 ? level.name.substring(0, 12) + '...' : level.name
    add([
      text(displayName, { size: 14 }),
      pos(x, y + 15),
      anchor('center'),
      color(isUnlocked ? Color.WHITE : Color.fromHex('#CCCCCC')),
      z(11),
    ])

    // Lock icon for locked levels
    if (!isUnlocked) {
      add([
        text('', { size: 20 }), // Lock emoji or icon
        pos(x, y - 35),
        anchor('center'),
        color(Color.fromHex('#888888')),
        z(11),
      ])
    }

    // Best score display
    if (isUnlocked && bestScore > 0) {
      add([
        text(`Best: ${bestScore}`, { size: 12 }),
        pos(x, y + 35),
        anchor('center'),
        color(Color.fromHex('#FFD700')),
        z(11),
      ])
    }

    // Click handler for unlocked levels
    if (isUnlocked) {
      button.onClick(() => {
        // Set current level
        levelManager.setCurrentLevel(level.number)

        // Transition to game scene with level parameter
        go(Scene.SpaGame, { levelId: level.id })
      })

      // Hover effect
      button.onHover(() => {
        button.color = Color.fromHex(GAME_CONFIG.COLORS.UI_ACCENT)
      })

      button.onHoverEnd(() => {
        button.color = buttonColor
      })
    }
  })
}

function createBackButton() {
  const backButton = add([
    rect(120, 40),
    pos(20, height() - 60),
    color(Color.fromHex(GAME_CONFIG.COLORS.UI_BUTTON)),
    area(),
    z(10),
  ])

  add([
    text('Back', { size: 20 }),
    pos(80, height() - 40),
    anchor('center'),
    color(Color.WHITE),
    z(11),
  ])

  backButton.onClick(() => {
    go(Scene.Menu)
  })

  backButton.onHover(() => {
    backButton.color = Color.fromHex(GAME_CONFIG.COLORS.UI_ACCENT)
  })

  backButton.onHoverEnd(() => {
    backButton.color = Color.fromHex(GAME_CONFIG.COLORS.UI_BUTTON)
  })
}

/**
 * Navigate to level select scene
 */
export function goToLevelSelect(): void {
  go(Scene.LevelSelect)
}
