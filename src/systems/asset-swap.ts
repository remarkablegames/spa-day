/**
 * Asset management system for external image swapping
 * Supports seamless transition from geometric shapes to external images
 */

export interface AssetConfig {
  type: 'shape' | 'image'
  source: string
  fallback?: string
  size: { width: number; height: number }
  scale?: number
}

export interface AssetMapping {
  characters: Record<string, AssetConfig>
  masks: Record<string, AssetConfig>
  ui: Record<string, AssetConfig>
  backgrounds: Record<string, AssetConfig>
}

export class AssetSwapManager {
  private assetMappings: AssetMapping = {
    characters: {},
    masks: {},
    ui: {},
    backgrounds: {},
  }

  private loadedAssets: Map<string, unknown> = new Map()
  private isUsingExternalImages: boolean = false

  constructor() {
    this.initializeDefaultMappings()
  }

  private initializeDefaultMappings(): void {
    // Default character mappings (geometric shapes)
    this.assetMappings.characters = {
      customer_1: {
        type: 'shape',
        source: 'circle',
        size: { width: 64, height: 64 },
        scale: 1,
      },
    }

    // Default mask mappings (geometric shapes by type)
    this.assetMappings.masks = {
      hydrating: {
        type: 'shape',
        source: 'rect',
        size: { width: 32, height: 32 },
        scale: 1,
      },
      clarifying: {
        type: 'shape',
        source: 'polygon',
        size: { width: 32, height: 32 },
        scale: 1,
      },
      anti_aging: {
        type: 'shape',
        source: 'star',
        size: { width: 32, height: 32 },
        scale: 1,
      },
      soothing: {
        type: 'shape',
        source: 'diamond',
        size: { width: 32, height: 32 },
        scale: 1,
      },
      detoxifying: {
        type: 'shape',
        source: 'hexagon',
        size: { width: 32, height: 32 },
        scale: 1,
      },
    }

    // Default UI mappings
    this.assetMappings.ui = {
      button: {
        type: 'shape',
        source: 'rect',
        size: { width: 100, height: 40 },
        scale: 1,
      },
      panel: {
        type: 'shape',
        source: 'rect',
        size: { width: 200, height: 150 },
        scale: 1,
      },
    }

    // Default background mappings
    this.assetMappings.backgrounds = {
      spa_bg: {
        type: 'shape',
        source: 'rect',
        size: { width: 800, height: 600 },
        scale: 1,
      },
    }
  }

  public loadExternalAssetConfig(config: Partial<AssetMapping>): void {
    // Merge external config with existing mappings
    this.assetMappings = {
      characters: { ...this.assetMappings.characters, ...config.characters },
      masks: { ...this.assetMappings.masks, ...config.masks },
      ui: { ...this.assetMappings.ui, ...config.ui },
      backgrounds: { ...this.assetMappings.backgrounds, ...config.backgrounds },
    }

    this.isUsingExternalImages = true
  }

  public preloadAssets(): Promise<void> {
    const promises: Promise<void>[] = []

    // Preload all external images
    Object.entries(this.assetMappings).forEach(([, assets]) => {
      Object.entries(assets).forEach(([key, config]) => {
        if ((config as AssetConfig).type === 'image') {
          promises.push(this.loadImageAsset(key, config as AssetConfig))
        }
      })
    })

    return Promise.all(promises).then(() => {
      // All assets loaded successfully
    })
  }

  private async loadImageAsset(
    key: string,
    config: AssetConfig,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        loadSprite(key, config.source)
        this.loadedAssets.set(key, config)
        resolve()
      } catch (error) {
        // If external image fails, try fallback
        if (config.fallback) {
          try {
            loadSprite(key, config.fallback)
            this.loadedAssets.set(key, { ...config, source: config.fallback })
            resolve()
          } catch (fallbackError) {
            reject(fallbackError)
          }
        } else {
          reject(error)
        }
      }
    })
  }

  public getAssetConfig(
    category: keyof AssetMapping,
    key: string,
  ): AssetConfig | null {
    return this.assetMappings[category]?.[key] || null
  }

  public createCharacterSprite(characterId: string, options?: unknown) {
    const config = this.getAssetConfig('characters', characterId)
    if (!config) return null

    if (config.type === 'image' && this.isUsingExternalImages) {
      // Use external image sprite
      return this.createImageSprite(characterId, config, options)
    } else {
      // Use geometric shape fallback
      return this.createShapeSprite(config, options)
    }
  }

  public createMaskSprite(maskType: string, options?: unknown) {
    const config = this.getAssetConfig('masks', maskType)
    if (!config) return null

    if (config.type === 'image' && this.isUsingExternalImages) {
      return this.createImageSprite(maskType, config, options)
    } else {
      return this.createShapeSprite(config, options)
    }
  }

  public createUISprite(uiType: string, options?: unknown) {
    const config = this.getAssetConfig('ui', uiType)
    if (!config) return null

    if (config.type === 'image' && this.isUsingExternalImages) {
      return this.createImageSprite(uiType, config, options)
    } else {
      return this.createShapeSprite(config, options)
    }
  }

  private createImageSprite(
    key: string,
    config: AssetConfig,
    options?: unknown,
  ) {
    return [
      sprite(key),
      scale(config.scale || 1),
      ...Object.values(options || {}),
    ]
  }

  private createShapeSprite(config: AssetConfig, options?: unknown) {
    const { size, scale = 1 } = config
    const scaledSize = {
      width: size.width * scale,
      height: size.height * scale,
    }

    // Create appropriate shape based on source
    let shapeComponent
    switch (config.source) {
      case 'circle':
        shapeComponent = circle(scaledSize.width / 2)
        break
      case 'rect':
        shapeComponent = rect(scaledSize.width, scaledSize.height)
        break
      case 'polygon':
        shapeComponent = polygon([
          vec2(-scaledSize.width / 2, -scaledSize.height / 2),
          vec2(scaledSize.width / 2, -scaledSize.height / 2),
          vec2(scaledSize.width / 2, scaledSize.height / 2),
          vec2(-scaledSize.width / 2, scaledSize.height / 2),
        ])
        break
      case 'star':
        shapeComponent = polygon([
          vec2(0, -scaledSize.height / 2),
          vec2(scaledSize.width / 4, -scaledSize.height / 4),
          vec2(scaledSize.width / 2, 0),
          vec2(scaledSize.width / 4, scaledSize.height / 4),
          vec2(0, scaledSize.height / 2),
          vec2(-scaledSize.width / 4, scaledSize.height / 4),
          vec2(-scaledSize.width / 2, 0),
          vec2(-scaledSize.width / 4, -scaledSize.height / 4),
        ])
        break
      case 'diamond':
        shapeComponent = polygon([
          vec2(0, -scaledSize.height / 2),
          vec2(scaledSize.width / 2, 0),
          vec2(0, scaledSize.height / 2),
          vec2(-scaledSize.width / 2, 0),
        ])
        break
      case 'hexagon':
        shapeComponent = polygon([
          vec2(scaledSize.width / 2, 0),
          vec2(scaledSize.width / 4, scaledSize.height / 2),
          vec2(-scaledSize.width / 4, scaledSize.height / 2),
          vec2(-scaledSize.width / 2, 0),
          vec2(-scaledSize.width / 4, -scaledSize.height / 2),
          vec2(scaledSize.width / 4, -scaledSize.height / 2),
        ])
        break
      default:
        shapeComponent = rect(scaledSize.width, scaledSize.height)
    }

    return [shapeComponent, ...Object.values(options || {})]
  }

  public swapToExternalImages(configPath?: string): Promise<void> {
    // Load external asset configuration
    if (configPath) {
      return fetch(configPath)
        .then((response) => response.json())
        .then((config: Partial<AssetMapping>) => {
          this.loadExternalAssetConfig(config)
          return this.preloadAssets()
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.warn('Failed to load external asset config:', error)
          return Promise.resolve()
        })
    } else {
      // Use default external mappings
      const externalConfig = this.createDefaultExternalConfig()
      this.loadExternalAssetConfig(externalConfig)
      return this.preloadAssets()
    }
  }

  private createDefaultExternalConfig(): Partial<AssetMapping> {
    return {
      characters: {
        customer_1: {
          type: 'image',
          source: 'assets/characters/customer_1.png',
          fallback: 'circle',
          size: { width: 64, height: 64 },
          scale: 1,
        },
      },
      masks: {
        hydrating: {
          type: 'image',
          source: 'assets/masks/hydrating.png',
          fallback: 'rect',
          size: { width: 32, height: 32 },
          scale: 1,
        },
        clarifying: {
          type: 'image',
          source: 'assets/masks/clarifying.png',
          fallback: 'polygon',
          size: { width: 32, height: 32 },
          scale: 1,
        },
        anti_aging: {
          type: 'image',
          source: 'assets/masks/anti_aging.png',
          fallback: 'star',
          size: { width: 32, height: 32 },
          scale: 1,
        },
        soothing: {
          type: 'image',
          source: 'assets/masks/soothing.png',
          fallback: 'diamond',
          size: { width: 32, height: 32 },
          scale: 1,
        },
        detoxifying: {
          type: 'image',
          source: 'assets/masks/detoxifying.png',
          fallback: 'hexagon',
          size: { width: 32, height: 32 },
          scale: 1,
        },
      },
      backgrounds: {
        spa_bg: {
          type: 'image',
          source: 'assets/backgrounds/spa_background.jpg',
          fallback: 'rect',
          size: { width: 800, height: 600 },
          scale: 1,
        },
      },
    }
  }

  public isUsingImages(): boolean {
    return this.isUsingExternalImages
  }

  public getAssetMappings(): AssetMapping {
    return { ...this.assetMappings }
  }

  public resetToShapes(): void {
    this.isUsingExternalImages = false
    this.initializeDefaultMappings()
  }
}

// Global asset swap manager instance
let assetSwapManager: AssetSwapManager | null = null

export function initAssetSwapManager(): AssetSwapManager {
  if (!assetSwapManager) {
    assetSwapManager = new AssetSwapManager()
  }
  return assetSwapManager
}

export function getAssetSwapManager(): AssetSwapManager {
  if (!assetSwapManager) {
    throw new Error('Asset swap manager not initialized')
  }
  return assetSwapManager
}

// Helper functions for common asset operations
export function createCharacter(characterId: string, options?: unknown) {
  const manager = getAssetSwapManager()
  return manager.createCharacterSprite(characterId, options)
}

export function createMask(maskType: string, options?: unknown) {
  const manager = getAssetSwapManager()
  return manager.createMaskSprite(maskType, options)
}

export function createUI(uiType: string, options?: unknown) {
  const manager = getAssetSwapManager()
  return manager.createUISprite(uiType, options)
}

export function swapToImages(configPath?: string): Promise<void> {
  const manager = getAssetSwapManager()
  return manager.swapToExternalImages(configPath)
}
