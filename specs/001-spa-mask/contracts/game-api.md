# Game API Contracts: Spa Face Mask Game

**Phase**: 1 - Design & Contracts  
**Date**: 2025-01-30  
**Feature**: Spa Face Mask Game

## Game System Events

### Mask Application Events

```typescript
// Event: Mask Selected
interface MaskSelectedEvent {
  type: 'mask:selected'
  maskId: string
  timestamp: number
}

// Event: Mask Applied
interface MaskAppliedEvent {
  type: 'mask:applied'
  maskId: string
  faceAreaId: string
  position: Vec2
  timestamp: number
}

// Event: Mask Completed
interface MaskCompletedEvent {
  type: 'mask:completed'
  maskId: string
  faceAreaId: string
  effectiveness: number
  timestamp: number
}
```

### Treatment Session Events

```typescript
// Event: Session Started
interface SessionStartedEvent {
  type: 'session:started'
  sessionId: string
  characterId: string
  timestamp: number
}

// Event: Session Completed
interface SessionCompletedEvent {
  type: 'session:completed'
  sessionId: string
  score: number
  satisfaction: number
  timestamp: number
}

// Event: Session Interrupted
interface SessionInterruptedEvent {
  type: 'session:interrupted'
  sessionId: string
  reason: 'user_exit' | 'timeout' | 'error'
  timestamp: number
}
```

### Progress Events

```typescript
// Event: Score Updated
interface ScoreUpdatedEvent {
  type: 'score:updated'
  newScore: number
  delta: number
  reason: string
  timestamp: number
}

// Event: Mask Unlocked
interface MaskUnlockedEvent {
  type: 'mask:unlocked'
  maskId: string
  unlockReason: string
  timestamp: number
}

// Event: Level Up
interface LevelUpEvent {
  type: 'player:level_up'
  newLevel: number
  unlockedFeatures: string[]
  timestamp: number
}
```

## Game State Queries

### Character Queries

```typescript
// Get available characters
interface GetCharactersQuery {
  type: 'characters:get'
  filters?: {
    unlocked?: boolean
    level?: number
  }
}

// Response
interface CharactersResponse {
  type: 'characters:response'
  characters: Character[]
  totalCount: number
}
```

### Mask Collection Queries

```typescript
// Get player's mask collection
interface GetMaskCollectionQuery {
  type: 'masks:get_collection'
  includeLocked?: boolean
  sortBy?: 'name' | 'type' | 'unlock_requirement'
}

// Response
interface MaskCollectionResponse {
  type: 'masks:collection_response'
  masks: FaceMask[]
  unlockedCount: number
  totalCount: number
}
```

### Progress Queries

```typescript
// Get player progress
interface GetProgressQuery {
  type: 'progress:get'
  includeHistory?: boolean
  historyLimit?: number
}

// Response
interface ProgressResponse {
  type: 'progress:response'
  progress: PlayerProgress
  recentSessions: TreatmentSession[]
  achievements: Achievement[]
}
```

## Game Actions

### Treatment Actions

```typescript
// Start new treatment session
interface StartTreatmentAction {
  type: 'treatment:start'
  characterId: string
  selectedMaskIds: string[]
}

// Apply mask to face area
interface ApplyMaskAction {
  type: 'treatment:apply_mask'
  maskId: string
  faceAreaId: string
  position: Vec2
}

// Complete current treatment
interface CompleteTreatmentAction {
  type: 'treatment:complete'
  sessionId: string
}
```

### Collection Actions

```typescript
// Unlock mask (if requirements met)
interface UnlockMaskAction {
  type: 'collection:unlock_mask'
  maskId: string
}

// Purchase mask with in-game currency
interface PurchaseMaskAction {
  type: 'collection:purchase_mask'
  maskId: string
  currency: 'coins' | 'gems'
}
```

### Settings Actions

```typescript
// Update game settings
interface UpdateSettingsAction {
  type: 'settings:update'
  settings: {
    soundEnabled?: boolean
    musicVolume?: number
    effectsVolume?: number
    visualEffects?: boolean
  }
}

// Reset game progress
interface ResetProgressAction {
  type: 'progress:reset'
  confirm: boolean
  preserveUnlocks?: boolean
}
```

## Validation Rules

### Input Validation

```typescript
// Position validation
interface PositionValidator {
  isValidPosition(position: Vec2, bounds: Rect): boolean
  isWithinFaceArea(position: Vec2, area: FaceArea): boolean
}

// Mask compatibility validation
interface MaskCompatibilityValidator {
  canApplyMask(mask: FaceMask, area: FaceArea): boolean
  getEffectiveness(mask: FaceMask, character: Character): number
}

// Session validation
interface SessionValidator {
  canStartSession(character: Character, masks: FaceMask[]): boolean
  canCompleteSession(session: TreatmentSession): boolean
}
```

### Error Responses

```typescript
// Standard error format
interface GameError {
  type: 'error'
  code: string
  message: string
  details?: any
  timestamp: number
}

// Common error codes
enum ErrorCode {
  MASK_NOT_AVAILABLE = 'MASK_NOT_AVAILABLE',
  INVALID_FACE_AREA = 'INVALID_FACE_AREA',
  SESSION_ALREADY_ACTIVE = 'SESSION_ALREADY_ACTIVE',
  INSUFFICIENT_RESOURCES = 'INSUFFICIENT_RESOURCES',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  PERSISTENCE_ERROR = 'PERSISTENCE_ERROR',
}
```

## Performance Contracts

### Frame Rate Requirements

```typescript
// Performance monitoring
interface PerformanceContract {
  targetFPS: 60
  maxFrameTime: 16.67 // milliseconds
  memoryLimit: 100 // MB
  assetLoadTime: 3000 // milliseconds
}

// Performance metrics
interface PerformanceMetrics {
  currentFPS: number
  averageFrameTime: number
  memoryUsage: number
  assetLoadProgress: number
}
```

### Asset Loading Contracts

```typescript
// Asset loading requirements
interface AssetLoadingContract {
  maxConcurrentLoads: 4
  timeoutMs: 10000
  retryAttempts: 3
  cacheStrategy: 'memory' | 'indexeddb' | 'none'
}

// Asset loading events
interface AssetLoadingEvent {
  type: 'asset:loading'
  assetId: string
  progress: number // 0-1
  totalLoaded: number
  totalAssets: number
}
```

## Integration Points

### Storage Integration

```typescript
// Local storage interface
interface StorageContract {
  get(key: string): any | null
  set(key: string, value: any): void
  remove(key: string): void
  clear(): void
  keys(): string[]
}

// Storage events
interface StorageEvent {
  type: 'storage:changed'
  key: string
  oldValue?: any
  newValue?: any
  timestamp: number
}
```

### Audio Integration

```typescript
// Audio system interface
interface AudioContract {
  playSound(soundId: string, volume?: number): void
  playMusic(musicId: string, loop?: boolean, volume?: number): void
  stopAll(): void
  setMasterVolume(volume: number): void
}

// Audio events
interface AudioEvent {
  type: 'audio:played' | 'audio:stopped' | 'audio:volume_changed'
  soundId?: string
  musicId?: string
  volume: number
  timestamp: number
}
```
