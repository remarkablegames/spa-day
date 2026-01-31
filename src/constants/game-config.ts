export const GAME_CONFIG = {
  // Performance targets
  TARGET_FPS: 60,
  MAX_FRAME_TIME: 16.67, // milliseconds
  MEMORY_LIMIT: 100, // MB
  ASSET_LOAD_TIME: 3000, // milliseconds

  // Screen dimensions
  SCREEN_WIDTH: 800,
  SCREEN_HEIGHT: 600,
  MOBILE_WIDTH: 375,
  MOBILE_HEIGHT: 667,

  // Touch controls
  MIN_TOUCH_TARGET_SIZE: 44, // pixels
  DRAG_THRESHOLD: 10, // pixels before drag starts

  // Game mechanics
  TREATMENT_DURATION_MIN: 10, // seconds
  TREATMENT_DURATION_MAX: 300, // seconds
  DEFAULT_TREATMENT_DURATION: 30, // seconds

  // Scoring
  BASE_MASK_SCORE: 100,
  COMBO_MULTIPLIER: 1.5,
  PERFECT_TIMING_BONUS: 50,
  SATISFACTION_BONUS_MULTIPLIER: 1.2,

  // Character properties
  CHARACTER_SIZE: 64,
  FACE_AREA_COUNT: 5,
  SATISFACTION_MIN: 0,
  SATISFACTION_MAX: 100,

  // Mask properties
  MASK_SIZE: 32,
  MASK_TYPES_COUNT: 5,
  UNLOCK_THRESHOLD_SCORE: 1000,
  UNLOCK_THRESHOLD_TREATMENTS: 10,

  // Visual effects
  PARTICLE_COUNT: 20,
  EFFECT_DURATION: 1000, // milliseconds
  FADE_DURATION: 500, // milliseconds

  // Audio
  MASTER_VOLUME_DEFAULT: 0.8,
  SFX_VOLUME_DEFAULT: 0.7,
  MUSIC_VOLUME_DEFAULT: 0.5,

  // Storage
  STORAGE_KEYS: {
    PLAYER_PROGRESS: 'spa-day-player-progress',
    UNLOCKED_MASKS: 'spa-day-unlocked-masks',
    TREATMENT_HISTORY: 'spa-day-treatment-history',
    GAME_SETTINGS: 'spa-day-game-settings',
    HIGH_SCORE: 'spa-day-high-score',
  },

  // Game states
  SCENES: {
    PRELOAD: 'preload',
    MENU: 'menu',
    GAME: 'game',
    COLLECTION: 'collection',
    RESULTS: 'results',
    SETTINGS: 'settings',
  },

  // Asset paths
  ASSET_PATHS: {
    SPRITES: 'sprites/',
    SOUNDS: 'sounds/',
    MUSIC: 'music/',
  },

  // Animation timings
  ANIMATION_DURATION: {
    QUICK: 200,
    NORMAL: 500,
    SLOW: 1000,
  },

  // Colors (for geometric shapes MVP)
  COLORS: {
    CHARACTER: '#FFB6C1', // Light pink
    BACKGROUND: '#F0F8FF', // Alice blue
    UI_BACKGROUND: '#FFFFFF',
    UI_TEXT: '#333333',
    UI_ACCENT: '#87CEEB', // Sky blue
    UI_BUTTON: '#4A90E2', // Blue
    UI_PANEL: '#F8F9FA', // Light gray
    SATISFACTION_HIGH: '#90EE90', // Light green
    SATISFACTION_LOW: '#FFB6C1', // Light red
    MASK_HYDRATING: '#87CEEB', // Sky blue
    MASK_CLARIFYING: '#98FB98', // Pale green
    MASK_ANTI_AGING: '#DDA0DD', // Plum
    MASK_SOOTHING: '#F0E68C', // Khaki
    MASK_DETOXIFYING: '#FFA07A', // Light salmon
  },

  // Face areas
  FACE_AREAS: {
    FOREHEAD: 'forehead',
    LEFT_CHEEK: 'left_cheek',
    RIGHT_CHEEK: 'right_cheek',
    CHIN: 'chin',
    NOSE: 'nose',
  },

  // Mask types
  MASK_TYPES: {
    HYDRATING: 'hydrating',
    CLARIFYING: 'clarifying',
    ANTI_AGING: 'anti_aging',
    SOOTHING: 'soothing',
    DETOXIFYING: 'detoxifying',
  },

  // Debug
  DEBUG_MODE: false,
  SHOW_FPS: false,
  SHOW_TOUCH_POINTS: false,
} as const

export type GameConfig = typeof GAME_CONFIG

// Helper functions
export function getTouchTargetSize(): number {
  return GAME_CONFIG.MIN_TOUCH_TARGET_SIZE
}

export function getScreenSize(): { width: number; height: number } {
  return {
    width: GAME_CONFIG.SCREEN_WIDTH,
    height: GAME_CONFIG.SCREEN_HEIGHT,
  }
}

export function isMobile(): boolean {
  return (
    width() <= GAME_CONFIG.MOBILE_WIDTH || height() <= GAME_CONFIG.MOBILE_HEIGHT
  )
}

export function getScaledSize(baseSize: number): number {
  const scaleFactor = Math.min(
    width() / GAME_CONFIG.SCREEN_WIDTH,
    height() / GAME_CONFIG.SCREEN_HEIGHT,
  )
  return Math.floor(baseSize * scaleFactor)
}

export function clampValue(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * clampValue(t, 0, 1)
}
