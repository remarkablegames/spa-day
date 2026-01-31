import { GAME_CONFIG } from '../constants/game-config'

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
      localStorage.setItem(testKey, 'test')
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
      storage.setItem(
        GAME_CONFIG.STORAGE_KEYS.PLAYER_PROGRESS,
        JSON.stringify(progress),
      )
      return true
    } catch {
      return false
    }
  }

  public loadPlayerProgress(): PlayerProgress | null {
    const storage = this.getStorage()
    if (!storage) return null

    try {
      const data = storage.getItem(GAME_CONFIG.STORAGE_KEYS.PLAYER_PROGRESS)
      return data ? (JSON.parse(data) as PlayerProgress) : null
    } catch {
      return null
    }
  }

  public saveUnlockedMasks(maskIds: string[]): boolean {
    const storage = this.getStorage()
    if (!storage) return false

    try {
      storage.setItem(
        GAME_CONFIG.STORAGE_KEYS.UNLOCKED_MASKS,
        JSON.stringify(maskIds),
      )
      return true
    } catch {
      return false
    }
  }

  public loadUnlockedMasks(): string[] {
    const storage = this.getStorage()
    if (!storage) return []

    try {
      const data = storage.getItem(GAME_CONFIG.STORAGE_KEYS.UNLOCKED_MASKS)
      return data ? (JSON.parse(data) as string[]) : []
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
      storage.setItem(
        GAME_CONFIG.STORAGE_KEYS.TREATMENT_HISTORY,
        JSON.stringify(limitedHistory),
      )
      return true
    } catch {
      return false
    }
  }

  public loadTreatmentHistory(): TreatmentHistory[] {
    const storage = this.getStorage()
    if (!storage) return []

    try {
      const data = storage.getItem(GAME_CONFIG.STORAGE_KEYS.TREATMENT_HISTORY)
      return data ? (JSON.parse(data) as TreatmentHistory[]) : []
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
      storage.setItem(
        GAME_CONFIG.STORAGE_KEYS.GAME_SETTINGS,
        JSON.stringify(settings),
      )
      return true
    } catch {
      return false
    }
  }

  public loadGameSettings(): GameSettings {
    const storage = this.getStorage()
    if (!storage) return this.getDefaultSettings()

    try {
      const data = storage.getItem(GAME_CONFIG.STORAGE_KEYS.GAME_SETTINGS)
      return data
        ? {
            ...this.getDefaultSettings(),
            ...(JSON.parse(data) as GameSettings),
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
      storage.setItem(GAME_CONFIG.STORAGE_KEYS.HIGH_SCORE, score.toString())
      return true
    } catch {
      return false
    }
  }

  public loadHighScore(): number {
    const storage = this.getStorage()
    if (!storage) return 0

    try {
      const data = storage.getItem(GAME_CONFIG.STORAGE_KEYS.HIGH_SCORE)
      return data ? parseInt(data, 10) : 0
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
