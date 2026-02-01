# Data Model: Face Moisturizer Application

**Feature**: Face Moisturizer Application  
**Date**: 2026-02-01  
**Status**: Draft

## Entities

### MoisturizerType

Represents the different types of moisturizers available in the game.

**Fields**:
| Field | Type | Description | Validation |
| ----- | ---- | ----------- | ---------- |
| id | string | Unique identifier (e.g., 'moisturizer_basic') | Required, unique |
| name | string | Display name (e.g., 'Basic Moisturizer') | Required, max 50 chars |
| tier | 'basic' \| 'premium' \| 'luxury' | Quality tier | Required, enum |
| color | string | Hex color code for visual rendering | Required, valid hex |
| coverageMultiplier | number | Speed of coverage application | Required, > 0 |
| satisfactionMultiplier | number | Score multiplier (basic=1, premium=1.2, luxury=1.5) | Required, >= 1 |
| texture | string | Texture identifier (all use 'smooth_cream') | Required |
| basePrice | number | Cost to unlock/purchase | Required, >= 0 |
| levelRequirement | number | Minimum player level to unlock | Required, >= 1 |
| isDefault | boolean | Whether unlocked by default | Required |

**State Transitions**:

```
locked → available (when level + cost requirements met)
available → owned (when purchased)
owned → selected (when chosen for treatment)
```

**Validation Rules**:

- Basic tier: levelRequirement = 1, isDefault = true, satisfactionMultiplier = 1.0
- Premium tier: levelRequirement >= 3, satisfactionMultiplier = 1.2
- Luxury tier: levelRequirement >= 5, satisfactionMultiplier = 1.5

---

### CoverageZone

Represents a subdivided area of the face for coverage tracking.

**Fields**:
| Field | Type | Description | Validation |
| ----- | ---- | ----------- | ---------- |
| id | string | Unique zone identifier | Required, unique |
| bounds | BoundingBox | {x, y, width, height} | Required, width/height > 0 |
| isCovered | boolean | Whether moisturizer has been applied | Required |
| coverageTimestamp | number | When zone was first covered (ms) | Optional, > 0 |
| overlapCount | number | Times tool overlapped zone | Required, >= 0 |

**Validation Rules**:

- Zone size: 20-50 pixels per zone for accuracy
- Total zones: 50-100 per face for ~2-4% accuracy
- overlapCount does not affect coverage (prevent double-counting per FR-009)

---

### MoisturizerState

Tracks the current state of a moisturizer application session.

**Fields**:
| Field | Type | Description | Validation |
| ----- | ---- | ----------- | ---------- |
| sessionId | string | Unique session identifier | Required, unique |
| selectedMoisturizerId | string | ID of chosen moisturizer type | Required, must exist |
| totalZones | number | Total coverage zones on face | Required, > 0 |
| coveredZones | number | Count of covered zones | Required, 0 <= coveredZones <= totalZones |
| coveragePercentage | number | Percentage covered (0-100) | Required, calculated field |
| isComplete | boolean | Whether 85% threshold reached | Required |
| startTime | number | Session start timestamp (ms) | Required, > 0 |
| completionTime | number | Time to completion (ms) | Optional, > 0 |
| trailPositions | Position[] | Array of applied trail coordinates | Required, array |

**State Transitions**:

```
initialized → applying (when tool first activated)
applying → complete (when coverage >= 85%)
complete → scored (when satisfaction calculated)
```

**Validation Rules**:

- coveragePercentage = (coveredZones / totalZones) \* 100
- isComplete = coveragePercentage >= 85
- completionTime only set when isComplete becomes true
- trailPositions capped at 500 entries for performance

---

### MoisturizerTrail

Visual representation of applied moisturizer cream.

**Fields**:
| Field | Type | Description | Validation |
| ----- | ---- | ----------- | ---------- |
| id | string | Unique trail segment identifier | Required, unique |
| positions | Position[] | Array of {x, y} coordinates forming path | Required, length >= 2 |
| color | string | Hex color from MoisturizerType | Required, valid hex |
| width | number | Trail width in pixels | Required, 5-20px |
| opacity | number | Visual opacity (0-1) | Required, 0.5-1.0 |
| createdAt | number | Timestamp when trail created | Required, > 0 |

**Validation Rules**:

- Minimum distance between positions: 5px (prevent dot spam per edge case)
- Maximum segments per trail: 100 (performance)
- Opacity increases slightly on overlap for visual feedback

---

### SatisfactionScore

Calculated score for the moisturizer treatment.

**Fields**:
| Field | Type | Description | Validation |
| ----- | ---- | ----------- | ---------- |
| coveragePercentage | number | Final coverage achieved | Required, 0-100 |
| starRating | number | 3-5 stars based on coverage | Required, 3-5 |
| baseScore | number | Score before multipliers | Required, >= 0 |
| moisturizerMultiplier | number | Type-based multiplier | Required, >= 1 |
| finalScore | number | Score after multipliers | Required, >= baseScore |
| calculationTime | number | Time to calculate (ms) | Required, < 100 |

**Calculation Rules**:

- 85-94% coverage: 3 stars
- 95-99% coverage: 4 stars
- 100% coverage: 5 stars
- starRating determines baseScore (3=100, 4=150, 5=200)
- finalScore = baseScore \* moisturizerMultiplier

---

## Relationships

```
MoisturizerType 1--* MoisturizerState (selectedMoisturizerId)
MoisturizerState 1--* CoverageZone (zones tracked)
MoisturizerState 1--* MoisturizerTrail (visual trails)
MoisturizerState 1--1 SatisfactionScore (when complete)
```

## Shop Integration

Moisturizer types are stored as ShopItem entries:

```typescript
interface ShopItem {
  id: string // 'moisturizer_basic', 'moisturizer_premium', etc.
  name: string // Display name
  type: 'moisturizer' // New type category
  basePrice: number
  description: string
  requirements: string[] // ['level_3_unlocked'], etc.
  isPurchased: boolean
  // Extended metadata for moisturizer-specific data
  metadata: {
    tier: 'basic' | 'premium' | 'luxury'
    color: string
    satisfactionMultiplier: number
  }
}
```

## Type Definitions

```typescript
// Position coordinate
type Position = {
  x: number
  y: number
}

// Bounding box for zones
type BoundingBox = {
  x: number
  y: number
  width: number
  height: number
}

// Moisturizer tier enum
type MoisturizerTier = 'basic' | 'premium' | 'luxury'

// Session state enum
type MoisturizerSessionState =
  | 'initialized'
  | 'applying'
  | 'complete'
  | 'scored'
```

## Validation Summary

| Entity            | Key Validations                                         |
| ----------------- | ------------------------------------------------------- |
| MoisturizerType   | Unique ID, valid hex color, multipliers match tier      |
| CoverageZone      | Positive dimensions, overlapCount non-negative          |
| MoisturizerState  | Coverage math correct, timestamps valid                 |
| MoisturizerTrail  | Min positions, valid color reference                    |
| SatisfactionScore | Star logic matches coverage brackets, calc time < 100ms |
