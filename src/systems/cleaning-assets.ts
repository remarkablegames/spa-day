/**
 * Cleaning Assets Management System
 *
 * Handles loading and management of cleaning-specific assets
 * including sprites and sounds for the face cleaning mechanic.
 */

export interface CleaningAssets {
  sprites: {
    character: string
    eraser: string
    dirtSpot: string
  }
  sounds: {
    clean: string
  }
}

export class CleaningAssetManager {
  private static instance: CleaningAssetManager
  private assets: CleaningAssets | null = null
  private isLoaded = false

  private constructor() {}

  public static getInstance(): CleaningAssetManager {
    if (!CleaningAssetManager.instance) {
      CleaningAssetManager.instance = new CleaningAssetManager()
    }
    return CleaningAssetManager.instance
  }

  /**
   * Load all cleaning assets
   */
  public async loadAssets(): Promise<void> {
    if (this.isLoaded) return

    // Define asset paths
    this.assets = {
      sprites: {
        character: 'sprites/character.png',
        eraser: 'sprites/eraser.png',
        dirtSpot: 'sprites/dirt-spot.png',
      },
      sounds: {
        clean: 'sounds/clean.mp3',
      },
    }

    // Load sprites
    const spriteKeys = Object.keys(this.assets.sprites)
    for (let i = 0; i < spriteKeys.length; i++) {
      try {
        // Asset loading will be implemented when integrated with scene
        // TODO: Load sprite using Kaplay.js loadSprite
      } catch {
        // TODO: Handle sprite loading error
      }
    }

    // Load sounds
    const soundKeys = Object.keys(this.assets.sounds)
    for (let i = 0; i < soundKeys.length; i++) {
      try {
        // Asset loading will be implemented when integrated with scene
        // TODO: Load sound using Kaplay.js loadSound
      } catch {
        // TODO: Handle sound loading error
      }
    }

    this.isLoaded = true
  }

  /**
   * Get loaded assets
   */
  public getAssets(): CleaningAssets | null {
    return this.assets
  }

  /**
   * Check if assets are loaded
   */
  public areAssetsLoaded(): boolean {
    return this.isLoaded
  }

  /**
   * Get sprite path
   */
  public getSpritePath(
    spriteName: keyof CleaningAssets['sprites'],
  ): string | null {
    return this.assets?.sprites[spriteName] || null
  }

  /**
   * Get sound path
   */
  public getSoundPath(
    soundName: keyof CleaningAssets['sounds'],
  ): string | null {
    return this.assets?.sounds[soundName] || null
  }

  /**
   * Reset asset manager
   */
  public reset(): void {
    this.assets = null
    this.isLoaded = false
  }
}
