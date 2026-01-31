# API Contracts: Game Levels System

**Date**: 2026-01-31  
**Format**: Internal System Contracts (TypeScript Interfaces)

## Level Management System

### LevelManager

```typescript
interface ILevelManager {
  getCurrentLevel(): Level
  getNextLevel(): Level | null
  isLevelUnlocked(levelId: string): boolean
  unlockLevel(levelId: string): boolean
  validateLevelCompletion(
    score: number,
    satisfaction: number,
    timeUsed: number,
  ): boolean
  getLevelProgress(): LevelProgress
  saveProgress(): void
  loadProgress(): LevelProgress
}
```

### Level Events

```typescript
interface LevelEvents {
  'level-started': (level: Level) => void
  'level-completed': (result: LevelCompletionResult) => void
  'level-unlocked': (levelId: string) => void
  'progress-saved': (progress: LevelProgress) => void
}
```

## Shop System

### ShopManager

```typescript
interface IShopManager {
  getShopInventory(): ShopInventory
  purchaseItem(itemId: string): PurchaseResult
  purchaseUpgrade(itemId: string, upgradeLevel: number): PurchaseResult
  canAfford(price: number): boolean
  getPlayerInventory(): PlayerInventory
  validatePurchase(itemId: string): ValidationResult
}
```

### Shop Events

```typescript
interface ShopEvents {
  'item-purchased': (item: ShopItem, cost: number) => void
  'upgrade-purchased': (upgrade: ShopUpgrade, cost: number) => void
  'insufficient-funds': (
    itemId: string,
    required: number,
    available: number,
  ) => void
  'inventory-updated': (inventory: PlayerInventory) => void
}
```

## Economy System

### EconomyManager

```typescript
interface IEconomyManager {
  convertScoreToCurrency(score: number): number
  addCurrency(amount: number): void
  spendCurrency(amount: number): boolean
  getCurrencyBalance(): number
  getConversionRate(): number
  recordTransaction(transaction: Transaction): void
}
```

### Economy Events

```typescript
interface EconomyEvents {
  'currency-earned': (amount: number, source: string) => void
  'currency-spent': (amount: number, item: string) => void
  'balance-updated': (newBalance: number) => void
  'transaction-recorded': (transaction: Transaction) => void
}
```

## Scene Integration

### Scene Contracts

```typescript
interface LevelSelectScene {
  loadLevels(): void
  selectLevel(levelId: string): void
  startLevel(levelId: string): void
  showLevelInfo(levelId: string): void
}

interface ShopScene {
  loadShopInventory(): void
  selectItem(itemId: string): void
  purchaseItem(): void
  goBack(): void
}

interface GameScene {
  loadLevel(levelId: string): void
  startTreatment(): void
  completeTreatment(results: TreatmentResults): void
  goToShop(): void
}
```

## Data Persistence

### StorageManager

```typescript
interface IStorageManager {
  save<T>(key: string, data: T): void
  load<T>(key: string): T | null
  remove(key: string): void
  clear(): void
  exists(key: string): boolean
  getKeys(): string[]
}
```

### Storage Keys

```typescript
const STORAGE_KEYS = {
  LEVEL_PROGRESS: 'spa-day-level-progress',
  PLAYER_INVENTORY: 'spa-day-player-inventory',
  SHOP_INVENTORY: 'spa-day-shop-inventory',
  ECONOMY_DATA: 'spa-day-economy-data',
  SETTINGS: 'spa-day-game-settings',
} as const
```

## Result Types

### PurchaseResult

```typescript
interface PurchaseResult {
  success: boolean
  error?: string
  transaction?: Transaction
  updatedInventory?: PlayerInventory
}
```

### ValidationResult

```typescript
interface ValidationResult {
  isValid: boolean
  error?: string
  missingRequirements?: string[]
}
```

### LevelCompletionResult

```typescript
interface LevelCompletionResult {
  levelId: string
  success: boolean
  score: number
  satisfaction: number
  timeUsed: number
  currencyEarned: number
  nextLevelUnlocked: boolean
  challengesCompleted: string[]
}
```

### TreatmentResults

```typescript
interface TreatmentResults {
  score: number
  satisfaction: number
  timeUsed: number
  masksApplied: string[]
  customerFeedback: string
}
```

## Error Handling

### Error Types

```typescript
enum LevelError {
  INVALID_LEVEL = 'INVALID_LEVEL',
  LEVEL_LOCKED = 'LEVEL_LOCKED',
  CORRUPTED_SAVE = 'CORRUPTED_SAVE',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
}

enum ShopError {
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  ITEM_NOT_FOUND = 'ITEM_NOT_FOUND',
  ALREADY_OWNED = 'ALREADY_OWNED',
  REQUIREMENTS_NOT_MET = 'REQUIREMENTS_NOT_MET',
}

enum EconomyError {
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  NEGATIVE_BALANCE = 'NEGATIVE_BALANCE',
  CONVERSION_ERROR = 'CONVERSION_ERROR',
}
```

## Integration Points

### Game State Integration

```typescript
interface GameStateIntegration {
  onTreatmentComplete(results: TreatmentResults): void
  onLevelStart(levelId: string): void
  onShopEnter(): void
  onShopExit(): void
}
```

### Character System Integration

```typescript
interface CharacterIntegration {
  loadCustomerTemplate(template: CustomerTemplate): void
  applyLevelDifficulty(multiplier: number): void
  getSatisfactionLevel(): number
}
```

## Performance Contracts

### Performance Targets

```typescript
interface PerformanceTargets {
  levelLoadTime: number // < 500ms
  shopLoadTime: number // < 300ms
  saveOperationTime: number // < 100ms
  loadOperationTime: number // < 200ms
  transactionProcessTime: number // < 50ms
}
```

### Memory Constraints

```typescript
interface MemoryConstraints {
  maxLevelDataSize: number // < 1MB
  maxShopDataSize: number // < 500KB
  maxSaveDataSize: number // < 100KB
  maxCacheSize: number // < 5MB
}
```
