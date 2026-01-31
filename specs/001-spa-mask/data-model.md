# Data Model: Spa Face Mask Game

**Phase**: 1 - Design & Contracts  
**Date**: 2025-01-30  
**Feature**: Spa Face Mask Game

## Core Entities

### FaceMask

Represents different mask types with properties and effects.

**Fields**:

- `id`: string - Unique identifier
- `name`: string - Display name
- `type`: MaskType - Category of mask (hydrating, clarifying, etc.)
- `duration`: number - Treatment duration in seconds
- `effect`: MaskEffect - Visual and gameplay effect
- `unlockRequirement`: UnlockRequirement - Condition to unlock
- `spritePath`: string - Asset path for visual representation
- `soundEffect`: string - Audio feedback path

**Validation Rules**:

- Duration must be between 10-300 seconds
- Name must be unique across all masks
- Sprite path must reference existing asset

**State Transitions**:

- `locked` → `unlocked` when requirements met
- `unlocked` → `selected` when chosen for treatment
- `selected` → `applied` when placed on character

### Character

Represents spa customers with face areas and satisfaction.

**Fields**:

- `id`: string - Unique identifier
- `name`: string - Character name
- `faceAreas`: FaceArea[] - Available mask placement zones
- `satisfactionLevel`: number - Current satisfaction (0-100)
- `preferredMaskTypes`: MaskType[] - Character preferences
- `spritePath`: string - Character visual asset

**Validation Rules**:

- Satisfaction level must remain within 0-100 range
- Must have at least 3 face areas
- Each face area can only hold one mask

### FaceArea

Specific zones on character face for mask placement.

**Fields**:

- `id`: string - Unique area identifier
- `position`: Vec2 - Screen coordinates
- `size`: Vec2 - Width and height
- `currentMask`: FaceMask | null - Currently applied mask
- `areaType`: AreaType - Forehead, cheeks, chin, etc.

**Validation Rules**:

- Position must be within character bounds
- Size must accommodate mask sprites
- Only one mask allowed per area

### TreatmentSession

Represents individual spa treatments with timing and results.

**Fields**:

- `id`: string - Unique session identifier
- `characterId`: string - Associated character
- `startTime`: number - Session start timestamp
- `duration`: number - Total treatment time
- `appliedMasks`: AppliedMask[] - Masks and their placement
- `score`: number - Calculated treatment score
- `status`: SessionStatus - Active, completed, interrupted

**Validation Rules**:

- Cannot have more masks than face areas
- Score calculated based on mask combinations and timing
- Session must have valid character association

### AppliedMask

Links masks to specific face areas within treatment.

**Fields**:

- `maskId`: string - Reference to FaceMask
- `faceAreaId`: string - Reference to FaceArea
- `applicationTime`: number - When mask was applied
- `completionTime`: number | null - When treatment finished
- `effectiveness`: number - Quality score (0-100)

**Validation Rules**:

- Mask must be compatible with face area type
- Application time must be within session duration
- Effectiveness calculated based on timing and character preferences

### PlayerProgress

Tracks player's overall game progression and unlocks.

**Fields**:

- `totalScore`: number - Cumulative score across all sessions
- `completedTreatments`: number - Total finished sessions
- `unlockedMasks`: string[] - IDs of available masks
- `achievements`: Achievement[] - Unlocked achievements
- `currentLevel`: number - Player progression level

**Validation Rules**:

- Total score cannot decrease
- Unlocked masks must exist in mask collection
- Level progression based on treatment count and score

## Enums and Types

### MaskType

```typescript
enum MaskType {
  HYDRATING = 'hydrating',
  CLARIFYING = 'clarifying',
  ANTI_AGING = 'anti-aging',
  SOOTHING = 'soothing',
  DETOXIFYING = 'detoxifying',
}
```

### AreaType

```typescript
enum AreaType {
  FOREHEAD = 'forehead',
  LEFT_CHEEK = 'left_cheek',
  RIGHT_CHEEK = 'right_cheek',
  CHIN = 'chin',
  NOSE = 'nose',
}
```

### SessionStatus

```typescript
enum SessionStatus {
  PREPARING = 'preparing',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  INTERRUPTED = 'interrupted',
}
```

### UnlockRequirement

```typescript
interface UnlockRequirement {
  type: 'score' | 'treatments' | 'level'
  value: number
  description: string
}
```

## Relationships

- `Character` has many `FaceArea` (1:N)
- `TreatmentSession` belongs to one `Character` (N:1)
- `TreatmentSession` has many `AppliedMask` (1:N)
- `AppliedMask` references one `FaceMask` and one `FaceArea` (N:1)
- `PlayerProgress` tracks many `TreatmentSession` results (1:N)
- `FaceMask` can be used in many `AppliedMask` instances (1:N)

## Data Flow

1. Player selects character and available masks
2. Treatment session created with character association
3. Player applies masks to face areas (creates AppliedMask records)
4. Timer tracks treatment duration
5. Score calculated based on mask effectiveness and timing
6. Session completed, results added to player progress
7. New masks unlocked based on progression requirements

## Persistence Strategy

All game state persisted in localStorage using JSON serialization:

- `player_progress` - PlayerProgress object
- `unlocked_masks` - Array of mask IDs
- `treatment_history` - Recent session summaries
- `game_settings` - Audio, visual preferences

Data schema versioned for migration compatibility.
