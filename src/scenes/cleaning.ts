/**
 * Face Cleaning Scene
 *
 * This scene handles the face cleaning mechanic where players use an eraser tool
 * to remove dirt spots from a character's face before applying spa masks.
 */

import { Scene } from '../constants'

export function createCleaningScene() {
  scene(Scene.Cleaning, () => {
    // Simple test to verify scene loads
    add([
      text('Cleaning Scene Loaded!', { size: 32 }),
      pos(center()),
      anchor('center'),
      color(255, 255, 255),
    ])

    add([
      text('Press ESC to return', { size: 16 }),
      pos(center().x, center().y + 40),
      anchor('center'),
      color(200, 200, 200),
    ])

    // Add escape key to return to main menu
    onKeyPress('escape', () => {
      go(Scene.Game)
    })

    // Initialize systems (commented out for now to test basic scene)
    // const assetManager = CleaningAssetManager.getInstance()
    // const cleaningState = new CleaningStateManager()
    // cleaningState.initialize()
    // initializeSceneObjects(cleaningState)
  })
}
