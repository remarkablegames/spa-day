/**
 * Face Cleaning Scene
 *
 * This scene handles the face cleaning mechanic where players use an eraser tool
 * to remove dirt spots from a character's face before applying spa masks.
 */

import { Scene } from '../constants'
import { Character } from '../gameobjects/character'
import { DirtSpot } from '../gameobjects/dirt-spot'
import { EraserTool } from '../gameobjects/eraser'
import { CleaningAssetManager } from '../systems/cleaning-assets'
import { CleaningStateManager } from '../systems/cleaning-state'

export function createCleaningScene() {
  scene(Scene.Cleaning, () => {
    // Initialize systems
    const assetManager = CleaningAssetManager.getInstance()
    const cleaningState = new CleaningStateManager()

    // Initialize cleaning state
    cleaningState.initialize()

    // Load assets (will be implemented with actual Kaplay.js integration)
    assetManager
      .loadAssets()
      .then(() => {
        // Assets loaded, initialize scene objects
        initializeSceneObjects(cleaningState)
      })
      .catch(() => {
        // Handle asset loading error
        // Continue with scene initialization anyway
        initializeSceneObjects(cleaningState)
      })

    // Scene update loop
    onUpdate(() => {
      updateCleaningScene(cleaningState)
    })

    // Scene render loop
    onDraw(() => {
      drawCleaningScene()
    })
  })
}

/**
 * Initialize scene objects
 */
function initializeSceneObjects(cleaningState: CleaningStateManager): void {
  // Create character
  const character = new Character({
    id: 'cleaning-character',
    name: 'Spa Client',
    position: vec2(center().x, center().y),
    satisfactionLevel: 50,
    preferredMaskTypes: [],
  })

  // Initialize cleaning state for character
  character.initializeCleaningState()

  // Create eraser tool
  const eraser = new EraserTool('cleaning-eraser', vec2(center().x, center().y))
  cleaningState.setEraser(eraser)

  // Generate dirt spots
  generateDirtSpots(cleaningState, character)

  // Setup input handling
  setupInputHandling(eraser)

  // Setup UI elements
  setupCleaningUI()
}

/**
 * Generate dirt spots on character face
 */
function generateDirtSpots(
  cleaningState: CleaningStateManager,
  character: Character,
): void {
  const dirtyAreas = character.getDirtyAreas()
  const spotsPerArea = 10

  dirtyAreas.forEach((area) => {
    for (let i = 0; i < spotsPerArea; i++) {
      // Generate random position within face area
      const offsetX = (Math.random() - 0.5) * area.size.x * 0.8
      const offsetY = (Math.random() - 0.5) * area.size.y * 0.8
      const spotPosition = {
        x: character.position.x + area.position.x + offsetX,
        y: character.position.y + area.position.y + offsetY,
      }

      // Create dirt spot
      const spot = new DirtSpot(
        `spot-${area.id}-${i}`,
        spotPosition,
        Math.floor(Math.random() * 10) + 5, // 5-15 points
      )

      // Add to cleaning state
      cleaningState.addDirtSpot(spot)
    }
  })
}

/**
 * Setup input handling for eraser tool
 */
function setupInputHandling(eraser: EraserTool): void {
  // Mouse/touch input will be implemented with Kaplay.js integration
  // TODO: Setup onMouseMove, onTouchMove events

  // For now, basic keyboard controls for testing
  onKeyDown('left', () => {
    eraser.moveTo({ x: eraser.position.x - 5, y: eraser.position.y })
  })

  onKeyDown('right', () => {
    eraser.moveTo({ x: eraser.position.x + 5, y: eraser.position.y })
  })

  onKeyDown('up', () => {
    eraser.moveTo({ x: eraser.position.x, y: eraser.position.y - 5 })
  })

  onKeyDown('down', () => {
    eraser.moveTo({ x: eraser.position.x, y: eraser.position.y + 5 })
  })

  onKeyDown('space', () => {
    eraser.isActive = !eraser.isActive
  })
}

/**
 * Setup cleaning UI elements
 */
function setupCleaningUI(): void {
  // Score display
  add([
    text('Score: 0', { size: 24 }),
    pos(20, 20),
    { value: 0 },
    'score_display',
  ])

  // Progress display
  add([rect(200, 20), pos(20, 60), color(100, 100, 100), 'progress_bg'])

  add([rect(0, 20), pos(20, 60), color(0, 255, 0), 'progress_bar'])

  add([text('Progress: 0%', { size: 16 }), pos(20, 90), 'progress_text'])

  // Cleanliness validation display
  add([
    text('Cleanliness: Not Ready', { size: 16 }),
    pos(20, 120),
    color(255, 100, 100),
    'cleanliness_status',
  ])

  // Instructions
  add([
    text('Arrow Keys: Move | Space: Toggle Eraser', { size: 14 }),
    pos(20, height() - 40),
    color(200, 200, 200),
    'instructions',
  ])
}

/**
 * Update cleaning scene
 */
function updateCleaningScene(cleaningState: CleaningStateManager): void {
  // Check for collisions
  const collisions = cleaningState.checkCollisions()

  // Play audio feedback for cleaned spots
  if (collisions.length > 0) {
    playCleaningSound()
  }

  // Update UI
  updateCleaningUI(cleaningState)

  // Check completion
  if (cleaningState.isComplete()) {
    // Handle completion
    handleCleaningComplete()
  }
}

/**
 * Play cleaning sound effect
 */
function playCleaningSound(): void {
  // Audio playback will be implemented when integrated with scene
  // TODO: Play cleaning sound using Kaplay.js play()
  // play('clean')
}

/**
 * Draw cleaning scene
 */
function drawCleaningScene(): void {
  // Drawing will be handled by individual game objects
  // This function can be used for additional visual effects
}

/**
 * Update cleaning UI
 */
function updateCleaningUI(cleaningState: CleaningStateManager): void {
  // Update score
  const scoreDisplay = get('score_display')[0]
  if (scoreDisplay) {
    scoreDisplay.text = `Score: ${cleaningState.getScore()}`
  }

  // Update progress
  const progress = cleaningState.getProgress()
  const progressBar = get('progress_bar')[0]
  if (progressBar) {
    progressBar.width = progress * 200
  }

  const progressText = get('progress_text')[0]
  if (progressText) {
    progressText.text = `Progress: ${Math.round(progress * 100)}%`
  }

  // Update cleanliness status
  const validation = cleaningState.validateFaceCleanliness()
  const cleanlinessStatus = get('cleanliness_status')[0]
  if (cleanlinessStatus) {
    cleanlinessStatus.text = `Cleanliness: ${Math.round(validation.cleanliness * 100)}%`
    cleanlinessStatus.color = validation.isValid
      ? rgb(0, 255, 0)
      : rgb(255, 100, 100)
  }
}

/**
 * Handle cleaning completion
 */
function handleCleaningComplete(): void {
  // Show completion message
  add([
    text('Cleaning Complete!', { size: 48 }),
    pos(center()),
    anchor('center'),
    color(0, 255, 0),
    z(100),
    'completion_message',
  ])

  // Wait and then transition to next scene
  wait(2, () => {
    // TODO: Transition to mask application scene
    // go('mask_application')
  })
}
