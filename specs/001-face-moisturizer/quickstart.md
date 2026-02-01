# Quickstart Guide: Face Moisturizer Application

**Feature**: Face Moisturizer Application  
**Date**: 2026-02-01  
**Status**: Ready for Implementation

## Prerequisites

- Node.js 24 installed
- Repository cloned and dependencies installed (`npm install`)
- Familiarity with existing cleaning system (src/systems/cleaning-state.ts, src/gameobjects/eraser.ts)
- Review of feature specification: [spec.md](./spec.md)

## Development Environment Setup

```bash
# Start the development server
npm start

# In another terminal, run type checking
npm run lint:tsc

# Run linting (auto-fix issues)
npm run lint:fix
```

## Architecture Overview

The moisturizer feature follows the **exact same patterns** as the existing cleaning/cleansing system:

```
src/
├── gameobjects/
│   ├── eraser.ts              ← Reference pattern for → moisturizer-tool.ts
│   └── dirt-spot.ts           ← Reference pattern for → coverage-zone.ts
├── systems/
│   ├── cleaning-state.ts      ← Reference pattern for → moisturizing-state.ts
│   └── cleaning-assets.ts     ← Reference pattern for → moisturizing-assets.ts
├── events/
│   ├── cleaning-types.ts      ← Reference pattern for → moisturizing-types.ts
│   └── cleaning.ts            ← Reference pattern for → moisturizing.ts
└── constants/
    └── cleaning-config.ts     ← Reference pattern for → moisturizing-config.ts
```

## Step-by-Step Implementation

### Step 1: Create Type Definitions (15 minutes)

**File**: `src/events/moisturizing-types.ts`

Copy the content from [contracts/event-types.ts](./contracts/event-types.ts) and [contracts/moisturizer-types.ts](./contracts/moisturizer-types.ts) into the actual source files.

**Key types to implement**:

- `MoisturizerTier`: 'basic' | 'premium' | 'luxury'
- `CoverageZone`: Zone tracking with bounds and coverage state
- `SatisfactionScore`: Score calculation result

### Step 2: Create Configuration Constants (10 minutes)

**File**: `src/constants/moisturizing-config.ts`

```typescript
export const MOISTURIZING_CONFIG = {
  zones: {
    gridSize: 30, // Pixels per zone
    completionThreshold: 0.85, // 85% for completion
  },
  tool: {
    defaultRadius: 15,
    minRadius: 10,
    maxRadius: 25,
    smoothingFactor: 0.2,
  },
  visual: {
    maxTrailSegments: 100,
    trailWidth: 8,
    minTrailDistance: 5, // Minimum 5px between trail points
  },
  scoring: {
    thresholds: {
      threeStar: 85, // 85-94%
      fourStar: 95, // 95-99%
      fiveStar: 100, // 100%
    },
    baseScores: {
      threeStar: 100,
      fourStar: 150,
      fiveStar: 200,
    },
    multipliers: {
      basic: 1.0,
      premium: 1.2,
      luxury: 1.5,
    },
  },
  colors: {
    basic: '#FFFFFF', // White
    premium: '#ADD8E6', // Light blue
    luxury: '#E6E6FA', // Lavender
  },
} as const
```

### Step 3: Create Coverage Zone Game Object (30 minutes)

**File**: `src/gameobjects/coverage-zone.ts`

**Pattern to follow**: `src/gameobjects/dirt-spot.ts`

Key differences from dirt-spot:

- Zone is rectangular (bounds-based) not circular
- Zone tracks `overlapCount` but only marks covered on first overlap
- No animation needed (zones are invisible, just tracking)

```typescript
export class CoverageZone {
  readonly id: string
  readonly bounds: BoundingBox
  isCovered: boolean = false
  coverageTimestamp: number | null = null
  overlapCount: number = 0

  constructor(id: string, bounds: BoundingBox) {
    this.id = id
    this.bounds = bounds
  }

  /**
   * Check if tool overlaps with this zone
   */
  overlapsWithTool(toolPosition: Position, toolRadius: number): boolean {
    // Check if circle (tool) overlaps with rectangle (zone)
    // Implementation: closest point on rect to circle center
  }

  /**
   * Mark zone as covered (idempotent)
   */
  cover(): boolean {
    if (this.isCovered) {
      this.overlapCount++
      return false // Was already covered
    }
    this.isCovered = true
    this.coverageTimestamp = Date.now()
    this.overlapCount = 1
    return true // New coverage
  }
}
```

### Step 4: Create Moisturizer Tool Game Object (45 minutes)

**File**: `src/gameobjects/moisturizer-tool.ts`

**Pattern to follow**: `src/gameobjects/eraser.ts`

Key implementation notes:

- Copy the eraser tool structure exactly
- Change naming from "eraser" to "moisturizer"
- Add `moisturizerTypeId` property
- Visual representation uses the color from config based on type

**Critical**: Reuse all input handling logic from eraser (mouse/touch events, smoothing, bounds constraint)

### Step 5: Create Moisturizing State Manager (60 minutes)

**File**: `src/systems/moisturizing-state.ts`

**Pattern to follow**: `src/systems/cleaning-state.ts`

Key responsibilities:

1. Generate coverage zones from face bounds
2. Track which zones are covered
3. Calculate percentage complete
4. Check completion threshold
5. Calculate satisfaction score

```typescript
export class MoisturizingStateManager {
  private zones: Map<string, CoverageZone> = new Map()
  private state: MoisturizerState
  private tool: MoisturizerTool | null = null

  initialize(config: MoisturizingSessionConfig): void {
    // 1. Create zones based on faceBounds and zoneGridSize
    // 2. Reset state
    // 3. Emit initialization event
  }

  updateCoverage(toolPosition: Position, toolRadius: number): ZoneUpdateResult {
    // 1. Find all zones that overlap with tool
    // 2. Call zone.cover() for each
    // 3. Count new coverages
    // 4. Update state.coveredZones
    // 5. Calculate percentage
    // 6. Check completion
    // 7. Emit events
  }

  calculateSatisfactionScore(): SatisfactionScore {
    // 1. Determine star rating from coverage percentage
    // 2. Get base score from rating
    // 3. Apply moisturizer tier multiplier
    // 4. Return final score
  }
}
```

### Step 6: Create Event Manager (20 minutes)

**File**: `src/events/moisturizing.ts`

**Pattern to follow**: `src/events/cleaning.ts`

Copy the structure exactly, just change:

- Event type names (e.g., 'dirt-spot-cleaned' → 'zone-covered')
- Event interface types to use moisturizing types

### Step 7: Extend Shop Inventory (20 minutes)

**File**: `src/constants/shop-inventory.ts` (add to existing)

Add moisturizer items to `SHOP_ITEMS` array:

```typescript
{
  id: 'moisturizer_basic',
  name: 'Basic Moisturizer',
  type: 'moisturizer',  // Add 'moisturizer' to ShopItemType
  basePrice: 0,  // Free, unlocked by default
  description: 'Standard moisturizing cream',
  requirements: [],
  isPurchased: true,
},
{
  id: 'moisturizer_premium',
  name: 'Premium Moisturizer',
  type: 'moisturizer',
  basePrice: 200,
  description: 'Advanced formula with better results',
  requirements: ['level_3_unlocked'],
  isPurchased: false,
},
{
  id: 'moisturizer_luxury',
  name: 'Luxury Moisturizer',
  type: 'moisturizer',
  basePrice: 500,
  description: 'Exclusive luxury formula for best results',
  requirements: ['level_5_unlocked'],
  isPurchased: false,
},
```

### Step 8: Extend Scoring System (30 minutes)

**File**: `src/systems/scoring.ts` (add to existing)

Add method to calculate moisturizer score:

```typescript
public calculateMoisturizerScore(
  coveragePercentage: number,
  moisturizerTier: MoisturizerTier,
): ScoreBreakdown {
  // Calculate star rating from coverage
  let starRating: 3 | 4 | 5
  if (coveragePercentage >= 100) starRating = 5
  else if (coveragePercentage >= 95) starRating = 4
  else starRating = 3

  // Get base score
  const baseScores = { 3: 100, 4: 150, 5: 200 }
  const baseScore = baseScores[starRating]

  // Apply tier multiplier
  const multipliers = { basic: 1.0, premium: 1.2, luxury: 1.5 }
  const multiplier = multipliers[moisturizerTier]

  const totalScore = Math.floor(baseScore * multiplier)

  return {
    baseScore,
    effectivenessBonus: 0,
    timingBonus: 0,
    completionBonus: 0,
    satisfactionBonus: 0,
    comboMultiplier: multiplier,
    totalScore,
  }
}
```

### Step 9: Create Visual Trail Component (30 minutes)

**File**: `src/gameobjects/moisturizer-trail.ts`

This is unique to the moisturizer feature (no direct equivalent in cleaning system).

Responsibilities:

- Render smooth cream texture along drag path
- Use Kaplay.js components: `rect()`, `pos()`, `color()`, `opacity()`
- Cap number of segments for performance
- Color based on moisturizer type

```typescript
export class MoisturizerTrail {
  private segments: GameObj[] = []
  private maxSegments: number = MOISTURIZING_CONFIG.visual.maxTrailSegments

  addSegment(position: Position, color: string): void {
    // Create Kaplay game object for trail segment
    // Use small rectangle or circle
    // Apply color from moisturizer type
    // Remove oldest segment if at max
  }

  clear(): void {
    // Destroy all segment game objects
  }
}
```

### Step 10: Integrate with Spa Game Scene (45 minutes)

**File**: `src/scenes/spa-game.ts` (modify existing)

Add moisturizer step to treatment sequence:

```typescript
// In spa game scene setup
const treatmentSteps = [
  { id: 'cleanse', setup: setupCleanseStep },
  { id: 'mask', setup: setupMaskStep },
  { id: 'moisturize', setup: setupMoisturizeStep }, // Add this
]

function setupMoisturizeStep(): void {
  // 1. Show moisturizer selection UI (if player has unlocked options)
  // 2. Initialize MoisturizingStateManager
  // 3. Create MoisturizerTool
  // 4. Setup input handling (mouse/touch)
  // 5. Create visual trail component
  // 6. Start update loop for coverage checking
  // 7. Show progress indicator
  // 8. On completion: calculate score, show feedback, proceed to results
}
```

## Testing During Development

### Manual Test Checklist

1. **Tool Activation**: Click/touch on face → tool activates
2. **Visual Feedback**: Trail appears while dragging
3. **Boundary Constraint**: Tool stays within face area
4. **Coverage Tracking**: Progress bar updates as you cover areas
5. **Completion**: At 85% coverage, completion triggers
6. **Scoring**: Score appears with correct star rating
7. **Shop Integration**: Can unlock premium/luxury moisturizers
8. **Mobile**: Works smoothly on touch devices

### Test Coverage Calculation

```typescript
// Add temporary debug overlay to verify coverage
// Should show zone grid and highlight covered zones
debugShowZones: boolean = true // Set in config during testing
```

### Performance Testing

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Test on mobile device
# - Should maintain 60 FPS during dragging
# - Trail should not lag behind input
# - Completion calculation should be instant
```

## Integration Points

### Existing Systems to Integrate With

1. **Shop System** (`src/systems/shop.ts`):
   - Add 'moisturizer' type to ShopItem
   - Extend purchase validation for moisturizers
   - Check level requirements before purchase

2. **Scoring System** (`src/systems/scoring.ts`):
   - Add `calculateMoisturizerScore()` method
   - Integrate with session scoring

3. **Storage System** (`src/systems/storage.ts`):
   - Save unlocked moisturizers
   - Persist player preferences

4. **Event System** (`src/events/index.ts`):
   - Export moisturizing event types
   - Ensure events are properly typed

### Files That Should NOT Be Modified

- `src/systems/cleaning-state.ts` - Keep existing, create new parallel file
- `src/gameobjects/eraser.ts` - Reference only, don't modify
- `src/gameobjects/dirt-spot.ts` - Reference only, don't modify

## Common Pitfalls

1. **Don't modify existing cleaning files** - Create parallel structure
2. **Don't use `any` type** - All variables must have explicit types (Constitution VII)
3. **Don't forget mobile** - Test touch input early and often
4. **Don't double-count coverage** - zones.cover() must be idempotent
5. **Don't exceed performance budgets** - Zone checks must be <1ms each

## Next Steps

1. ✅ Review this quickstart guide
2. ✅ Copy contract files to source
3. ✅ Implement in order: config → types → zone → tool → state → events → trail → shop → scoring → scene
4. ✅ Run `npm run lint:fix` after each file
5. ✅ Run `npm run lint:tsc` to verify types
6. ✅ Manual testing on desktop and mobile
7. ⏳ Run `/speckit.tasks` to generate task breakdown for implementation

## Support

- Feature spec: [spec.md](./spec.md)
- Data model: [data-model.md](./data-model.md)
- Contracts: [contracts/](./contracts/)
- Research: [research.md](./research.md)
- Existing patterns: See `src/systems/cleaning-state.ts` and `src/gameobjects/eraser.ts`
