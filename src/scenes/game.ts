import { Scene } from '../constants'
import { createSpaGameScene } from './spa-game'

// Create the spa game scene
createSpaGameScene()

// Keep the original game scene for reference/testing
scene(Scene.Game, () => {
  add([
    text('Original Game Scene - Press arrow keys', { width: width() / 2 }),
    pos(12, 12),
  ])
})
