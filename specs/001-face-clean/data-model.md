# Data Model: Face Cleaning Tool

**Date**: 2026-01-31  
**Feature**: Face Cleaning Tool

## Core Entities

### EraserTool

**Purpose**: Interactive tool for cleaning dirt spots  
**Components**:

- `pos`: Vector2 - Current position
- `area`: Circle - Collision detection (round shape)
- `radius`: number - Eraser size (configurable)
- `isActive`: boolean - Tool state

**State Transitions**:

- `inactive → active` (tool selected)
- `active → inactive` (tool deselected)

### DirtSpot

**Purpose**: Individual dirt spots that can be cleaned  
**Components**:

- `pos`: Vector2 - Position on face
- `area`: Circle - Collision detection (small radius)
- `isCleaned`: boolean - Cleaning state
- `points`: number - Score value (configurable)
- `sprite`: SpriteComponent - Visual representation

**State Transitions**:

- `dirty → cleaned` (on collision with eraser)
- `cleaned → removed` (after cleanup animation)

### FaceRegion

**Purpose**: Areas of the face with cleaning state tracking  
**Components**:

- `bounds`: Rect - Region boundaries
- `cleanliness`: number (0-1) - Cleanliness percentage
- `dirtSpots`: DirtSpot[] - Associated dirt spots
- `maskReady`: boolean - Ready for mask application

**Validation Rules**:

- `maskReady = true` only if `cleanliness >= 0.8`
- `cleanliness` calculated from cleaned vs total dirt spots

### CleaningState

**Purpose**: Global cleaning progress tracking  
**Components**:

- `totalSpots`: number - Total dirt spots on face
- `cleanedSpots`: number - Currently cleaned spots
- `score`: number - Current score
- `isComplete`: boolean - All spots cleaned

**Calculated Properties**:

- `progress = cleanedSpots / totalSpots`
- `isComplete = progress >= 1.0`

## Relationships

```
EraserTool (1) ──collides with──> (many) DirtSpot
DirtSpot (many) ──belongs to──> (1) FaceRegion
FaceRegion (many) ──part of──> (1) CleaningState
CleaningState (1) ──tracks──> (many) EraserTool interactions
```

## Data Flow

1. **Initialization**: Generate dirt spots across face regions
2. **Interaction**: Eraser collides with dirt spots
3. **State Update**: Dirt spots mark as cleaned, update scores
4. **Progress**: Face regions calculate cleanliness
5. **Completion**: Global state tracks completion

## Performance Considerations

- **Object Count**: Max 100 dirt spots to maintain 60 FPS
- **Collision Detection**: Use Kaplay.js spatial hashing
- **State Updates**: Batch updates to reduce render calls
- **Memory**: Cleaned spots removed from scene after animation

## Validation Rules

### Business Rules

- Only eraser tool can clean dirt spots
- Score awarded only once per dirt spot
- Face regions must be 80% clean for mask application
- Cleaning progress must be visually reflected

### Technical Rules

- All positions must be within face boundaries
- Collision detection uses circle-circle intersection
- State updates must be atomic
- Score calculations must be deterministic
