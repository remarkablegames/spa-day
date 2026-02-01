# API Contracts: Face Moisturizer Application

**Feature**: Face Moisturizer Application  
**Date**: 2026-02-01  
**Status**: Draft

## Overview

This document defines the programmatic interfaces (contracts) between the moisturizer feature and existing game systems. All interfaces use TypeScript with explicit types.

## System Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│                     Moisturizer Feature                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Moisturizer  │  │  Moisturizer │  │  Coverage    │          │
│  │ Tool         │  │  State Mgr   │  │  Zones       │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         └─────────────────┼─────────────────┘                   │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
┌────────▼────────┐ ┌───────▼────────┐ ┌──────▼────────┐
│   Shop System   │ │ Scoring System │ │  Event System │
│  (existing)     │ │  (existing)    │ │  (existing)   │
└─────────────────┘ └────────────────┘ └───────────────┘
```

## Contract 1: Moisturizer Tool Interface

**File**: `src/gameobjects/moisturizer-tool.ts`

### Input Interface

```typescript
interface MoisturizerToolConfig {
  id: string
  initialPosition: Position
  moisturizerTypeId: string
  allowedBounds: BoundingBox
  coverageRadius: number // Default: 15px
  smoothingFactor: number // Default: 0.2
}

interface Position {
  x: number
  y: number
}

interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}
```

### Output Interface

```typescript
interface MoisturizerTool {
  readonly id: string
  readonly moisturizerTypeId: string
  position: Position
  isActive: boolean
  isFollowingInput: boolean
  coverageRadius: number

  // Lifecycle
  activate(): void
  deactivate(): void
  destroy(): void

  // Movement
  moveTo(position: Position): void
  startFollowing(position: Position): void
  stopFollowing(): void
  constrainToBounds(position: Position): Position

  // Visual
  createVisual(): void
  updateVisual(): void
  showActivationFeedback(): void
  setOpacity(opacity: number): void
}
```

### Events Emitted

```typescript
type MoisturizerToolEvent =
  | { type: 'activated'; toolId: string; position: Position }
  | { type: 'moved'; toolId: string; position: Position; velocity: number }
  | { type: 'deactivated'; toolId: string; position: Position }
  | { type: 'bounds_hit'; toolId: string; position: Position }
```

## Contract 2: Moisturizing State Manager Interface

**File**: `src/systems/moisturizing-state.ts`

### Input Interface

```typescript
interface MoisturizingSessionConfig {
  sessionId: string
  faceBounds: BoundingBox
  zoneGridSize: number // Default: 30px
  completionThreshold: number // Default: 0.85 (85%)
  moisturizerTypeId: string
}

interface ZoneUpdateRequest {
  toolPosition: Position
  toolRadius: number
  timestamp: number
}
```

### Output Interface

```typescript
interface MoisturizingState {
  readonly sessionId: string
  readonly moisturizerTypeId: string
  readonly totalZones: number
  readonly coveredZones: number
  readonly coveragePercentage: number // 0-100
  readonly isComplete: boolean
  readonly startTime: number
  readonly completionTime: number | null
  readonly sessionState: 'initialized' | 'applying' | 'complete' | 'scored'
}

interface MoisturizingStateManager {
  initialize(config: MoisturizingSessionConfig): void
  reset(): void
  destroy(): void

  // Zone management
  updateCoverage(request: ZoneUpdateRequest): ZoneUpdateResult
  getZoneByPosition(position: Position): CoverageZone | null
  getAllZones(): CoverageZone[]
  getCoveredZones(): CoverageZone[]
  getUncoveredZones(): CoverageZone[]

  // State queries
  getState(): MoisturizingState
  getProgress(): number // 0-1
  isComplete(): boolean
  validateCompletion(): ValidationResult

  // Scoring
  calculateSatisfactionScore(): SatisfactionScore
}

interface ZoneUpdateResult {
  zonesActivated: number
  totalCovered: number
  coveragePercentage: number
  isNewCoverage: boolean // True if at least one new zone covered
}

interface ValidationResult {
  isValid: boolean
  coverage: number
  requiredCoverage: number
  message: string
}
```

### Events Emitted

```typescript
type MoisturizingStateEvent =
  | { type: 'session_initialized'; sessionId: string; totalZones: number }
  | {
      type: 'zones_covered'
      sessionId: string
      zonesActivated: number
      totalCovered: number
    }
  | { type: 'progress_updated'; sessionId: string; percentage: number }
  | { type: 'completion_threshold_met'; sessionId: string; percentage: number }
  | { type: 'session_completed'; sessionId: string; completionTime: number }
  | { type: 'score_calculated'; sessionId: string; score: SatisfactionScore }
```

## Contract 3: Shop System Extension

**File**: `src/constants/shop-inventory.ts` (extended)

### Input Interface

```typescript
interface MoisturizerShopItem {
  id: string // 'moisturizer_basic', 'moisturizer_premium', 'moisturizer_luxury'
  name: string
  type: 'moisturizer' // New type category
  basePrice: number
  description: string
  requirements: string[] // ['level_3_unlocked'], etc.
  isPurchased: boolean
  tier: 'basic' | 'premium' | 'luxury'
  color: string // Hex color
  satisfactionMultiplier: number
  coverageSpeedMultiplier: number
}

interface MoisturizerPurchaseRequest {
  moisturizerId: string
  playerLevel: number
  playerCurrency: number
  ownedItems: string[]
}
```

### Output Interface

```typescript
interface MoisturizerPurchaseResult {
  success: boolean
  error?: string
  transaction?: {
    id: string
    type: 'purchase'
    amount: number
    itemId: string
    timestamp: Date
    balance: number
  }
  unlockedMoisturizer?: MoisturizerShopItem
}

interface MoisturizerAvailabilityResult {
  available: MoisturizerShopItem[]
  locked: Array<{
    item: MoisturizerShopItem
    requirements: string[]
    missingRequirements: string[]
  }>
  owned: MoisturizerShopItem[]
}
```

## Contract 4: Scoring System Extension

**File**: `src/systems/scoring.ts` (extended)

### Input Interface

```typescript
interface MoisturizerScoreRequest {
  sessionId: string
  coveragePercentage: number
  moisturizerTier: 'basic' | 'premium' | 'luxury'
  completionTime: number // ms
  toolEfficiency: number // 0-1 based on overlap patterns
}

interface MoisturizerScoreConfig {
  starThresholds: {
    threeStar: number // Default: 85
    fourStar: number // Default: 95
    fiveStar: number // Default: 100
  }
  tierMultipliers: {
    basic: number // Default: 1.0
    premium: number // Default: 1.2
    luxury: number // Default: 1.5
  }
  baseScores: {
    threeStar: number // Default: 100
    fourStar: number // Default: 150
    fiveStar: number // Default: 200
  }
}
```

### Output Interface

```typescript
interface SatisfactionScore {
  coveragePercentage: number
  starRating: 3 | 4 | 5
  baseScore: number
  moisturizerMultiplier: number
  finalScore: number
  calculationTime: number // ms
}

interface MoisturizerScoreBreakdown {
  coverageComponent: number
  speedComponent: number
  efficiencyComponent: number
  tierMultiplier: number
  totalScore: number
  starRating: 3 | 4 | 5
}
```

## Contract 5: Event System Interface

**File**: `src/events/moisturizing-types.ts`

### Event Type Definitions

```typescript
interface MoisturizingEventMap {
  'moisturizer-selected': MoisturizerSelectedEvent
  'tool-activated': ToolActivatedEvent
  'tool-moved': ToolMovedEvent
  'tool-deactivated': ToolDeactivatedEvent
  'zone-covered': ZoneCoveredEvent
  'progress-updated': ProgressUpdatedEvent
  'completion-threshold-met': CompletionThresholdMetEvent
  'session-completed': SessionCompletedEvent
  'score-calculated': ScoreCalculatedEvent
}

interface MoisturizerSelectedEvent {
  sessionId: string
  moisturizerId: string
  tier: 'basic' | 'premium' | 'luxury'
  color: string
  timestamp: number
}

interface ToolActivatedEvent {
  sessionId: string
  toolId: string
  position: Position
  timestamp: number
}

interface ToolMovedEvent {
  sessionId: string
  toolId: string
  position: Position
  velocity: number
  timestamp: number
}

interface ToolDeactivatedEvent {
  sessionId: string
  toolId: string
  position: Position
  timestamp: number
}

interface ZoneCoveredEvent {
  sessionId: string
  zoneId: string
  totalCovered: number
  totalZones: number
  timestamp: number
}

interface ProgressUpdatedEvent {
  sessionId: string
  coveragePercentage: number
  coveredZones: number
  totalZones: number
  timestamp: number
}

interface CompletionThresholdMetEvent {
  sessionId: string
  coveragePercentage: number
  timestamp: number
}

interface SessionCompletedEvent {
  sessionId: string
  coveragePercentage: number
  completionTime: number
  timestamp: number
}

interface ScoreCalculatedEvent {
  sessionId: string
  score: SatisfactionScore
  timestamp: number
}
```

## Contract 6: Scene Integration Interface

**File**: `src/scenes/spa-game.ts` (extended)

### Input Interface

```typescript
interface MoisturizerStepConfig {
  stepOrder: number // Position in treatment sequence (e.g., 3 for cleanse→mask→moisturize)
  faceAssetId: string
  faceBounds: BoundingBox
  previousStepResult: PreviousStepResult // State from mask/cleanse step
}

interface PreviousStepResult {
  isComplete: boolean
  cleanlinessScore?: number // From cleanse step
  maskScore?: number // From mask step
}
```

### Output Interface

```typescript
interface MoisturizerStepResult {
  stepId: 'moisturizer_application'
  isComplete: boolean
  coveragePercentage: number
  satisfactionScore: SatisfactionScore
  moisturizerTypeId: string
  sessionDuration: number // ms
  canProceed: boolean // Always true if isComplete (mandatory final step)
}

interface SpaSessionState {
  steps: Array<{
    stepId: string
    isComplete: boolean
    result: unknown // Step-specific result
  }>
  currentStepIndex: number
  overallScore: number
  canCompleteSession: boolean // True when moisturizer complete
}
```

## Error Handling Contracts

### Standard Error Response

```typescript
interface MoisturizerError {
  code:
    | 'INVALID_MOISTURIZER_ID'
    | 'INSUFFICIENT_FUNDS'
    | 'LEVEL_REQUIREMENT_NOT_MET'
    | 'SESSION_NOT_FOUND'
    | 'TOOL_NOT_ACTIVE'
    | 'COVERAGE_CALCULATION_ERROR'
    | 'INVALID_POSITION'
    | 'COMPLETION_THRESHOLD_NOT_MET'
  message: string
  details?: Record<string, unknown>
  timestamp: number
}

interface Result<T> {
  success: boolean
  data?: T
  error?: MoisturizerError
}
```

## Performance Contracts

| Operation            | Time Budget      | Memory Budget     |
| -------------------- | ---------------- | ----------------- |
| Tool activation      | < 10ms           | < 1KB             |
| Position update      | < 5ms            | No allocation     |
| Zone coverage check  | < 1ms per zone   | No allocation     |
| Progress calculation | < 5ms            | No allocation     |
| Completion check     | < 1ms            | No allocation     |
| Score calculation    | < 100ms          | < 10KB            |
| Trail rendering      | < 16ms per frame | Trail pool reused |

## Version Compatibility

- Kaplay.js: 3001.0.19 (locked)
- TypeScript: 5.9.3+ (strict mode required)
- Shop System: Compatible with existing v1 API
- Scoring System: Compatible with existing v1 API
