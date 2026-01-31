import { GAME_CONFIG } from '../constants/game-config'
import { getGameStateManager, initGameStateManager } from '../gameobjects/base'
import { Character } from '../gameobjects/character'
import { FaceMask } from '../gameobjects/mask'
import { TreatmentSession } from '../gameobjects/treatment'
import { initAssetManager } from '../systems/assets'
import { initInputSystem } from '../systems/input'

interface TouchPosition {
  x: number
  y: number
}

interface GameState {
  character: Character | null
  treatmentSession: TreatmentSession | null
  availableMasks: FaceMask[]
  selectedMask: FaceMask | null
  isDragging: boolean
  dragOffset: TouchPosition | null
}

export function createSpaGameScene() {
  const gameState: GameState = {
    character: null,
    treatmentSession: null,
    availableMasks: [],
    selectedMask: null,
    isDragging: false,
    dragOffset: null,
  }

  scene('spa-game', () => {
    // Initialize systems
    initGameStateManager()
    initInputSystem()
    initAssetManager()

    // Setup game state
    setupGameState(gameState)

    // Create UI
    createGameUI(gameState)

    // Setup input handlers
    setupInputHandlers(gameState)

    // Game loop
    onUpdate(() => {
      updateGame(gameState)
    })

    // Render
    onDraw(() => {
      renderGame(gameState)
    })
  })
}

function setupGameState(gameState: GameState) {
  // Create character
  gameState.character = new Character({
    id: 'character_1',
    name: 'Spa Customer',
    position: center(),
    satisfactionLevel: 50,
    preferredMaskTypes: [
      GAME_CONFIG.MASK_TYPES.HYDRATING,
      GAME_CONFIG.MASK_TYPES.SOOTHING,
    ],
  })

  // Create available masks (start with first mask unlocked)
  gameState.availableMasks = FaceMask.createMaskTypes()
  gameState.availableMasks[0].unlock() // Unlock first mask for MVP

  // Set initial positions for masks
  const maskY = height() - 100
  gameState.availableMasks.forEach((mask, index) => {
    mask.position = vec2(100 + index * 80, maskY)
  })

  // Create treatment session
  gameState.treatmentSession = TreatmentSession.createNewSession(
    gameState.character.id,
  )
}

function createGameUI(gameState: GameState) {
  // Background
  add([
    rect(width(), height()),
    pos(0, 0),
    color(GAME_CONFIG.COLORS.BACKGROUND),
    z(-100),
  ])

  // Title
  add([
    text('Spa Face Mask Game', { size: 32 }),
    pos(width() / 2, 50),
    anchor('center'),
    color(GAME_CONFIG.COLORS.UI_TEXT),
    z(100),
  ])

  // Score display
  const scoreText = add([
    text('Score: 0', { size: 20, font: 'bold' }),
    pos(10, 10),
    color(GAME_CONFIG.COLORS.UI_TEXT),
    z(100),
  ])

  // Collection button
  const collectionButton = add([
    rect(120, 40),
    pos(width() - 130, 60),
    color(GAME_CONFIG.COLORS.UI_BUTTON),
    z(100),
    area(),
  ])

  add([
    text('Collection', { size: 16 }),
    pos(width() - 70, 80),
    anchor('center'),
    color(255, 255, 255),
    z(101),
  ])

  collectionButton.onClick(() => {
    go('collection')
  })

  // Update score display
  const stateManager = getGameStateManager()
  stateManager.on('scoreChanged', (data) => {
    const score = data as number
    scoreText.text = `Score: ${score}`
  })

  // Listen for mask unlocks
  stateManager.on('maskUnlocked', (data) => {
    // Show unlock notification
    const notification = add([
      rect(300, 80),
      pos(center().x, 100),
      color(0, 0, 0),
      opacity(0.8),
      z(200),
    ])

    add([
      text(
        ` New Mask Unlocked: ${(data as { name: string }).name} ${(data as { icon: string }).icon}`,
        {
          size: 18,
          font: 'bold',
        },
      ),
      pos(center().x, 140),
      anchor('center'),
      color(255, 255, 255),
      z(201),
    ])

    // Auto-remove notification after 3 seconds
    wait(3, () => {
      destroy(notification)
    })
  })

  // Listen for achievements
  stateManager.on('achievementUnlocked', (achievement) => {
    // Show achievement notification
    const notification = add([
      rect(350, 100),
      pos(center().x, 100),
      color(0, 0, 0),
      opacity(0.8),
      z(200),
    ])

    add([
      text(` Achievement: ${(achievement as { name: string }).name}`, {
        size: 18,
        font: 'bold',
      }),
      pos(center().x, 130),
      anchor('center'),
      color(255, 255, 255),
      z(201),
    ])

    add([
      text((achievement as { description: string }).description, {
        size: 14,
        width: 330,
      }),
      pos(center().x, 160),
      anchor('center'),
      color(255, 255, 255),
      z(201),
    ])

    // Auto-remove notification after 4 seconds
    wait(4, () => {
      destroy(notification)
    })
  })

  // Timer display
  const timerText = add([
    text('Time: 30s', { size: 24 }),
    pos(width() - 150, 20),
    color(GAME_CONFIG.COLORS.UI_TEXT),
    z(100),
  ])

  // Instructions
  add([
    text('Drag masks to character face areas', { size: 16 }),
    pos(width() / 2, height() - 30),
    anchor('center'),
    color(GAME_CONFIG.COLORS.UI_TEXT),
    z(100),
  ])

  // Update UI elements
  onUpdate(() => {
    const stateManager = getGameStateManager()
    scoreText.text = `Score: ${stateManager.getScore()}`

    if (gameState.treatmentSession) {
      const remainingTime = Math.ceil(
        gameState.treatmentSession.getRemainingTime(),
      )
      timerText.text = `Time: ${remainingTime}s`
    }
  })
}

function setupInputHandlers(gameState: GameState) {
  onTouchStart((pos) => {
    handleTouchStart(pos, gameState)
  })

  onTouchMove((pos) => {
    handleTouchMove(pos, gameState)
  })

  onTouchEnd((pos) => {
    handleTouchEnd(pos, gameState)
  })

  // Mouse support for desktop testing
  onMousePress((btn) => {
    if (btn === 'left') {
      handleTouchStart(mousePos(), gameState)
    }
  })

  onMouseRelease(() => {
    handleTouchEnd(mousePos(), gameState)
  })

  onMouseMove(() => {
    if (gameState.isDragging) {
      handleTouchMove(mousePos(), gameState)
    }
  })
}

function handleTouchStart(pos: TouchPosition, gameState: GameState) {
  // Convert position to Kaplay.js vector
  const touchPos = vec2(pos.x, pos.y)

  // Check if clicking on a mask
  const clickedMask = getMaskAtPosition(touchPos, gameState)
  if (clickedMask && clickedMask.isUnlocked) {
    gameState.selectedMask = clickedMask
    gameState.isDragging = true
    gameState.dragOffset = {
      x: touchPos.x - clickedMask.position.x,
      y: touchPos.y - clickedMask.position.y,
    }
  }
}

function handleTouchMove(pos: TouchPosition, gameState: GameState) {
  if (gameState.isDragging && gameState.selectedMask && gameState.dragOffset) {
    // Convert position to Kaplay.js vector
    const touchPos = vec2(pos.x, pos.y)
    gameState.selectedMask.position = vec2(
      touchPos.x - gameState.dragOffset.x,
      touchPos.y - gameState.dragOffset.y,
    )
  }
}

function handleTouchEnd(pos: TouchPosition, gameState: GameState) {
  if (!gameState.isDragging || !gameState.selectedMask) return

  // Convert position to Kaplay.js vector
  const touchPos = vec2(pos.x, pos.y)

  // Try to apply mask to character
  if (gameState.character && gameState.treatmentSession) {
    const faceArea = gameState.character.getFaceAreaAtPosition(touchPos)

    if (faceArea && gameState.selectedMask.isCompatibleWith()) {
      // Apply mask
      const success = gameState.treatmentSession.applyMask(
        gameState.selectedMask.id,
        faceArea.id,
        gameState.character,
      )

      if (success) {
        // Update score
        const stateManager = getGameStateManager()
        const maskScore = gameState.selectedMask.calculateScore(
          GAME_CONFIG.BASE_MASK_SCORE,
        )
        stateManager.addScore(maskScore)

        // Mark mask as applied and destroy its visual elements
        gameState.selectedMask.isApplied = true
        gameState.selectedMask.destroy()

        // Update progression system
        // For now, just update the game state manager
        // The progression system will be updated when the scene is reloaded
      }
    }
  }

  // Reset dragging state
  gameState.isDragging = false
  gameState.selectedMask = null
  gameState.dragOffset = null
}

function getMaskAtPosition(
  pos: TouchPosition,
  gameState: GameState,
): FaceMask | null {
  return (
    gameState.availableMasks.find((mask) => {
      const maskPos = vec2(pos.x, pos.y)
      const distance = maskPos.dist(mask.position)
      return distance <= GAME_CONFIG.MASK_SIZE && mask.isUnlocked
    }) || null
  )
}

function updateGame(gameState: GameState) {
  // Update character
  if (gameState.character) {
    gameState.character.update()
  }

  // Update treatment session
  if (gameState.treatmentSession) {
    gameState.treatmentSession.update()

    // Check if treatment is complete
    if (gameState.treatmentSession.isComplete()) {
      handleTreatmentComplete(gameState)
    }
  }

  // Update masks
  gameState.availableMasks.forEach((mask) => {
    mask.update()
  })
}

function renderGame(gameState: GameState) {
  // Render character
  if (gameState.character) {
    gameState.character.render()
  }

  // Render available masks
  gameState.availableMasks.forEach((mask) => {
    if (!mask.isApplied) {
      mask.render()
    }
  })
}

function handleTreatmentComplete(gameState: GameState) {
  if (!gameState.treatmentSession) return

  const summary = gameState.treatmentSession.getSummary()

  // Show completion message
  add([
    text(`Treatment Complete! Score: ${summary.score}`, { size: 32 }),
    pos(width() / 2, height() / 2),
    anchor('center'),
    color(GAME_CONFIG.COLORS.UI_TEXT),
    z(200),
  ])

  // Save high score
  const stateManager = getGameStateManager()
  const currentHighScore = stateManager.getScore()
  if (summary.score > currentHighScore) {
    stateManager.setScore(summary.score)
  }

  // Reset after delay
  wait(3, () => {
    resetGame(gameState)
  })
}

function resetGame(gameState: GameState) {
  // Clear current session
  if (gameState.treatmentSession) {
    gameState.treatmentSession = TreatmentSession.createNewSession(
      gameState.character!.id,
    )
  }

  // Reset character
  if (gameState.character) {
    gameState.character.clearAllMasks()
    gameState.character.setSatisfaction(50)
  }

  // Reset masks
  gameState.availableMasks.forEach((mask) => {
    mask.remove()
  })
}
