# Quickstart Guide: Game Levels Implementation

**Date**: 2026-01-31  
**Feature**: Game Levels with Shop Inventory

## Overview

This guide provides the essential steps to implement the levels feature for Spa Day game. The implementation adds progressive difficulty, shop inventory system, and level progression mechanics while maintaining existing gameplay.

## Prerequisites

- Existing Spa Day codebase with Kaplay.js setup
- TypeScript strict mode enabled
- Understanding of current scene management and character system

## Implementation Steps

### 1. Create Level Configuration System

**File**: `src/constants/level-config.ts`

```typescript
export const LEVEL_CONFIGS = {
  1: {
    timeLimit: 45,
    satisfactionThreshold: 60,
    scoreThreshold: 300,
    availableMaskTypes: ['hydrating', 'soothing'],
    scoreMultiplier: 1.0,
    difficultyMultiplier: 1.0,
  },
  2: {
    timeLimit: 40,
    satisfactionThreshold: 65,
    scoreThreshold: 400,
    availableMaskTypes: ['hydrating', 'soothing', 'clarifying'],
    scoreMultiplier: 1.2,
    difficultyMultiplier: 1.1,
  },
  // ... more levels
}
```

### 2. Implement Level Manager

**File**: `src/systems/levelmanager.ts`

```typescript
export class LevelManager {
  private currentLevel: number = 1
  private progress: LevelProgress

  constructor() {
    this.loadProgress()
  }

  getCurrentLevel(): Level {
    return this.createLevel(this.currentLevel)
  }

  validateCompletion(score: number, satisfaction: number): boolean {
    const config = LEVEL_CONFIGS[this.currentLevel]
    return (
      score >= config.scoreThreshold &&
      satisfaction >= config.satisfactionThreshold
    )
  }

  // ... other methods
}
```

### 3. Create Shop System

**File**: `src/systems/shop.ts`

```typescript
export class ShopManager {
  private inventory: PlayerInventory
  private shopItems: ShopInventory

  purchaseItem(itemId: string): PurchaseResult {
    const item = this.shopItems.items.find((i) => i.id === itemId)
    if (!item) return { success: false, error: 'Item not found' }

    if (this.inventory.currency < item.basePrice) {
      return { success: false, error: 'Insufficient funds' }
    }

    // Process purchase
    this.inventory.currency -= item.basePrice
    this.inventory.ownedItems.push({
      itemId,
      purchaseDate: new Date(),
      upgradeLevel: 1,
    })

    return { success: true, transaction: this.createTransaction(item) }
  }
}
```

### 4. Add Level Selection Scene

**File**: `src/scenes/level-select.ts`

```typescript
export function createLevelSelectScene() {
  scene(Scene.LevelSelect, () => {
    const levelManager = getLevelManager()

    // Render level buttons
    const levels = [1, 2, 3, 4, 5]
    levels.forEach((levelNum) => {
      const isUnlocked = levelManager.isLevelUnlocked(levelNum.toString())

      const levelButton = add([
        rect(120, 80),
        pos(100 + (levelNum - 1) * 140, 200),
        color(isUnlocked ? Color.BLUE : Color.GRAY),
        area(),
      ])

      if (isUnlocked) {
        levelButton.onClick(() => {
          go(Scene.SpaGame, { levelId: levelNum.toString() })
        })
      }
    })
  })
}
```

### 5. Add Shop Scene

**File**: `src/scenes/shop.ts`

```typescript
export function createShopScene() {
  scene(Scene.Shop, () => {
    const shopManager = getShopManager()
    const inventory = shopManager.getPlayerInventory()

    // Display currency
    const currencyText = add([
      text(`Coins: ${inventory.currency}`),
      pos(20, 20),
      color(Color.WHITE),
    ])

    // Display shop items
    shopManager.getShopInventory().items.forEach((item, index) => {
      const itemButton = add([
        rect(200, 60),
        pos(50, 100 + index * 70),
        color(item.isPurchased ? Color.GREEN : Color.BLUE),
        area(),
      ])

      if (!item.isPurchased && inventory.currency >= item.basePrice) {
        itemButton.onClick(() => {
          const result = shopManager.purchaseItem(item.id)
          if (result.success) {
            // Update UI
            currencyText.text = `Coins: ${shopManager.getPlayerInventory().currency}`
          }
        })
      }
    })
  })
}
```

### 6. Integrate with Existing Game Scene

**File**: `src/scenes/spa-game.ts` (modify existing)

```typescript
// Add level initialization
function setupGameState(gameState: SpaGameState, levelId?: string) {
  const levelManager = getLevelManager()
  const level = levelId
    ? levelManager.getLevel(parseInt(levelId))
    : levelManager.getCurrentLevel()

  // Apply level configuration to character
  gameState.character = new Character({
    ...level.customerTemplate,
    position: center(),
  })

  // Set time limit based on level
  if (gameState.treatmentSession) {
    gameState.treatmentSession.setTimeLimit(level.config.timeLimit)
  }
}

// Add shop navigation after treatment completion
function handleTreatmentComplete(gameState: SpaGameState) {
  // ... existing completion logic

  // Add shop button
  const shopButton = add([
    rect(120, 40),
    pos(center().x - 60, center().y + 100),
    color(Color.GREEN),
    area(),
    text('Shop', { size: 20 }),
  ])

  shopButton.onClick(() => {
    go(Scene.Shop)
  })
}
```

### 7. Update Scene Constants

**File**: `src/constants/index.ts`

```typescript
export const Scene = {
  ...existingScenes,
  LevelSelect: 'level-select',
  Shop: 'shop',
} as const
```

### 8. Add TypeScript Interfaces

**File**: `src/types/level.ts`

```typescript
export interface Level {
  id: string
  name: string
  number: number
  isUnlocked: boolean
  customerTemplate: CustomerTemplate
  config: LevelConfig
}

export interface LevelConfig {
  timeLimit: number
  satisfactionThreshold: number
  scoreThreshold: number
  availableMaskTypes: string[]
  scoreMultiplier: number
  difficultyMultiplier: number
}

// ... other interfaces from data model
```

## Integration Checklist

- [ ] Create level configuration constants
- [ ] Implement LevelManager system
- [ ] Implement ShopManager system
- [ ] Implement EconomyManager system
- [ ] Create level selection scene
- [ ] Create shop scene
- [ ] Update existing game scene integration
- [ ] Add TypeScript interfaces
- [ ] Update scene constants
- [ ] Test level progression flow
- [ ] Test shop purchase flow
- [ ] Verify persistence works correctly

## Testing Strategy

### Manual Testing Required

1. **Level Progression**
   - Complete level 1 with required score/satisfaction
   - Verify level 2 unlocks
   - Test retry functionality on failure

2. **Shop System**
   - Earn currency from treatment
   - Purchase items and verify inventory updates
   - Test insufficient funds handling

3. **Persistence**
   - Close and reopen game
   - Verify progress and inventory saved
   - Test corrupted data recovery

### Performance Validation

- Monitor FPS during level transitions
- Verify localStorage operations are fast
- Test memory usage stays within limits

## Next Steps

After implementing these components:

1. Run `/speckit.tasks` to generate detailed implementation tasks
2. Implement tasks in dependency order
3. Conduct manual gameplay testing
4. Validate performance requirements
5. Iterate based on testing feedback

## Common Issues

- **Scene transitions not working**: Ensure all scenes are registered in constants
- **Progress not saving**: Verify localStorage calls are wrapped in try/catch
- **Shop items not purchasable**: Check currency conversion and validation logic
- **Level difficulty not applying**: Ensure level config is properly loaded and applied

## Support

Refer to the existing Spa Day codebase patterns for:

- Scene management examples
- Character system integration
- Asset loading patterns
- Performance optimization techniques
