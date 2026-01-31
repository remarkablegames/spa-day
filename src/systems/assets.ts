import { Vec2 } from 'kaplay'

export interface AssetConfig {
  id: string
  type: 'shape' | 'image'
  data?: ShapeData
  path?: string
}

export interface ShapeData {
  shape: 'circle' | 'rect' | 'triangle' | 'hexagon'
  size: number
  color: string
}

export class AssetManager {
  private assets: Map<string, AssetConfig> = new Map()
  private loadedAssets: Map<string, unknown> = new Map()

  constructor() {
    this.initializeDefaultAssets()
  }

  private initializeDefaultAssets() {
    // Initialize geometric shape assets for MVP
    this.registerAsset({
      id: 'character_base',
      type: 'shape',
      data: { shape: 'circle', size: 64, color: '#FFB6C1' },
    })

    this.registerAsset({
      id: 'mask_hydrating',
      type: 'shape',
      data: { shape: 'rect', size: 32, color: '#87CEEB' },
    })

    this.registerAsset({
      id: 'mask_clarifying',
      type: 'shape',
      data: { shape: 'rect', size: 32, color: '#98FB98' },
    })

    this.registerAsset({
      id: 'mask_anti_aging',
      type: 'shape',
      data: { shape: 'triangle', size: 32, color: '#DDA0DD' },
    })

    this.registerAsset({
      id: 'mask_soothing',
      type: 'shape',
      data: { shape: 'circle', size: 32, color: '#F0E68C' },
    })

    this.registerAsset({
      id: 'mask_detoxifying',
      type: 'shape',
      data: { shape: 'hexagon', size: 32, color: '#FFA07A' },
    })
  }

  public registerAsset(config: AssetConfig) {
    this.assets.set(config.id, config)
  }

  public getAsset(id: string): AssetConfig | undefined {
    return this.assets.get(id)
  }

  public isLoaded(id: string): boolean {
    return this.loadedAssets.has(id)
  }

  public loadAsset(id: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const asset = this.assets.get(id)
      if (!asset) {
        reject(new Error(`Asset not found: ${id}`))
        return
      }

      if (this.loadedAssets.has(id)) {
        resolve(this.loadedAssets.get(id))
        return
      }

      if (asset.type === 'shape') {
        // For shapes, we don't need to load anything external
        this.loadedAssets.set(id, asset.data)
        resolve(asset.data)
      } else if (asset.type === 'image' && asset.path) {
        // For images, we would use Kaplay's loadSprite
        // This is a placeholder for future image loading
        loadSprite(id, asset.path)
        this.loadedAssets.set(id, asset.path)
        resolve(asset.path)
      } else {
        reject(new Error(`Unsupported asset type or missing path: ${id}`))
      }
    })
  }

  public async loadAllAssets(): Promise<void> {
    const loadPromises = Array.from(this.assets.keys()).map((id) =>
      this.loadAsset(id),
    )

    try {
      await Promise.all(loadPromises)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load assets:', error)
      throw error
    }
  }

  public createShapeVisual(assetId: string, pos: Vec2, size?: number) {
    const asset = this.assets.get(assetId)
    if (!asset || asset.type !== 'shape' || !asset.data) {
      return null
    }

    const data = asset.data
    const actualSize = size || data.size || 32

    switch (data.shape) {
      case 'circle':
        return [circle(actualSize), color(data.color || '#FFFFFF'), pos]
      case 'rect':
        return [
          rect(actualSize, actualSize),
          color(data.color || '#FFFFFF'),
          pos,
        ]
      case 'triangle': {
        const trianglePoints = [
          vec2(0, -actualSize),
          vec2(-actualSize, actualSize),
          vec2(actualSize, actualSize),
        ]
        return [polygon(trianglePoints), color(data.color || '#FFFFFF'), pos]
      }
      case 'hexagon': {
        const hexPoints = []
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI * 2 * i) / 6
          hexPoints.push(
            vec2(Math.cos(angle) * actualSize, Math.sin(angle) * actualSize),
          )
        }
        return [polygon(hexPoints), color(data.color || '#FFFFFF'), pos]
      }
      default:
        return [
          rect(actualSize, actualSize),
          color(data.color || '#FFFFFF'),
          pos,
        ]
    }
  }

  public getMaskAssets(): string[] {
    return Array.from(this.assets.keys()).filter((id) => id.startsWith('mask_'))
  }

  public swapToExternalImages(imagePaths: Record<string, string>) {
    // Method to swap from geometric shapes to external images
    for (const [assetId, imagePath] of Object.entries(imagePaths)) {
      const existingAsset = this.assets.get(assetId)
      if (existingAsset) {
        this.registerAsset({
          id: assetId,
          type: 'image',
          path: imagePath,
        })
        this.loadedAssets.delete(assetId) // Force reload with new asset
      }
    }
  }
}

// Global asset manager instance
let assetManager: AssetManager | null = null

export function initAssetManager() {
  if (!assetManager) {
    assetManager = new AssetManager()
  }
  return assetManager
}

export function getAssetManager(): AssetManager {
  if (!assetManager) {
    throw new Error(
      'Asset manager not initialized. Call initAssetManager() first.',
    )
  }
  return assetManager
}
