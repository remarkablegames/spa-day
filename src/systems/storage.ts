import { GAME_CONFIG } from '../constants/game-config'
import type { LevelProgress, PlayerInventory } from '../types/level'

export interface PlayerProgress {
  totalScore: number
  completedTreatments: number
  unlockedMasks: string[]
  achievements: string[]
  currentLevel: number
  highScore: number
}

export interface TreatmentHistory {
  sessionId: string
  timestamp: number
  score: number
  satisfaction: number
  masksUsed: string[]
  duration: number
}

export interface GameSettings {
  soundEnabled: boolean
  musicVolume: number
  effectsVolume: number
  visualEffects: boolean
  masterVolume: number
}

export class StorageManager {
  private static instance: StorageManager

  private constructor() {}

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager()
    }
    return StorageManager.instance
  }

  private isAvailable(): boolean {
    try {
      const testKey = '__storage_test__'
      setData(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch {
      return false
    }
  }

  private getStorage(): Storage | null {
    if (!this.isAvailable()) {
      return null
    }
    return localStorage
  }

  public savePlayerProgress(progress: PlayerProgress): boolean {
    const storage = this.getStorage()
    if (!storage) return false

    try {
      setData(GAME_CONFIG.STORAGE_KEYS.PLAYER_PROGRESS, progress)
      return true
    } catch {
      return false
    }
  }

  public loadPlayerProgress(): PlayerProgress | null {
    const storage = this.getStorage()
    if (!storage) return null

    try {
      const data = getData(GAME_CONFIG.STORAGE_KEYS.PLAYER_PROGRESS)
      return data && typeof data === 'object' ? (data as PlayerProgress) : null
    } catch {
      return null
    }
  }

  public saveUnlockedMasks(maskIds: string[]): boolean {
    const storage = this.getStorage()
    if (!storage) return false

    try {
      setData(GAME_CONFIG.STORAGE_KEYS.UNLOCKED_MASKS, maskIds)
      return true
    } catch {
      return false
    }
  }

  public loadUnlockedMasks(): string[] {
    const storage = this.getStorage()
    if (!storage) return []

    try {
      const data = getData(GAME_CONFIG.STORAGE_KEYS.UNLOCKED_MASKS)
      return data && Array.isArray(data) ? (data as string[]) : []
    } catch {
      return []
    }
  }

  public saveTreatmentHistory(history: TreatmentHistory[]): boolean {
    const storage = this.getStorage()
    if (!storage) return false

    try {
      // Keep only the last 50 treatments to avoid storage bloat
      const limitedHistory = history.slice(-50)
      setData(GAME_CONFIG.STORAGE_KEYS.TREATMENT_HISTORY, limitedHistory)
      return true
    } catch {
      return false
    }
  }

  public loadTreatmentHistory(): TreatmentHistory[] {
    const storage = this.getStorage()
    if (!storage) return []

    try {
      const data = getData(GAME_CONFIG.STORAGE_KEYS.TREATMENT_HISTORY)
      return data && Array.isArray(data) ? (data as TreatmentHistory[]) : []
    } catch {
      return []
    }
  }

  public addTreatmentToHistory(treatment: TreatmentHistory): boolean {
    const history = this.loadTreatmentHistory()
    history.push(treatment)
    return this.saveTreatmentHistory(history)
  }

  public saveGameSettings(settings: GameSettings): boolean {
    const storage = this.getStorage()
    if (!storage) return false

    try {
      setData(GAME_CONFIG.STORAGE_KEYS.GAME_SETTINGS, settings)
      return true
    } catch {
      return false
    }
  }

  public loadGameSettings(): GameSettings {
    const storage = this.getStorage()
    if (!storage) return this.getDefaultSettings()

    try {
      const data = getData(GAME_CONFIG.STORAGE_KEYS.GAME_SETTINGS)
      return data && typeof data === 'object'
        ? {
            ...this.getDefaultSettings(),
            ...(data as GameSettings),
          }
        : this.getDefaultSettings()
    } catch {
      return this.getDefaultSettings()
    }
  }

  public saveHighScore(score: number): boolean {
    const storage = this.getStorage()
    if (!storage) return false

    try {
      setData(GAME_CONFIG.STORAGE_KEYS.HIGH_SCORE, score)
      return true
    } catch {
      return false
    }
  }

  public loadHighScore(): number {
    const storage = this.getStorage()
    if (!storage) return 0

    try {
      const data = getData(GAME_CONFIG.STORAGE_KEYS.HIGH_SCORE)
      return typeof data === 'number' ? data : 0
    } catch {
      return 0
    }
  }

  public clearAllData(): boolean {
    const storage = this.getStorage()
    if (!storage) return false

    try {
      Object.values(GAME_CONFIG.STORAGE_KEYS).forEach((key) => {
        storage.removeItem(key)
      })
      return true
    } catch {
      return false
    }
  }

  public exportData(): string {
    const data = {
      playerProgress: this.loadPlayerProgress(),
      unlockedMasks: this.loadUnlockedMasks(),
      treatmentHistory: this.loadTreatmentHistory(),
      gameSettings: this.loadGameSettings(),
      highScore: this.loadHighScore(),
    }
    return JSON.stringify(data)
  }

  public importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)

      if (data.playerProgress) {
        this.savePlayerProgress(data.playerProgress)
      }
      if (data.unlockedMasks) {
        this.saveUnlockedMasks(data.unlockedMasks)
      }
      if (data.treatmentHistory) {
        this.saveTreatmentHistory(data.treatmentHistory)
      }
      if (data.gameSettings) {
        this.saveGameSettings(data.gameSettings)
      }
      if (typeof data.highScore === 'number') {
        this.saveHighScore(data.highScore)
      }

      return true
    } catch {
      return false
    }
  }

  private getDefaultSettings(): GameSettings {
    return {
      soundEnabled: true,
      musicVolume: GAME_CONFIG.MUSIC_VOLUME_DEFAULT,
      effectsVolume: GAME_CONFIG.SFX_VOLUME_DEFAULT,
      visualEffects: true,
      masterVolume: GAME_CONFIG.MASTER_VOLUME_DEFAULT,
    }
  }

  public getStorageSize(): number {
    const storage = this.getStorage()
    if (!storage) return 0

    let totalSize = 0
    for (const key in storage) {
      if (Object.prototype.hasOwnProperty.call(storage, key)) {
        totalSize += storage[key].length + key.length
      }
    }
    return totalSize
  }

  // Level System Storage Methods (T004)
  public saveLevelProgress(progress: LevelProgress): boolean {
    const storage = this.getStorage()
    if (!storage) return false

    try {
      setData(GAME_CONFIG.STORAGE_KEYS.LEVEL_PROGRESS, progress)
      return true
    } catch {
      return false
    }
  }

  public loadLevelProgress(): LevelProgress | null {
    const storage = this.getStorage()
    if (!storage) return null

    try {
      const data = getData(GAME_CONFIG.STORAGE_KEYS.LEVEL_PROGRESS)
      if (!data || typeof data !== 'object') return null

      // Validate and sanitize loaded data
      const progress = data as LevelProgress
      return {
        currentLevel: progress.currentLevel ?? 1,
        unlockedLevels: Array.isArray(progress.unlockedLevels)
          ? progress.unlockedLevels
          : ['1'],
        completedLevels: Array.isArray(progress.completedLevels)
          ? progress.completedLevels
          : [],
        bestScores:
          typeof progress.bestScores === 'object' ? progress.bestScores : {},
        totalCurrency:
          typeof progress.totalCurrency === 'number'
            ? progress.totalCurrency
            : 0,
      }
    } catch {
      return null
    }
  }

  public savePlayerInventory(inventory: PlayerInventory): boolean {
    const storage = this.getStorage()
    if (!storage) return false

    try {
      setData(GAME_CONFIG.STORAGE_KEYS.PLAYER_INVENTORY, inventory)
      return true
    } catch {
      return false
    }
  }

  public loadPlayerInventory(): PlayerInventory {
    const storage = this.getStorage()
    if (!storage) return this.getDefaultPlayerInventory()

    try {
      const data = getData(GAME_CONFIG.STORAGE_KEYS.PLAYER_INVENTORY)
      if (!data || typeof data !== 'object')
        return this.getDefaultPlayerInventory()

      const inventory = data as PlayerInventory
      return {
        ownedItems: Array.isArray(inventory.ownedItems)
          ? inventory.ownedItems
          : [],
        currency:
          typeof inventory.currency === 'number' ? inventory.currency : 0,
        lastUpdated: inventory.lastUpdated
          ? new Date(inventory.lastUpdated)
          : new Date(),
      }
    } catch {
      return this.getDefaultPlayerInventory()
    }
  }

  private getDefaultPlayerInventory(): PlayerInventory {
    return {
      ownedItems: [],
      currency: 0,
      lastUpdated: new Date(),
    }
  }

  public validateStoredData(): boolean {
    try {
      const progress = this.loadLevelProgress()
      const inventory = this.loadPlayerInventory()
      return progress !== null && inventory !== null
    } catch {
      return false
    }
  }

  public clearLevelData(): boolean {
    const storage = this.getStorage()
    if (!storage) return false

    try {
      storage.removeItem(GAME_CONFIG.STORAGE_KEYS.LEVEL_PROGRESS)
      storage.removeItem(GAME_CONFIG.STORAGE_KEYS.PLAYER_INVENTORY)
      storage.removeItem(GAME_CONFIG.STORAGE_KEYS.SHOP_INVENTORY)
      storage.removeItem(GAME_CONFIG.STORAGE_KEYS.ECONOMY_DATA)
      return true
    } catch {
      return false
    }
  }
}

// Global storage manager instance
export const storageManager = StorageManager.getInstance()

// Convenience functions
export function savePlayerProgress(progress: PlayerProgress): boolean {
  return storageManager.savePlayerProgress(progress)
}

export function loadPlayerProgress(): PlayerProgress | null {
  return storageManager.loadPlayerProgress()
}

export function saveGameSettings(settings: GameSettings): boolean {
  return storageManager.saveGameSettings(settings)
}

export function loadGameSettings(): GameSettings {
  return storageManager.loadGameSettings()
}

export function saveHighScore(score: number): boolean {
  return storageManager.saveHighScore(score)
}

export function loadHighScore(): number {
  return storageManager.loadHighScore()
}
