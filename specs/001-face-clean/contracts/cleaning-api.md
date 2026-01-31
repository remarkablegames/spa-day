# Cleaning API Contracts

**Date**: 2026-01-31  
**Feature**: Face Cleaning Tool

## Event System Contracts

### Cleaning Events

```typescript
// Event: Dirt spot cleaned
interface DirtSpotCleanedEvent {
  spotId: string
  position: Vector2
  points: number
  timestamp: number
}

// Event: Face region cleaned
interface RegionCleanedEvent {
  regionId: string
  cleanliness: number
  maskReady: boolean
  timestamp: number
}

// Event: Cleaning completed
interface CleaningCompletedEvent {
  totalSpots: number
  finalScore: number
  completionTime: number
  timestamp: number
}
```

### Tool Events

```typescript
// Event: Eraser tool activated
interface EraserActivatedEvent {
  toolId: string
  position: Vector2
  timestamp: number
}

// Event: Eraser tool moved
interface EraserMovedEvent {
  toolId: string
  fromPosition: Vector2
  toPosition: Vector2
  timestamp: number
}

// Event: Eraser tool deactivated
interface EraserDeactivatedEvent {
  toolId: string
  finalPosition: Vector2
  timestamp: number
}
```

## Game Object Contracts

### EraserTool Interface

```typescript
interface EraserTool {
  // Properties
  readonly id: string
  readonly radius: number
  readonly isActive: boolean
  position: Vector2

  // Methods
  activate(): void
  deactivate(): void
  moveTo(position: Vector2): void
  setRadius(radius: number): void

  // Events
  on(event: 'activated', callback: (event: EraserActivatedEvent) => void): void
  on(event: 'moved', callback: (event: EraserMovedEvent) => void): void
  on(
    event: 'deactivated',
    callback: (event: EraserDeactivatedEvent) => void,
  ): void
}
```

### DirtSpot Interface

```typescript
interface DirtSpot {
  // Properties
  readonly id: string
  readonly position: Vector2
  readonly points: number
  readonly isCleaned: boolean

  // Methods
  clean(): void
  remove(): void

  // Events
  on(event: 'cleaned', callback: (event: DirtSpotCleanedEvent) => void): void
}
```

### FaceRegion Interface

```typescript
interface FaceRegion {
  // Properties
  readonly id: string
  readonly bounds: Rect
  readonly cleanliness: number
  readonly maskReady: boolean
  readonly dirtSpots: DirtSpot[]

  // Methods
  addDirtSpot(spot: DirtSpot): void
  removeDirtSpot(spotId: string): void
  calculateCleanliness(): number
  checkMaskReady(): boolean

  // Events
  on(event: 'cleaned', callback: (event: RegionCleanedEvent) => void): void
}
```

## Scene Contracts

### Cleaning Scene Interface

```typescript
interface CleaningScene {
  // Properties
  readonly eraser: EraserTool
  readonly faceRegions: FaceRegion[]
  readonly cleaningState: CleaningState

  // Methods
  initialize(): void
  start(): void
  pause(): void
  resume(): void
  complete(): void

  // Events
  on(event: 'started', callback: () => void): void
  on(
    event: 'completed',
    callback: (event: CleaningCompletedEvent) => void,
  ): void
}
```

## Configuration Contracts

### Cleaning Configuration

```typescript
interface CleaningConfig {
  // Eraser settings
  eraser: {
    defaultRadius: number
    minRadius: number
    maxRadius: number
  }

  // Dirt spot settings
  dirtSpots: {
    minCount: number
    maxCount: number
    minPoints: number
    maxPoints: number
    spotSize: number
  }

  // Face region settings
  faceRegions: {
    requiredCleanliness: number // 0.8 for mask readiness
    regionCount: number
  }

  // Scoring settings
  scoring: {
    pointsPerSpot: number
    bonusMultiplier: number
    completionBonus: number
  }
}
```

## Validation Contracts

### Input Validation

```typescript
interface PositionValidator {
  isValidPosition(position: Vector2): boolean
  isWithinFaceBounds(position: Vector2): boolean
  isValidRadius(radius: number): boolean
}

interface StateValidator {
  isValidCleaningState(state: CleaningState): boolean
  isValidCleanliness(cleanliness: number): boolean
  isValidScore(score: number): boolean
}
```

## Performance Contracts

### Performance Requirements

```typescript
interface PerformanceMetrics {
  maxDirtSpots: number // 100
  targetFPS: number // 60
  maxResponseTime: number // 100ms
  maxMemoryUsage: number // browser limits
}

interface PerformanceMonitor {
  measureFPS(): number
  measureMemoryUsage(): number
  measureResponseTime(): number
  isWithinLimits(): boolean
}
```
