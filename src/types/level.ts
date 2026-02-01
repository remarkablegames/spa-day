/**
 * Level system TypeScript interfaces
 * Feature: Game Levels with Shop Inventory
 */

/**
 * Core Level entity
 */
export interface Level {
  id: string
  name: string
  number: number
  isUnlocked: boolean
  customerTemplate: CustomerTemplate
  config: LevelConfig
  unlockCriteria: UnlockCriteria
}

/**
 * Level configuration parameters
 */
export interface LevelConfig {
  timeLimit: number // seconds
  satisfactionThreshold: number // 0-100
  scoreThreshold: number
  availableMaskTypes: string[]
  scoreMultiplier: number
  difficultyMultiplier: number
}

/**
 * Customer template for level-specific characters
 */
export interface CustomerTemplate {
  id: string
  name: string
  preferredMaskTypes: string[]
  satisfactionDecayRate: number
  personalityTraits: string[]
  appearanceConfig: AppearanceConfig
}

/**
 * Visual appearance configuration
 */
export interface AppearanceConfig {
  baseColor: string
  eyeStyle: string
  expressionType: string
}

/**
 * Criteria for unlocking a level
 */
export interface UnlockCriteria {
  requiredScore: number
  requiredSatisfaction: number
  previousLevelRequired: string
  optionalChallenges: Challenge[]
}

/**
 * Optional challenge for bonus rewards
 */
export interface Challenge {
  id: string
  name: string
  description: string
  rewardType: 'currency' | 'unlock' | 'upgrade'
  rewardValue: number | string
}

/**
 * Player's overall level progress
 */
export interface LevelProgress {
  currentLevel: number
  unlockedLevels: string[]
  completedLevels: CompletedLevel[]
  bestScores: Record<string, number>
  totalCurrency: number
}

/**
 * Record of a completed level
 */
export interface CompletedLevel {
  levelId: string
  completionDate: Date
  score: number
  satisfaction: number
  currencyEarned: number
  challengesCompleted: string[]
}

/**
 * Shop inventory containing all purchasable items
 */
export interface ShopInventory {
  items: ShopItem[]
  upgrades: ShopUpgrade[]
  featuredItems: string[]
}

/**
 * Individual shop item
 */
export interface ShopItem {
  id: string
  name: string
  type: 'mask' | 'tool' | 'cosmetic'
  basePrice: number
  description: string
  requirements: string[]
  isPurchased: boolean
}

/**
 * Upgrade for shop items
 */
export interface ShopUpgrade {
  id: string
  targetItemId: string
  level: number
  price: number
  effects: UpgradeEffect[]
  requirements: string[]
}

/**
 * Effect applied by an upgrade
 */
export interface UpgradeEffect {
  type: 'score_multiplier' | 'satisfaction_boost' | 'time_bonus'
  value: number
  description: string
}

/**
 * Player's inventory of owned items
 */
export interface PlayerInventory {
  ownedItems: InventoryItem[]
  currency: number
  lastUpdated: Date
}

/**
 * Individual item in player inventory
 */
export interface InventoryItem {
  itemId: string
  purchaseDate: Date
  upgradeLevel: number
  usesRemaining?: number
}

/**
 * Economy system configuration
 */
export interface Economy {
  conversionRate: number // 1:1 score to currency
  priceMultiplier: number
  upgradeCostBase: number
  dailyBonusAvailable: boolean
}

/**
 * Financial transaction record
 */
export interface Transaction {
  id: string
  type: 'purchase' | 'earn' | 'refund'
  amount: number
  itemId?: string
  timestamp: Date
  balance: number
}

/**
 * Result of a purchase attempt
 */
export interface PurchaseResult {
  success: boolean
  error?: string
  transaction?: Transaction
  updatedInventory?: PlayerInventory
}

/**
 * Validation result for purchases
 */
export interface ValidationResult {
  isValid: boolean
  error?: string
  missingRequirements?: string[]
}

/**
 * Result of level completion
 */
export interface LevelCompletionResult {
  levelId: string
  success: boolean
  score: number
  satisfaction: number
  timeUsed: number
  currencyEarned: number
  nextLevelUnlocked: boolean
  challengesCompleted: string[]
}

/**
 * Results from a treatment session
 */
export interface TreatmentResults {
  score: number
  satisfaction: number
  timeUsed: number
  masksApplied: string[]
  customerFeedback: string
}

/**
 * Level error types
 */
export enum LevelError {
  INVALID_LEVEL = 'INVALID_LEVEL',
  LEVEL_LOCKED = 'LEVEL_LOCKED',
  CORRUPTED_SAVE = 'CORRUPTED_SAVE',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
}

/**
 * Shop error types
 */
export enum ShopError {
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  ITEM_NOT_FOUND = 'ITEM_NOT_FOUND',
  ALREADY_OWNED = 'ALREADY_OWNED',
  REQUIREMENTS_NOT_MET = 'REQUIREMENTS_NOT_MET',
}

/**
 * Economy error types
 */
export enum EconomyError {
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  NEGATIVE_BALANCE = 'NEGATIVE_BALANCE',
  CONVERSION_ERROR = 'CONVERSION_ERROR',
}

/**
 * Storage keys for localStorage
 */
export const STORAGE_KEYS = {
  LEVEL_PROGRESS: 'spa-day-level-progress',
  PLAYER_INVENTORY: 'spa-day-player-inventory',
  SHOP_INVENTORY: 'spa-day-shop-inventory',
  ECONOMY_DATA: 'spa-day-economy-data',
  SETTINGS: 'spa-day-game-settings',
} as const

/**
 * Performance targets
 */
export interface PerformanceTargets {
  levelLoadTime: number // < 500ms
  shopLoadTime: number // < 300ms
  saveOperationTime: number // < 100ms
  loadOperationTime: number // < 200ms
  transactionProcessTime: number // < 50ms
}

/**
 * Memory constraints
 */
export interface MemoryConstraints {
  maxLevelDataSize: number // < 1MB
  maxShopDataSize: number // < 500KB
  maxSaveDataSize: number // < 100KB
  maxCacheSize: number // < 5MB
}
