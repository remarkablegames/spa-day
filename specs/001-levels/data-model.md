# Data Model: Game Levels

**Date**: 2026-01-31  
**Feature**: Game Levels with Shop Inventory

## Core Entities

### Level

```typescript
interface Level {
  id: string
  name: string
  number: number
  isUnlocked: boolean
  customerTemplate: CustomerTemplate
  config: LevelConfig
  unlockCriteria: UnlockCriteria
}
```

### LevelConfig

```typescript
interface LevelConfig {
  timeLimit: number // seconds
  satisfactionThreshold: number // 0-100
  scoreThreshold: number
  availableMaskTypes: string[]
  scoreMultiplier: number
  difficultyMultiplier: number
}
```

### CustomerTemplate

```typescript
interface CustomerTemplate {
  id: string
  name: string
  preferredMaskTypes: string[]
  satisfactionDecayRate: number
  personalityTraits: string[]
  appearanceConfig: AppearanceConfig
}
```

### AppearanceConfig

```typescript
interface AppearanceConfig {
  baseColor: string
  eyeStyle: string
  expressionType: string
}
```

### UnlockCriteria

```typescript
interface UnlockCriteria {
  requiredScore: number
  requiredSatisfaction: number
  previousLevelRequired: string
  optionalChallenges: Challenge[]
}
```

### Challenge

```typescript
interface Challenge {
  id: string
  name: string
  description: string
  rewardType: 'currency' | 'unlock' | 'upgrade'
  rewardValue: number | string
}
```

## Progress Tracking

### LevelProgress

```typescript
interface LevelProgress {
  currentLevel: number
  unlockedLevels: string[]
  completedLevels: CompletedLevel[]
  bestScores: Record<string, number>
  totalCurrency: number
}
```

### CompletedLevel

```typescript
interface CompletedLevel {
  levelId: string
  completionDate: Date
  score: number
  satisfaction: number
  currencyEarned: number
  challengesCompleted: string[]
}
```

## Shop System

### ShopInventory

```typescript
interface ShopInventory {
  items: ShopItem[]
  upgrades: ShopUpgrade[]
  featuredItems: string[]
}
```

### ShopItem

```typescript
interface ShopItem {
  id: string
  name: string
  type: 'mask' | 'tool' | 'cosmetic'
  basePrice: number
  description: string
  requirements: string[]
  isPurchased: boolean
}
```

### ShopUpgrade

```typescript
interface ShopUpgrade {
  id: string
  targetItemId: string
  level: number
  price: number
  effects: UpgradeEffect[]
  requirements: string[]
}
```

### UpgradeEffect

```typescript
interface UpgradeEffect {
  type: 'score_multiplier' | 'satisfaction_boost' | 'time_bonus'
  value: number
  description: string
}
```

### PlayerInventory

```typescript
interface PlayerInventory {
  ownedItems: InventoryItem[]
  currency: number
  lastUpdated: Date
}
```

### InventoryItem

```typescript
interface InventoryItem {
  itemId: string
  purchaseDate: Date
  upgradeLevel: number
  usesRemaining?: number
}
```

## Economy System

### Economy

```typescript
interface Economy {
  conversionRate: number // 1:1 score to currency
  priceMultiplier: number
  upgradeCostBase: number
  dailyBonusAvailable: boolean
}
```

### Transaction

```typescript
interface Transaction {
  id: string
  type: 'purchase' | 'earn' | 'refund'
  amount: number
  itemId?: string
  timestamp: Date
  balance: number
}
```

## Validation Rules

### Level Completion

- Score >= LevelConfig.scoreThreshold
- Satisfaction >= LevelConfig.satisfactionThreshold
- Time <= LevelConfig.timeLimit

### Shop Purchases

- PlayerInventory.currency >= ShopItem.basePrice
- All ShopItem.requirements met
- Item not already purchased (unless upgrade)

### Progress Persistence

- All data serializable to JSON
- localStorage size < 5MB
- Critical data validation on load

## State Transitions

### Level Progression

```
Level Start → Playing → Complete → Shop Access → Next Level
     ↓           ↓        ↓          ↓           ↓
   Load       Update   Validate   Purchase    Initialize
```

### Shop Transaction

```
Browse Items → Select Item → Validate Funds → Process Purchase → Update Inventory
```

## Data Relationships

- Level 1..1 CustomerTemplate
- Level 1..1 LevelConfig
- Level 1..1 UnlockCriteria
- LevelProgress N..N CompletedLevel
- ShopInventory N..N ShopItem
- PlayerInventory N..N InventoryItem
- ShopUpgrade N..1 ShopItem

## Performance Considerations

- Level configurations loaded once at startup
- Shop data cached after first load
- Progress data debounced to prevent excessive localStorage writes
- Large datasets paginated or lazy loaded
