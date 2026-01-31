import { Scene } from '../constants'
import { createLoadingScreen, initLoadingManager } from '../systems/loading'

scene(Scene.Preload, () => {
  // Create loading screen
  const loadingUI = createLoadingScreen()

  // Initialize loading manager
  const loadingManager = initLoadingManager()

  // Set up callbacks
  loadingManager.setProgressCallback((progress) => {
    loadingUI.updateProgress(progress.percentage)
  })

  loadingManager.setCompleteCallback(() => {
    // Clean up loading screen
    loadingUI.cleanup()

    // Go to spa game scene
    go(Scene.SpaGame)
  })

  // Start loading assets
  loadingManager.loadAll()
})
