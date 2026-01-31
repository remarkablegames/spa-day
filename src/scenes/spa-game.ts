import {
  ColorComp,
  GameObj,
  OpacityComp,
  PosComp,
  ScaleComp,
  TextComp,
  Vec2,
  ZComp,
} from 'kaplay'

import { Scene } from '../constants'
import { GAME_CONFIG } from '../constants/game-config'
import { getGameStateManager, initGameStateManager } from '../gameobjects/base'
import { Character } from '../gameobjects/character'
import { FaceMask } from '../gameobjects/mask'
import { TreatmentSession } from '../gameobjects/treatment'
import { initAssetManager } from '../systems/assets'
import { getGameOverManager, initGameOverManager } from '../systems/gameover'
import { initInputSystem } from '../systems/input'
import { getPauseManager, initPauseManager } from '../systems/pause'
import {
  getPerformanceMonitor,
  initPerformanceMonitor,
} from '../systems/performance'

interface TouchPosition {
  x: number
  y: number
}

interface EraserObject {
  id: string
  position: Vec2
  radius: number
  isActive: boolean
  moveTo(pos: Vec2): void
  activate(): void
  deactivate(): void
  visual: GameObj<PosComp | ColorComp | ZComp | ScaleComp | OpacityComp> | null
}

interface DirtSpot {
  id: string
  position: Vec2
  isCleaned: boolean
  points: number
  visual: GameObj<PosComp | ColorComp | ZComp | ScaleComp | OpacityComp> | null
}

interface SpaGameState {
  character: Character | null
  treatmentSession: TreatmentSession | null
  availableMasks: FaceMask[]
  selectedMask: FaceMask | null
  isDragging: boolean
  dragOffset: TouchPosition | null
  cleaningMode: boolean
  eraser: EraserObject | null
  cleaningState: GameObj<TextComp | PosComp | ColorComp | ZComp> | null
  dirtSpots: DirtSpot[]
  score: number
}

export function createSpaGameScene() {
  const gameState: SpaGameState = {
    character: null,
    treatmentSession: null,
    availableMasks: [],
    selectedMask: null,
    isDragging: false,
    dragOffset: null,
    cleaningMode: false,
    eraser: null,
    cleaningState: null,
    dirtSpots: [],
    score: 0,
  }

  scene(Scene.SpaGame, () => {
    // Initialize systems
    initGameStateManager()
    initInputSystem()
    initAssetManager()
    initPerformanceMonitor()
    initPauseManager()
    initGameOverManager()

    // Start background music
    // const music = play(Sound.BackgroundMusic, {
    //   volume: 0.3,
    //   loop: true,
    // })

    // Setup game state
    setupGameState(gameState)

    // Create UI
    createGameUI(gameState)

    // Setup input handlers
    setupInputHandlers(gameState)

    // Add cleaning mode toggle
    onKeyPress('e', () => {
      toggleCleaningMode(gameState)
    })

    // Game loop with performance monitoring
    onUpdate(() => {
      const perfMonitor = getPerformanceMonitor()
      const pauseManager = getPauseManager()

      // Skip game updates if paused
      if (pauseManager.isPaused()) return

      perfMonitor.update()

      // Optimize if performance is poor
      if (perfMonitor.shouldOptimize()) {
        // Reduce particle effects or other optimizations
        // Performance optimization would go here
      }

      updateGame(gameState)

      // Update cleaning mode
      if (gameState.cleaningMode) {
        updateCleaningMode(gameState)
      }

      // Update treatment session with pause-adjusted time
      if (gameState.treatmentSession) {
        gameState.treatmentSession.setPauseManager(pauseManager)
        gameState.treatmentSession.update()
      }
    })

    // Render
    onDraw(() => {
      renderGame(gameState)
    })

    // Cleanup on scene destroy
    onDestroy(() => {
      // if (music) {
      //   music.stop()
      // }

      // Clean up pause manager to prevent keyboard listener conflicts
      const pauseManager = getPauseManager()
      pauseManager.reset()
    })
  })
}

function setupGameState(gameState: SpaGameState) {
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
  gameState.availableMasks.forEach((mask: FaceMask, index: number) => {
    mask.position = vec2(100 + index * 80, maskY)
  })

  // Create treatment session
  gameState.treatmentSession = TreatmentSession.createNewSession(
    gameState.character.id,
  )

  // Set pause manager on treatment session immediately
  const pauseManager = getPauseManager()
  gameState.treatmentSession.setPauseManager(pauseManager)
}

function createGameUI(gameState: SpaGameState) {
  // Background
  add([
    rect(width(), height()),
    pos(0, 0),
    color(GAME_CONFIG.COLORS.BACKGROUND),
    z(-100),
  ])

  // Title
  add([
    text('Spa Face Mask Game', { size: 48 }),
    pos(width() / 2, 50),
    anchor('center'),
    color(GAME_CONFIG.COLORS.UI_TEXT),
    z(100),
  ])

  // Score display with animations
  const scoreText = add([
    text('Score: 0', { size: 32, font: 'bold' }),
    pos(10, 10),
    color(GAME_CONFIG.COLORS.UI_TEXT),
    scale(1),
    z(100),
  ])

  // Score popup container for animations
  const scorePopups: GameObj<
    TextComp | PosComp | OpacityComp | ColorComp | ZComp
  >[] = []

  // Function to create score popup animation
  function showScorePopup(points: number, position: Vec2) {
    const popup = add([
      text(`+${points}`, { size: 36, font: 'bold' }),
      pos(position),
      color(255, 215, 0), // Gold color for points
      opacity(1),
      z(150),
    ])

    scorePopups.push(popup)

    // Animate popup floating up and fading
    tween(
      popup.pos,
      vec2(position.x, position.y - 50),
      1.5,
      (newPos) => (popup.pos = newPos),
      easings.easeOutQuad,
    )

    tween(
      1,
      0,
      1.5,
      (opacity) => (popup.opacity = opacity),
      easings.easeOutQuad,
    )

    // Remove popup after animation
    wait(1.5, () => {
      destroy(popup)
      const index = scorePopups.indexOf(popup)
      if (index > -1) {
        scorePopups.splice(index, 1)
      }
    })
  }

  // Function to animate score text change
  function animateScoreChange(newScore: number, oldScore: number) {
    const scoreDiff = newScore - oldScore

    // Pulse effect for score text
    tween(
      1,
      1.3,
      0.2,
      (scale) => {
        scoreText.scale = vec2(scale, scale)
      },
      easings.easeOutBack,
    )

    tween(
      1.3,
      1,
      0.3,
      (scale) => {
        scoreText.scale = vec2(scale, scale)
      },
      easings.easeInBack,
    )

    // Show score popup if score increased
    if (scoreDiff > 0) {
      showScorePopup(
        scoreDiff,
        vec2(scoreText.pos.x + 50, scoreText.pos.y + 20),
      )
    }

    // Change color temporarily for big scores
    if (scoreDiff >= 50) {
      scoreText.color = rgb(255, 215, 0) // Gold
      wait(1, () => {
        scoreText.color = rgb(51, 51, 51) // GAME_CONFIG.COLORS.UI_TEXT as RGB
      })
    } else if (scoreDiff >= 20) {
      scoreText.color = rgb(0, 255, 0) // Green
      wait(0.5, () => {
        scoreText.color = rgb(51, 51, 51) // GAME_CONFIG.COLORS.UI_TEXT as RGB
      })
    }
  }

  // Collection button
  const collectionButton = add([
    rect(160, 50),
    pos(width() - 170, 60),
    color(GAME_CONFIG.COLORS.UI_BUTTON),
    z(100),
    area(),
  ])

  add([
    text('Collection', { size: 24 }),
    pos(width() - 90, 85),
    anchor('center'),
    color(255, 255, 255),
    z(101),
  ])

  collectionButton.onClick(() => {
    go(Scene.Collection)
  })

  // Update score display with animations
  const stateManager = getGameStateManager()
  let oldScore = 0

  stateManager.on('scoreChanged', (data) => {
    const newScore = data as number
    scoreText.text = `Score: ${newScore}`

    // Animate the score change
    animateScoreChange(newScore, oldScore)
    oldScore = newScore
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
          size: 24,
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
        size: 24,
        font: 'bold',
      }),
      pos(center().x, 130),
      anchor('center'),
      color(255, 255, 255),
      z(201),
    ])

    add([
      text((achievement as { description: string }).description, {
        size: 20,
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
    text('Time: 30s', { size: 32 }),
    pos(width() - 200, 20),
    color(GAME_CONFIG.COLORS.UI_TEXT),
    z(100),
  ])

  // Instructions
  add([
    text('Drag masks to character face areas', { size: 24 }),
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

function setupInputHandlers(gameState: SpaGameState) {
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

function handleTouchStart(touchPos: TouchPosition, gameState: SpaGameState) {
  // Convert position to Kaplay.js vector
  const touchVector = vec2(touchPos.x, touchPos.y)

  // Check if clicking on a mask
  const clickedMask = getMaskAtPosition(touchVector, gameState)
  if (clickedMask && clickedMask.isUnlocked) {
    gameState.selectedMask = clickedMask
    gameState.isDragging = true
    gameState.dragOffset = {
      x: touchVector.x - clickedMask.position.x,
      y: touchVector.y - clickedMask.position.y,
    }
  }
}

function handleTouchMove(touchPos: TouchPosition, gameState: SpaGameState) {
  if (gameState.isDragging && gameState.selectedMask && gameState.dragOffset) {
    // Convert position to Kaplay.js vector
    const touchVector = vec2(touchPos.x, touchPos.y)
    gameState.selectedMask.position = vec2(
      touchVector.x - gameState.dragOffset.x,
      touchVector.y - gameState.dragOffset.y,
    )
  }
}

function handleTouchEnd(touchPos: TouchPosition, gameState: SpaGameState) {
  if (!gameState.isDragging || !gameState.selectedMask) return

  // Convert position to Kaplay.js vector
  const touchVector = vec2(touchPos.x, touchPos.y)

  // Try to apply mask to character
  if (gameState.character && gameState.treatmentSession) {
    const faceArea = gameState.character.getFaceAreaAtPosition(touchVector)

    if (faceArea && gameState.selectedMask.isCompatibleWith()) {
      // Apply mask
      const success = gameState.treatmentSession.applyMask(
        gameState.selectedMask.id,
        faceArea.id,
        gameState.character,
      )

      if (success) {
        // Play mask application sound
        // play(Sound.MaskApply, { volume: 0.3 })

        // Create particle effects at application point
        const faceAreaWorldPos = gameState.character.position.add(
          faceArea.position,
        )
        for (let i = 0; i < GAME_CONFIG.PARTICLE_COUNT; i++) {
          add([
            circle(rand(2, 6)),
            pos(
              faceAreaWorldPos.x + rand(-20, 20),
              faceAreaWorldPos.y + rand(-20, 20),
            ),
            color(GAME_CONFIG.COLORS.MASK_HYDRATING),
            lifespan(GAME_CONFIG.EFFECT_DURATION / 1000),
            move(rand(0, 360), rand(20, 60)),
            opacity(1),
            z(200),
          ])
        }

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
  gameState: SpaGameState,
): FaceMask | null {
  return (
    gameState.availableMasks.find((mask: FaceMask) => {
      const maskPos = vec2(pos.x, pos.y)
      const distance = maskPos.dist(mask.position)
      return distance <= GAME_CONFIG.MASK_SIZE && mask.isUnlocked
    }) || null
  )
}

function updateGame(gameState: SpaGameState) {
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
  gameState.availableMasks.forEach((mask: FaceMask) => {
    mask.update()
  })
}

function renderGame(gameState: SpaGameState) {
  // Render character
  if (gameState.character) {
    gameState.character.render()
  }

  // Render available masks
  gameState.availableMasks.forEach((mask: FaceMask) => {
    if (!mask.isApplied) {
      mask.render()
    }
  })
}

function handleTreatmentComplete(gameState: SpaGameState) {
  if (!gameState.treatmentSession || !gameState.character) return

  // Play treatment completion sound
  // play(Sound.TreatmentComplete, { volume: 0.5 })

  // Create simple score breakdown from treatment session
  const scoreBreakdown = {
    baseScore: gameState.treatmentSession.score,
    effectivenessBonus: 0,
    timingBonus: 0,
    completionBonus: 0,
    satisfactionBonus: 0,
    comboMultiplier: 1,
    totalScore: gameState.treatmentSession.score,
  }

  // Get character satisfaction
  const satisfactionLevel = gameState.character.satisfactionLevel

  // Trigger game over with treatment completion
  const gameOverManager = getGameOverManager()
  gameOverManager.completeTreatment(
    scoreBreakdown.totalScore,
    satisfactionLevel,
  )

  // Go to results scene with treatment data
  go(Scene.Results, {
    session: gameState.treatmentSession,
    character: gameState.character,
    scoreBreakdown: scoreBreakdown,
    treatmentDuration: gameState.treatmentSession.getElapsedTime() * 1000,
  })
}

/**
 * Toggle cleaning mode on/off
 */
function toggleCleaningMode(gameState: SpaGameState): void {
  gameState.cleaningMode = !gameState.cleaningMode

  if (gameState.cleaningMode) {
    // Simple eraser implementation for testing
    if (!gameState.eraser && gameState.character) {
      gameState.eraser = {
        id: 'spa-eraser',
        position: vec2(
          gameState.character.position.x,
          gameState.character.position.y,
        ),
        radius: 32,
        isActive: false,
        moveTo: function (pos: Vec2) {
          this.position = vec2(pos.x, pos.y)
          // Update visual eraser
          if (this.visual) {
            this.visual.pos = vec2(this.position.x, this.position.y)
          }
        },
        activate: function () {
          this.isActive = true
          // Update visual eraser appearance
          if (this.visual) {
            this.visual.color = rgb(255, 255, 255)
            this.visual.opacity = 0.8
            this.visual.scale = vec2(1.2)
          }
        },
        deactivate: function () {
          this.isActive = false
          // Update visual eraser appearance
          if (this.visual) {
            this.visual.color = rgb(255, 255, 255)
            this.visual.opacity = 0.3
            this.visual.scale = vec2(1.0)
          }
        },
        visual: null,
      } as EraserObject

      // Create visual eraser
      gameState.eraser!.visual = add([
        circle(gameState.eraser!.radius),
        pos(gameState.eraser!.position.x, gameState.eraser!.position.y),
        color(255, 100, 100), // Red color to be more visible
        opacity(0.8),
        scale(1),
        outline(4), // Add border
        z(100), // Higher z-index to be on top
        'eraser-visual',
      ])
    }

    // Simple dirt spots
    gameState.dirtSpots = []
    for (let i = 0; i < 25; i++) {
      const angle = (i / 25) * Math.PI * 2
      const distance = 50 + Math.random() * 30
      const spotPosition = {
        x: gameState.character!.position.x + Math.cos(angle) * distance,
        y: gameState.character!.position.y + Math.sin(angle) * distance,
      }

      const spot: DirtSpot = {
        id: `spot-${i}`,
        position: vec2(spotPosition.x, spotPosition.y),
        isCleaned: false,
        points: 10,
        visual: null,
      }

      // Create visual dirt spot
      spot.visual = add([
        circle(4),
        pos(spotPosition.x, spotPosition.y),
        color(139, 69, 19), // Brown dirt color
        opacity(1),
        scale(1),
        z(45),
        'dirt-spot',
      ])

      gameState.dirtSpots.push(spot)
    }

    // Show cleaning mode indicator
    add([
      text(
        'CLEANING MODE - Mouse: Click & drag to clean | Arrow keys + Space also work',
        { size: 20 },
      ),
      pos(center().x, 50),
      anchor('center'),
      color(255, 255, 0),
      z(100),
      'cleaning-mode-indicator',
    ])

    // Add cleaning UI
    add([text('Score: 0', { size: 16 }), pos(20, 20), 'cleaning-score'])

    add([text('Progress: 0%', { size: 14 }), pos(20, 45), 'cleaning-progress'])

    // Setup eraser controls
    setupEraserControls(gameState)

    // Add mouse/touch controls for eraser
    setupMouseControls(gameState)
  } else {
    // Exit cleaning mode
    if (gameState.eraser) {
      gameState.eraser.deactivate()
      // Remove visual eraser
      if (gameState.eraser.visual) {
        destroy(gameState.eraser.visual)
        gameState.eraser.visual = null
      }
    }

    // Remove cleaning UI
    destroyAll('cleaning-mode-indicator')
    destroyAll('cleaning-score')
    destroyAll('cleaning-progress')

    // Remove eraser controls
    removeEraserControls()
  }
}

/**
 * Setup eraser controls for cleaning mode
 */
function setupEraserControls(gameState: SpaGameState): void {
  if (!gameState.eraser) return

  // Keyboard controls
  onKeyDown('left', () => {
    if (gameState.eraser) {
      gameState.eraser.moveTo(
        vec2(gameState.eraser.position.x - 5, gameState.eraser.position.y),
      )
    }
  })

  onKeyDown('right', () => {
    if (gameState.eraser) {
      gameState.eraser.moveTo(
        vec2(gameState.eraser.position.x + 5, gameState.eraser.position.y),
      )
    }
  })

  onKeyDown('up', () => {
    if (gameState.eraser) {
      gameState.eraser.moveTo(
        vec2(gameState.eraser.position.x, gameState.eraser.position.y - 5),
      )
    }
  })

  onKeyDown('down', () => {
    if (gameState.eraser) {
      gameState.eraser.moveTo(
        vec2(gameState.eraser.position.x, gameState.eraser.position.y + 5),
      )
    }
  })

  onKeyDown('space', () => {
    if (gameState.eraser) {
      gameState.eraser.isActive = !gameState.eraser.isActive
    }
  })
}

/**
 * Remove eraser controls
 */
function removeEraserControls(): void {
  // Note: Kaplay.js doesn't have a built-in way to remove specific key handlers
  // This would need to be handled with a custom input management system
  // For now, we'll just deactivate the eraser when exiting cleaning mode
}

/**
 * Setup mouse/touch controls for eraser
 */
function setupMouseControls(gameState: SpaGameState): void {
  if (!gameState.eraser) return

  // Mouse movement - follow cursor
  onMouseMove((pos) => {
    if (gameState.cleaningMode && gameState.eraser) {
      gameState.eraser.moveTo(pos)
    }
  })

  // Mouse press - activate eraser
  onMousePress(() => {
    if (gameState.cleaningMode && gameState.eraser) {
      gameState.eraser.activate()
    }
  })

  // Mouse release - deactivate eraser
  onMouseRelease(() => {
    if (gameState.cleaningMode && gameState.eraser) {
      gameState.eraser.deactivate()
    }
  })

  // Touch support
  onTouchMove((pos) => {
    if (gameState.cleaningMode && gameState.eraser) {
      gameState.eraser.moveTo(pos)
    }
  })

  onTouchStart(() => {
    if (gameState.cleaningMode && gameState.eraser) {
      gameState.eraser.activate()
    }
  })

  onTouchEnd(() => {
    if (gameState.cleaningMode && gameState.eraser) {
      gameState.eraser.deactivate()
    }
  })
}

/**
 * Update cleaning mode logic
 */
function updateCleaningMode(gameState: SpaGameState): void {
  if (!gameState.eraser || !gameState.dirtSpots) return

  // Check for collisions with dirt spots
  gameState.dirtSpots.forEach((spot: DirtSpot) => {
    if (!spot.isCleaned && gameState.eraser!.isActive) {
      const dx = spot.position.x - gameState.eraser!.position.x
      const dy = spot.position.y - gameState.eraser!.position.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance <= gameState.eraser!.radius) {
        spot.isCleaned = true
        gameState.score += spot.points

        // Remove visual dirt spot
        if (spot.visual) {
          destroy(spot.visual)
          spot.visual = null
        }

        // Update UI
        const scoreText = get('cleaning-score')[0]
        if (scoreText) {
          scoreText.text = `Score: ${gameState.score}`
        }

        const progressText = get('cleaning-progress')[0]
        if (progressText) {
          const cleanedCount = gameState.dirtSpots.filter(
            (s: DirtSpot) => s.isCleaned,
          ).length
          const progress = Math.round(
            (cleanedCount / gameState.dirtSpots.length) * 100,
          )
          progressText.text = `Progress: ${progress}%`
        }
      }
    }
  })
}
