# Quickstart Guide: Spa Face Mask Game

**Phase**: 1 - Design & Contracts  
**Date**: 2025-01-30  
**Feature**: Spa Face Mask Game

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git repository with existing Kaplay.js setup
- Modern web browser for testing
- Touch-enabled device for mobile testing

### Project Structure

```
spa-day/
├── src/
│   ├── gameobjects/
│   │   ├── character.ts     # Character entity with face areas
│   │   ├── mask.ts          # Face mask entities and effects
│   │   └── treatment.ts     # Treatment session management
│   ├── scenes/
│   │   ├── game.ts          # Main gameplay scene
│   │   ├── collection.ts    # Mask collection scene
│   │   └── results.ts       # Treatment results scene
│   ├── systems/
│   │   ├── scoring.ts       # Score calculation system
│   │   ├── progression.ts  # Unlock and progression system
│   │   └── input.ts         # Touch input handling
│   └── constants/
│       ├── mask-types.ts    # Mask type definitions
│       └── game-config.ts   # Game configuration
├── public/
│   └── assets/
│       ├── sprites/
│       │   ├── characters/  # Character sprites
│       │   └── masks/       # Mask sprites
│       └── sounds/
│           ├── effects/     # Sound effects
│           └── music/       # Background music
└── specs/001-spa-mask/      # Feature documentation
```

## Core Implementation Steps

### 1. Character System

Create character entities with face areas for mask placement:

```typescript
// src/gameobjects/character.ts
export class Character extends KaboomCtx.GameObj {
  faceAreas: FaceArea[]
  satisfactionLevel: number

  constructor(config: CharacterConfig) {
    super([
      sprite(config.spritePath),
      pos(config.position),
      area(),
      'character',
    ])

    this.setupFaceAreas()
  }

  private setupFaceAreas() {
    // Define forehead, cheeks, chin areas
    // Each area has position, size, and mask slot
  }
}
```

### 2. Mask System

Implement face mask entities with effects and timing:

```typescript
// src/gameobjects/mask.ts
export class FaceMask extends KaboomCtx.GameObj {
  type: MaskType
  duration: number
  effectiveness: number

  constructor(config: MaskConfig) {
    super([sprite(config.spritePath), pos(config.position), area(), 'mask'])
  }

  applyToFaceArea(area: FaceArea) {
    // Handle mask placement logic
    // Start treatment timer
    // Apply visual effects
  }
}
```

### 3. Treatment Session Management

Manage treatment timing and scoring:

```typescript
// src/gameobjects/treatment.ts
export class TreatmentSession {
  sessionId: string
  character: Character
  appliedMasks: AppliedMask[]
  startTime: number

  startTreatment(character: Character) {
    this.startTime = Date.now()
    this.character = character
    // Initialize session state
  }

  completeTreatment() {
    const score = this.calculateScore()
    const satisfaction = this.calculateSatisfaction()
    // Update player progress
    // Trigger completion events
  }
}
```

### 4. Scene Management

Implement game flow with Kaplay.js scenes:

```typescript
// src/scenes/game.ts
scene('game', () => {
  // Load character
  // Initialize mask selection UI
  // Set up touch input handlers
  // Start treatment session timer

  onTouchStart((pos) => {
    // Handle mask selection and placement
  })

  onUpdate(() => {
    // Update treatment timers
    // Check for mask completions
    // Maintain 60 FPS
  })
})
```

### 5. Input System

Implement touch controls for mobile-first design:

```typescript
// src/systems/input.ts
export class InputSystem {
  constructor() {
    this.setupTouchHandlers()
    this.setupDragHandlers()
  }

  private setupTouchHandlers() {
    onTouchStart((pos) => this.handleTouchStart(pos))
    onTouchMove((pos) => this.handleTouchMove(pos))
    onTouchEnd((pos) => this.handleTouchEnd(pos))
  }

  private handleTouchStart(pos: Vec2) {
    // Detect if touching mask or face area
    // Start drag operation if mask selected
  }
}
```

### 6. Scoring System

Calculate scores based on mask combinations and timing:

```typescript
// src/systems/scoring.ts
export class ScoringSystem {
  calculateTreatmentScore(session: TreatmentSession): number {
    let baseScore = 0

    // Score for correct mask placement
    baseScore += this.calculatePlacementScore(session.appliedMasks)

    // Score for timing accuracy
    baseScore += this.calculateTimingScore(session)

    // Score for character preferences
    baseScore += this.calculatePreferenceScore(session)

    return baseScore
  }
}
```

### 7. Progression System

Handle mask unlocks and player progression:

```typescript
// src/systems/progression.ts
export class ProgressionSystem {
  checkUnlocks(progress: PlayerProgress): string[] {
    const newUnlocks: string[] = []

    // Check score-based unlocks
    if (progress.totalScore >= 1000) {
      newUnlocks.push('premium_hydrating_mask')
    }

    // Check treatment count unlocks
    if (progress.completedTreatments >= 10) {
      newUnlocks.push('anti_aging_mask')
    }

    return newUnlocks
  }
}
```

## Asset Requirements

### Character Sprites

- Base character sprite with neutral expression
- Face area highlight overlays
- Satisfaction expression variations
- Size: 256x256px for main character

### Mask Sprites

- Different mask types with visual variety
- Application effects (sparkles, glow)
- Completion animations
- Size: 64x64px per mask

### Audio Assets

- Mask application sounds
- Treatment completion sounds
- Background spa music (ambient, relaxing)
- UI interaction sounds

## Performance Guidelines

### Frame Rate Optimization

- Use object pooling for frequently created/destroyed objects
- Limit particle effects to maintain 60 FPS
- Optimize sprite sheets for efficient rendering
- Monitor memory usage with browser dev tools

### Asset Loading

- Preload essential assets before game start
- Use sprite sheets to reduce HTTP requests
- Implement progressive loading for non-critical assets
- Cache assets in browser storage when possible

### Mobile Optimization

- Ensure touch targets are at least 44x44px
- Avoid hover states (not mobile-friendly)
- Test on actual mobile devices
- Optimize for various screen sizes

## Testing Strategy

### Manual Gameplay Testing

1. **Core Loop Test**: Complete full treatment session
2. **Touch Control Test**: Verify mask placement accuracy
3. **Progression Test**: Unlock new masks through gameplay
4. **Performance Test**: Monitor FPS during intensive scenes
5. **Mobile Test**: Play on actual mobile device

### Test Scenarios

- Apply multiple masks to same character
- Interrupt treatment and resume
- Test edge cases (rapid tapping, invalid placement)
- Verify score calculation accuracy
- Check progression unlock triggers

## Deployment Notes

### Static Hosting

- Game runs entirely in browser
- No server-side dependencies
- All assets bundled for static delivery
- Compatible with GitHub Pages, Netlify, itch.io

### Browser Compatibility

- Modern browsers with ES6+ support
- Touch events support required
- LocalStorage API for persistence
- WebAudio API for sound effects

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Format code
npm run format
```

## Next Steps

1. Implement core character and mask systems
2. Create basic game scene with touch controls
3. Add treatment timing and scoring
4. Implement progression and unlock system
5. Add visual effects and audio feedback
6. Optimize for mobile performance
7. Conduct thorough gameplay testing
8. Prepare for deployment

This quickstart provides the foundation for implementing the spa face mask game following Kaplay.js conventions and mobile-first design principles.
