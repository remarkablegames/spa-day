import {
  AnchorComp,
  AreaComp,
  ColorComp,
  GameObj,
  OpacityComp,
  PosComp,
  RectComp,
  ScaleComp,
  TextComp,
  Vec2,
  ZComp,
} from 'kaplay'

import { Scene } from '../constants'
import { GAME_CONFIG } from '../constants/game-config'
import { MOISTURIZING_CONFIG } from '../constants/moisturizing-config'
import { getGameStateManager } from '../gameobjects/base'
import { Character } from '../gameobjects/character'
import {
  createLevelProgressUI,
  showLevelCompleteUI,
  showLevelFailedUI,
} from '../gameobjects/levelprogress'
import { FaceMask } from '../gameobjects/mask'
import { MoisturizerTool } from '../gameobjects/moisturizer-tool'
import { MoisturizerTrail } from '../gameobjects/moisturizer-trail'
import { TreatmentSession } from '../gameobjects/treatment'
import { getGameOverManager } from '../systems/gameover'
import {
  getLevelManager,
  initializeLevelManager,
} from '../systems/levelmanager'
import {
  getMoisturizingStateManager,
  initMoisturizingStateManager,
} from '../systems/moisturizing-state'
import { getPauseManager } from '../systems/pause'
import { getPerformanceMonitor } from '../systems/performance'
import type { TreatmentResults } from '../types/level'

interface TouchPosition {
  x: number
  y: number
}

type EraserVisual = GameObj<
  PosComp | ColorComp | OpacityComp | ScaleComp | ZComp
>

type DirtSpotVisual = GameObj<PosComp | ColorComp | ZComp>

interface EraserObject {
  id: string
  position: Vec2
  radius: number
  isActive: boolean
  moveTo(pos: Vec2): void
  activate(): void
  deactivate(): void
  visual: EraserVisual | null
}

interface DirtSpot {
  id: string
  position: Vec2
  isCleaned: boolean
  points: number
  visual: DirtSpotVisual | null
  areaId: string // Track which face area this dirt spot belongs to
}

interface SpaGameState {
  character: Character | null
  treatmentSession: TreatmentSession | null
  availableMasks: FaceMask[]
  selectedMask: FaceMask | null
  isDragging: boolean
  dragOffset: TouchPosition | null
  cleaningMode: boolean // Always true - cleaning is part of the game
  eraser: EraserObject | null
  cleaningState: GameObj<TextComp | PosComp | ColorComp | ZComp> | null
  dirtSpots: DirtSpot[]
  score: number
  // Moisturizer mode state
  moisturizerMode: boolean
  moisturizerTool: MoisturizerTool | null
  moisturizerTrail: MoisturizerTrail | null
  moisturizerProgressUI: GameObj<
    TextComp | PosComp | ColorComp | OpacityComp | ZComp
  > | null
}

export function createSpaGameScene() {
  scene(Scene.SpaGame, (params: { levelId?: string } = {}) => {
    // Create fresh game state for each level
    const gameState: SpaGameState = {
      character: null,
      treatmentSession: null,
      availableMasks: [],
      selectedMask: null,
      isDragging: false,
      dragOffset: null,
      cleaningMode: true,
      eraser: null,
      cleaningState: null,
      dirtSpots: [],
      score: 0,
      // Moisturizer mode state
      moisturizerMode: false,
      moisturizerTool: null,
      moisturizerTrail: null,
      moisturizerProgressUI: null,
    }

    // Initialize level manager
    initializeLevelManager()
    const levelManager = getLevelManager()

    // Set current level if provided
    if (params.levelId) {
      const levelNum = parseInt(params.levelId, 10)
      if (!isNaN(levelNum)) {
        levelManager.setCurrentLevel(levelNum)
      }
    }

    // Create level progress UI (T014)
    createLevelProgressUI()

    // Systems are now initialized in preload scene
    // Start background music
    // const music = play(Sound.BackgroundMusic, {
    //   volume: 0.3,
    //   loop: true,
    // })

    // Setup game state with level configuration
    setupGameState(gameState)

    // Reset score for new level
    gameState.score = 0

    // Create UI
    createGameUI(gameState)

    // Setup input handlers
    setupInputHandlers(gameState)

    // Initialize cleaning mode automatically
    initializeCleaningMode(gameState)

    // Initialize moisturizer mode (for testing/feature availability)
    initializeMoisturizerMode(gameState)

    // Start the treatment session
    if (gameState.treatmentSession) {
      gameState.treatmentSession.startTreatment()
    }

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

      // Update cleaning mode (always active)
      updateCleaningMode(gameState)

      // Update moisturizer mode (when active)
      updateMoisturizerMode(gameState)

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
  const levelManager = getLevelManager()
  const currentLevel = levelManager.getCurrentLevel()
  const customerTemplate = levelManager.getCustomerTemplate()
  const levelConfig = levelManager.getLevelConfig()

  // Create character with level-specific template and personality
  gameState.character = new Character({
    id: `character_level_${currentLevel.number}`,
    name: customerTemplate.name,
    position: center(),
    satisfactionLevel: 50,
    preferredMaskTypes: customerTemplate.preferredMaskTypes,
    personalityTraits: customerTemplate.personalityTraits,
  })

  // Create available masks (start with first mask unlocked)
  gameState.availableMasks = FaceMask.createMaskTypes()
  gameState.availableMasks[0].unlock() // Unlock first mask for MVP

  // Set initial positions for masks
  const maskY = height() - 100
  gameState.availableMasks.forEach((mask: FaceMask, index: number) => {
    mask.position = vec2(100 + index * 80, maskY)
  })

  // Create treatment session with level-specific time limit
  gameState.treatmentSession = TreatmentSession.createNewSession(
    gameState.character.id,
  )

  // Set the duration from level config
  gameState.treatmentSession.duration = levelConfig.timeLimit

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

  // Score display (hidden - satisfaction is what matters now)
  const scoreText = add([
    text('', { size: 32, font: 'bold' }),
    pos(-100, -100), // Off-screen
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

        // Add satisfaction for applying mask (+15% or +20% for preferred)
        gameState.character.addMaskSatisfaction(gameState.selectedMask.type)

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

        // Update score with personality multiplier
        const stateManager = getGameStateManager()
        const baseMaskScore = gameState.selectedMask.calculateScore(
          GAME_CONFIG.BASE_MASK_SCORE,
        )
        // Apply customer personality score multiplier
        const scoreMultiplier = gameState.character.getScoreMultiplier()
        const finalMaskScore = Math.round(baseMaskScore * scoreMultiplier)
        stateManager.addScore(finalMaskScore)

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

  // Get level manager
  const levelManager = getLevelManager()
  const levelConfig = levelManager.getLevelConfig()

  // Create simple score breakdown from treatment session
  const scoreBreakdown = {
    baseScore: gameState.treatmentSession.score,
    effectivenessBonus: 0,
    timingBonus: 0,
    completionBonus: 0,
    satisfactionBonus: 0,
    comboMultiplier: 1,
    totalScore: Math.floor(
      gameState.treatmentSession.score * levelConfig.scoreMultiplier,
    ),
  }

  // Get character satisfaction
  const satisfactionLevel = gameState.character.satisfactionLevel
  const timeUsed = gameState.treatmentSession.getElapsedTime()

  // Create treatment results for level completion
  const treatmentResults: TreatmentResults = {
    score: scoreBreakdown.totalScore,
    satisfaction: satisfactionLevel,
    timeUsed: timeUsed,
    masksApplied:
      (gameState.treatmentSession as unknown as { appliedMasks?: string[] })
        .appliedMasks || [],
    customerFeedback: '',
  }

  // Complete the level and get results
  const levelCompletionResult = levelManager.completeLevel(treatmentResults)

  // Trigger game over with treatment completion
  const gameOverManager = getGameOverManager()
  gameOverManager.completeTreatment(
    scoreBreakdown.totalScore,
    satisfactionLevel,
  )

  // Show level completion UI
  if (levelCompletionResult.success) {
    showLevelCompleteUI(
      levelCompletionResult.score,
      levelCompletionResult.satisfaction,
      levelCompletionResult.currencyEarned,
      levelCompletionResult.nextLevelUnlocked,
    )
  } else {
    showLevelFailedUI()
    return // Don't navigate to results if level failed
  }

  // Navigate to shop after successful level completion
  // From shop, player can buy items and then continue to next level
  go(Scene.Shop, { fromLevel: true })
}

/**
 * Initialize cleaning mode - always active
 */
function initializeCleaningMode(gameState: SpaGameState): void {
  // Simple eraser implementation
  if (!gameState.eraser && gameState.character) {
    gameState.eraser = {
      id: 'spa-eraser',
      position: vec2(
        gameState.character.position.x,
        gameState.character.position.y,
      ),
      radius: 32,
      isActive: false,
      moveTo: function (pos) {
        this.position = pos
        // Update visual eraser
        if (this.visual) {
          this.visual.pos = pos
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
    }

    // Create visual eraser
    gameState.eraser.visual = add([
      circle(gameState.eraser.radius),
      pos(gameState.eraser.position.x, gameState.eraser.position.y),
      color(255, 100, 100), // Red color to be more visible
      opacity(0), // Start hidden
      outline(4), // Add border
      z(100), // Higher z-index to be on top
      'eraser-visual',
    ]) as unknown as EraserVisual
  }

  // Dirt spots covering face areas
  gameState.dirtSpots = []

  // Get dirt spot count from level config
  const levelManager = getLevelManager()
  const levelConfig = levelManager.getLevelConfig()
  const totalDirtSpots = levelConfig.dirtSpotCount

  // Get face areas from character
  const faceAreas = gameState.character?.faceAreas || []

  // Distribute dirt spots across face areas
  const spotsPerArea = Math.ceil(totalDirtSpots / faceAreas.length)

  faceAreas.forEach((faceArea, areaIndex) => {
    for (
      let i = 0;
      i < spotsPerArea && gameState.dirtSpots.length < totalDirtSpots;
      i++
    ) {
      // Generate random position within this face area
      const areaHalfWidth = faceArea.size.x / 2
      const areaHalfHeight = faceArea.size.y / 2

      // Random position within the face area bounds
      const randomX = (Math.random() - 0.5) * areaHalfWidth * 2.2 // 110% of area width
      const randomY = (Math.random() - 0.5) * areaHalfHeight * 2.2 // 110% of area height

      const spotPosition = vec2(
        gameState.character!.position.x + faceArea.position.x + randomX,
        gameState.character!.position.y + faceArea.position.y + randomY,
      )

      const spot: DirtSpot = {
        id: `spot-${areaIndex}-${i}`,
        position: spotPosition,
        isCleaned: false,
        points: 10,
        visual: null,
        areaId: faceArea.id, // Track which face area this spot belongs to
      }

      // Create visual dirt spot
      spot.visual = add([
        circle(4), // Back to original size
        pos(spotPosition.x, spotPosition.y),
        color(139, 69, 19), // Brown dirt color
        z(45),
        'dirt-spot',
      ]) as DirtSpotVisual

      gameState.dirtSpots.push(spot)
    }
  })

  // Add eraser toggle button above mask buttons to prevent overlap
  const eraserToggleButton = add([
    rect(120, 40),
    pos(20, height() - 220), // Moved up even further
    color(100, 100, 100),
    z(90),
    area(),
  ])

  const eraserButtonText = add([
    text('Clean: OFF', { size: 14 }),
    pos(80, height() - 200), // Centered on button
    anchor('center'),
    color(255, 255, 255),
    z(91),
  ])

  // Handle button click
  eraserToggleButton.onClick(() => {
    // Clean up old eraser visual if it exists
    const wasActive = gameState.eraser?.isActive || false

    if (gameState.eraser && gameState.eraser.visual) {
      destroy(gameState.eraser.visual)
    }

    // Always create/recreate eraser when button is clicked
    if (gameState.character) {
      gameState.eraser = {
        id: 'spa-eraser',
        position: vec2(
          gameState.character.position.x,
          gameState.character.position.y,
        ),
        radius: 32,
        isActive: wasActive, // Preserve the previous active state
        moveTo: function (pos) {
          this.position = pos
          if (this.visual) {
            this.visual.pos = pos
          }
        },
        activate: function () {
          this.isActive = true
          if (this.visual) {
            this.visual.opacity = 0.8
          }
        },
        deactivate: function () {
          this.isActive = false
          if (this.visual) {
            this.visual.opacity = 0
          }
        },
        visual: null,
      }

      // Create visual eraser
      gameState.eraser.visual = add([
        circle(gameState.eraser.radius),
        pos(gameState.eraser.position.x, gameState.eraser.position.y),
        color(255, 255, 255), // White transparent color
        opacity(wasActive ? 0.8 : 0), // Set initial opacity based on state
        outline(4),
        z(100),
        'eraser-visual',
      ]) as unknown as EraserVisual
    }

    if (gameState.eraser) {
      if (gameState.eraser.isActive) {
        gameState.eraser.deactivate()
        eraserButtonText.text = 'Clean: OFF'
        eraserToggleButton.color = rgb(100, 100, 100)
        // Hide eraser when deactivated
        if (gameState.eraser.visual) {
          gameState.eraser.visual.opacity = 0
        }
      } else {
        gameState.eraser.activate()
        eraserButtonText.text = 'Clean: ON'
        eraserToggleButton.color = rgb(100, 255, 100)
        // Show eraser at mouse position when activated
        if (gameState.eraser.visual) {
          const currentMousePos = mousePos()
          gameState.eraser.moveTo(currentMousePos)
          gameState.eraser.visual.opacity = 0.8
        }
      }
    }
  })

  // Setup eraser controls
  setupEraserControls(gameState)

  // Add mouse/touch controls for eraser
  setupMouseControls(gameState)
}

/**
 * Setup eraser controls for cleaning mode
 */
function setupEraserControls(gameState: SpaGameState): void {
  if (!gameState.eraser) return

  // Keyboard controls for movement only (activation via button)
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
}

/**
 * Setup mouse/touch controls for eraser
 */
function setupMouseControls(gameState: SpaGameState): void {
  if (!gameState.eraser) return

  // Mouse movement - follow cursor (only when eraser is active via button)
  onMouseMove((pos) => {
    if (
      gameState.cleaningMode &&
      gameState.eraser &&
      gameState.eraser.isActive
    ) {
      gameState.eraser.moveTo(pos)
    }
  })

  // Touch support - follow touch (only when eraser is active via button)
  onTouchMove((pos) => {
    if (
      gameState.cleaningMode &&
      gameState.eraser &&
      gameState.eraser.isActive
    ) {
      gameState.eraser.moveTo(pos)
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

        // Update UI - main game score is already handled by stateManager
        const stateManager = getGameStateManager()
        // Apply customer personality score multiplier to dirt cleaning
        const cleaningScoreMultiplier =
          gameState.character?.getScoreMultiplier() || 1.0
        const finalCleaningScore = Math.round(
          spot.points * cleaningScoreMultiplier,
        )
        stateManager.addScore(finalCleaningScore)

        // Add satisfaction for cleaning dirt (+10%)
        if (gameState.character) {
          gameState.character.addCleaningSatisfaction(spot.areaId)
        }
      }
    }
  })
}

/**
 * Initialize moisturizer mode - toggleable feature
 */
function initializeMoisturizerMode(gameState: SpaGameState): void {
  if (!gameState.character) return

  // Initialize the state manager
  initMoisturizingStateManager()
  const stateManager = getMoisturizingStateManager()

  // Create moisturizer tool (hidden initially)
  const sessionId = `moisturizer-session-${Date.now()}`
  gameState.moisturizerTool = new MoisturizerTool(
    'moisturizer-tool',
    vec2(gameState.character.position.x, gameState.character.position.y),
    'moisturizer_basic',
    sessionId,
  )

  // Set face bounds for the tool
  const faceAreas = gameState.character.faceAreas || []
  if (faceAreas.length > 0) {
    // Calculate combined bounds of all face areas
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity
    faceAreas.forEach((area) => {
      const worldX = gameState.character!.position.x + area.position.x
      const worldY = gameState.character!.position.y + area.position.y
      minX = Math.min(minX, worldX - area.size.x / 2)
      minY = Math.min(minY, worldY - area.size.y / 2)
      maxX = Math.max(maxX, worldX + area.size.x / 2)
      maxY = Math.max(maxY, worldY + area.size.y / 2)
    })

    gameState.moisturizerTool.setAllowedBounds({
      x: minX - 20,
      y: minY - 20,
      width: maxX - minX + 40,
      height: maxY - minY + 40,
    })
  }

  // Create visual trail
  gameState.moisturizerTrail = new MoisturizerTrail(
    MOISTURIZING_CONFIG.colors.basic,
  )

  // Initialize state manager with session config
  stateManager.initialize({
    sessionId,
    faceBounds: gameState.moisturizerTool.allowedBounds || {
      x: gameState.character.position.x - 100,
      y: gameState.character.position.y - 100,
      width: 200,
      height: 200,
    },
    zoneGridSize: MOISTURIZING_CONFIG.zones.gridSize,
    completionThreshold: MOISTURIZING_CONFIG.zones.completionThreshold,
    moisturizerTypeId: 'moisturizer_basic',
  })

  // Set the tool in state manager
  stateManager.setTool(gameState.moisturizerTool)

  // Add moisturizer toggle button - positioned to the right of the eraser button
  const moisturizerToggleButton = add([
    rect(140, 40),
    pos(150, height() - 220),
    color(100, 100, 200),
    z(90),
    area(),
  ]) as GameObj<RectComp | PosComp | ColorComp | ZComp | AreaComp>

  const moisturizerButtonText = add([
    text('Moisturize: OFF', { size: 14 }),
    pos(220, height() - 200),
    anchor('center'),
    color(255, 255, 255),
    z(91),
  ]) as GameObj<TextComp | PosComp | ColorComp | ZComp | AnchorComp>

  // Handle button click
  moisturizerToggleButton.onClick(() => {
    toggleMoisturizerMode(
      gameState,
      moisturizerButtonText,
      moisturizerToggleButton,
    )
  })

  // Create progress UI (hidden initially)
  gameState.moisturizerProgressUI = add([
    text('Coverage: 0%', { size: 20 }),
    pos(width() - 150, 120),
    color(255, 255, 255),
    opacity(0),
    z(100),
  ]) as GameObj<TextComp | PosComp | ColorComp | OpacityComp | ZComp>

  // Setup moisturizer controls
  setupMoisturizerControls(gameState)
}

/**
 * Toggle moisturizer mode on/off
 */
function toggleMoisturizerMode(
  gameState: SpaGameState,
  buttonText: GameObj<TextComp | PosComp | ColorComp | AnchorComp | ZComp>,
  button: GameObj<RectComp | PosComp | ColorComp | AreaComp | ZComp>,
): void {
  gameState.moisturizerMode = !gameState.moisturizerMode

  if (gameState.moisturizerMode) {
    // Enable moisturizer mode
    buttonText.text = 'Moisturizer: ON'
    button.color = rgb(100, 200, 100)
    gameState.moisturizerProgressUI!.opacity = 1

    // Activate tool
    if (gameState.moisturizerTool) {
      gameState.moisturizerTool.activate()
      // Move to current mouse position
      gameState.moisturizerTool.moveTo(mousePos())
    }
  } else {
    // Disable moisturizer mode
    buttonText.text = 'Moisturize: OFF'
    button.color = rgb(100, 100, 200)
    gameState.moisturizerProgressUI!.opacity = 0

    // Deactivate tool
    if (gameState.moisturizerTool) {
      gameState.moisturizerTool.deactivate()
    }

    // Note: Trail is NOT cleared so moisturizer remains visible on face
  }
}

/**
 * Setup mouse/touch controls for moisturizer
 */
function setupMoisturizerControls(gameState: SpaGameState): void {
  if (!gameState.moisturizerTool) return

  // Mouse movement - follow cursor when active
  onMouseMove((pos) => {
    if (gameState.moisturizerMode && gameState.moisturizerTool) {
      gameState.moisturizerTool.moveTo(pos)

      // Add trail segment when moving and active
      if (gameState.moisturizerTool.isActive && gameState.moisturizerTrail) {
        gameState.moisturizerTrail.addSegment({ x: pos.x, y: pos.y })
      }
    }
  })

  // Touch support
  onTouchMove((pos) => {
    if (gameState.moisturizerMode && gameState.moisturizerTool) {
      gameState.moisturizerTool.moveTo(pos)

      // Add trail segment when moving and active
      if (gameState.moisturizerTool.isActive && gameState.moisturizerTrail) {
        gameState.moisturizerTrail.addSegment({ x: pos.x, y: pos.y })
      }
    }
  })
}

/**
 * Update moisturizer mode logic
 */
function updateMoisturizerMode(gameState: SpaGameState): void {
  if (!gameState.moisturizerMode || !gameState.moisturizerTool) return

  const stateManager = getMoisturizingStateManager()

  // Update smooth movement
  gameState.moisturizerTool.updateSmoothMovement()

  // Update coverage tracking
  const updateResult = stateManager.updateCoverage()

  // Update progress UI if there was new coverage
  if (updateResult.isNewCoverage && gameState.moisturizerProgressUI) {
    gameState.moisturizerProgressUI.text = `Coverage: ${Math.round(updateResult.coveragePercentage)}%`

    // Add satisfaction for moisturizer coverage
    if (gameState.character) {
      gameState.character.addMoisturizerSatisfaction(
        updateResult.coveragePercentage,
      )
    }
  }

  // Check for completion
  if (stateManager.isComplete()) {
    // Handle completion - could show success message
    gameState.moisturizerProgressUI!.text = 'Complete! 100%'
  }
}
