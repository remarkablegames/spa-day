/**
 * Loading screen and asset preloading system
 */

import { GAME_CONFIG } from '../constants/game-config'

export interface LoadingProgress {
  loaded: number
  total: number
  percentage: number
  currentAsset: string
}

export class LoadingManager {
  private assets: Map<string, () => Promise<void>> = new Map()
  private progress: LoadingProgress = {
    loaded: 0,
    total: 0,
    percentage: 0,
    currentAsset: '',
  }
  private onComplete: (() => void) | null = null
  private onProgress: ((progress: LoadingProgress) => void) | null = null

  constructor() {
    this.setupDefaultAssets()
  }

  private setupDefaultAssets(): void {
    // Register spa game specific assets
    this.registerAsset('initialize-systems', () => this.initializeGameSystems())
    this.registerAsset('preload-masks', () => this.preloadMaskAssets())
    this.registerAsset('preload-character', () => this.preloadCharacterAssets())

    // Register sounds using the SOUND_FILES mapping
    // this.registerAsset(SOUND_FILES[Sound.MaskApply], () =>
    //   this.loadSound(Sound.MaskApply, SOUND_FILES[Sound.MaskApply]),
    // )
    // this.registerAsset(SOUND_FILES[Sound.TreatmentComplete], () =>
    //   this.loadSound(
    //     Sound.TreatmentComplete,
    //     SOUND_FILES[Sound.TreatmentComplete],
    //   ),
    // )
    // this.registerAsset(SOUND_FILES[Sound.BackgroundMusic], () =>
    //   this.loadSound(Sound.BackgroundMusic, SOUND_FILES[Sound.BackgroundMusic]),
    // )
  }

  public registerAsset(name: string, loadFunction: () => Promise<void>): void {
    this.assets.set(name, loadFunction)
    this.progress.total = this.assets.size
  }

  public setCompleteCallback(callback: () => void): void {
    this.onComplete = callback
  }

  public setProgressCallback(
    callback: (progress: LoadingProgress) => void,
  ): void {
    this.onProgress = callback
  }

  public async loadAll(): Promise<void> {
    const assetEntries = Array.from(this.assets.entries())

    for (const [name, loadFunction] of assetEntries) {
      this.progress.currentAsset = name

      try {
        await loadFunction()
        this.progress.loaded++
        this.progress.percentage = Math.round(
          (this.progress.loaded / this.progress.total) * 100,
        )

        if (this.onProgress) {
          this.onProgress({ ...this.progress })
        }
      } catch {
        // Failed to load asset, continue with others
        this.progress.loaded++
        this.progress.percentage = Math.round(
          (this.progress.loaded / this.progress.total) * 100,
        )
      }
    }

    if (this.onComplete) {
      this.onComplete()
    }
  }

  private async loadSprite(name: string, path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        loadSprite(name, path)
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  private async loadSound(name: string, path: string): Promise<void> {
    return new Promise((resolve) => {
      try {
        loadSound(name, path)
        resolve()
      } catch {
        // Sound loading failed, but don't reject - continue without sound
        resolve()
      }
    })
  }

  private async initializeGameSystems(): Promise<void> {
    // Import and initialize systems during preload
    const { initGameStateManager } = await import('../gameobjects/base')
    const { initInputSystem } = await import('../systems/input')
    const { initAssetManager } = await import('../systems/assets')
    const { initPerformanceMonitor } = await import('../systems/performance')
    const { initPauseManager } = await import('../systems/pause')
    const { initGameOverManager } = await import('../systems/gameover')

    initGameStateManager()
    initInputSystem()
    initAssetManager()
    initPerformanceMonitor()
    initPauseManager()
    initGameOverManager()
  }

  private async preloadMaskAssets(): Promise<void> {
    // Preload mask types and assets
    const { FaceMask } = await import('../gameobjects/mask')
    // This will pre-create mask types and cache them
    FaceMask.createMaskTypes()
  }

  private async preloadCharacterAssets(): Promise<void> {
    // Preload character assets and configurations
    // Character assets will be loaded when needed
    // This function is a placeholder for future character preloading
  }

  public getProgress(): LoadingProgress {
    return { ...this.progress }
  }

  public reset(): void {
    this.progress = {
      loaded: 0,
      total: this.assets.size,
      percentage: 0,
      currentAsset: '',
    }
  }
}

export interface LoadingUI {
  updateProgress: (percentage: number) => void
  cleanup: () => void
}

export function createLoadingScreen(): LoadingUI {
  // Background
  add([rect(width(), height()), color(GAME_CONFIG.COLORS.BACKGROUND), z(0)])

  // Loading title
  add([
    text('Spa Day', { size: 48, font: 'monospace' }),
    pos(center().x, center().y - 100),
    anchor('center'),
    color(GAME_CONFIG.COLORS.UI_ACCENT),
    z(10),
  ])

  // Loading subtitle
  add([
    text('Initializing spa experience...', { size: 20, font: 'monospace' }),
    pos(center().x, center().y - 50),
    anchor('center'),
    color(GAME_CONFIG.COLORS.UI_TEXT),
    z(10),
  ])

  // Progress bar background
  const progressBarBg = add([
    rect(300, 20),
    pos(center().x, center().y + 20),
    anchor('center'),
    color(GAME_CONFIG.COLORS.UI_PANEL),
    z(10),
  ])

  // Progress bar fill
  const progressBarFill = add([
    rect(1, 16), // Start with 1px width
    pos(center().x - 149, center().y + 20),
    anchor('left'),
    color(GAME_CONFIG.COLORS.UI_ACCENT),
    z(11),
  ])

  // Progress text
  const progressText = add([
    text('0%', { size: 16, font: 'monospace' }),
    pos(center().x, center().y + 50),
    anchor('center'),
    color(GAME_CONFIG.COLORS.UI_TEXT),
    z(10),
  ])

  // Loading dots animation
  const dots = ['.', '..', '...']
  let dotIndex = 0

  const dotsText = add([
    text('.', { size: 24, font: 'monospace' }),
    pos(center().x, center().y + 80),
    anchor('center'),
    color(GAME_CONFIG.COLORS.UI_ACCENT),
    z(10),
  ])

  // Animate loading dots
  loop(0.5, () => {
    dotIndex = (dotIndex + 1) % dots.length
    dotsText.text = dots[dotIndex]
  })

  // Return update function for progress
  return {
    updateProgress: (percentage: number) => {
      const fillWidth = Math.floor((percentage / 100) * 298)
      progressBarFill.width = fillWidth
      progressText.text = `${percentage}%`
    },
    cleanup: () => {
      destroy(progressBarBg)
      destroy(progressBarFill)
      destroy(progressText)
      destroy(dotsText)
    },
  }
}

// Global loading manager instance
let loadingManager: LoadingManager | null = null

export function initLoadingManager(): LoadingManager {
  if (!loadingManager) {
    loadingManager = new LoadingManager()
  }
  return loadingManager
}

export function getLoadingManager(): LoadingManager {
  if (!loadingManager) {
    throw new Error('Loading manager not initialized')
  }
  return loadingManager
}
