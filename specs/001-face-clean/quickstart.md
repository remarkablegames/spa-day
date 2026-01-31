# Quickstart: Face Cleaning Tool

**Date**: 2026-01-31  
**Feature**: Face Cleaning Tool

## Overview

The Face Cleaning Tool allows players to clean dirt spots from a character's face using a round eraser tool before applying spa masks. This quickstart guide covers the essential implementation steps.

## Prerequisites

- Kaplay.js 3001.0.19
- TypeScript 5.9.3
- Existing game structure with scenes and game objects

## Implementation Steps

### 1. Create Cleaning Scene

```typescript
// src/scenes/cleaning.ts
export function cleaningScene() {
  return scene('cleaning', () => {
    // Scene initialization
    const character = add([
      sprite('character'),
      pos(center()),
      anchor('center'),
      area(),
      body(),
      'character',
    ])

    // Initialize cleaning system
    initializeCleaning()

    // Setup eraser tool
    setupEraserTool()

    // Generate dirt spots
    generateDirtSpots()
  })
}
```

### 2. Implement Eraser Tool

```typescript
// src/gameobjects/eraser.ts
export function createEraser() {
  const eraser = add([
    pos(mousePos()),
    circle(32), // Round eraser
    area({ shape: new Circle(vec2(0), 32) }),
    opacity(0.5),
    'eraser',
  ])

  // Follow mouse/touch
  onMouseMove(() => {
    eraser.pos = mousePos()
  })

  onTouchMove(() => {
    eraser.pos = mousePos()
  })

  return eraser
}
```

### 3. Create Dirt Spots

```typescript
// src/gameobjects/dirt-spot.ts
export function createDirtSpot(position: Vector2, points: number = 10) {
  const spot = add([
    pos(position),
    circle(4), // Small spot size
    area({ shape: new Circle(vec2(0), 4) }),
    color(BROWN),
    'dirt_spot',
    { points, isCleaned: false },
  ])

  // Collision with eraser
  spot.onCollide('eraser', () => {
    if (!spot.isCleaned) {
      cleanSpot(spot)
    }
  })

  return spot
}

function cleanSpot(spot: any) {
  spot.isCleaned = true

  // Add score
  addScore(spot.points)

  // Play sound
  play('clean')

  // Remove spot
  destroy(spot)

  // Check completion
  checkCleaningComplete()
}
```

### 4. Setup Cleaning Logic

```typescript
// src/constants/cleaning-config.ts
export const CLEANING_CONFIG = {
  eraser: {
    radius: 32,
    minRadius: 16,
    maxRadius: 48,
  },
  dirtSpots: {
    count: 50,
    minPoints: 5,
    maxPoints: 15,
    size: 4,
  },
  scoring: {
    pointsPerSpot: 10,
    completionBonus: 100,
  },
}
```

### 5. Initialize Cleaning System

```typescript
function initializeCleaning() {
  // Create eraser
  const eraser = createEraser()

  // Generate dirt spots on face
  generateDirtSpots()

  // Setup score display
  setupScoreDisplay()

  // Setup cleaning progress
  setupProgressTracker()
}

function generateDirtSpots() {
  const faceBounds = getFaceBounds()
  const spotCount = CLEANING_CONFIG.dirtSpots.count

  for (let i = 0; i < spotCount; i++) {
    const position = getRandomPositionInBounds(faceBounds)
    const points = rand(
      CLEANING_CONFIG.dirtSpots.minPoints,
      CLEANING_CONFIG.dirtSpots.maxPoints,
    )
    createDirtSpot(position, points)
  }
}
```

### 6. Add Score and Progress

```typescript
let currentScore = 0
let spotsCleaned = 0
let totalSpots = 0

function addScore(points: number) {
  currentScore += points
  spotsCleaned++
  updateScoreDisplay()
  updateProgress()
}

function updateScoreDisplay() {
  // Update score UI
  get('score_display')[0]?.text = `Score: ${currentScore}`
}

function updateProgress() {
  const progress = spotsCleaned / totalSpots
  // Update progress bar or visual indicator
  get('progress_bar')[0]?.width = progress * 200
}

function checkCleaningComplete() {
  if (spotsCleaned >= totalSpots) {
    // All spots cleaned!
    addScore(CLEANING_CONFIG.scoring.completionBonus)
    showCompletionMessage()

    // Transition to mask application
    setTimeout(() => {
      go('mask_application')
    }, 2000)
  }
}
```

## Asset Requirements

### Sprites

- `character.png` - Character face with visible areas
- `eraser.png` - Eraser tool cursor (optional, can use shape)
- `dirt-spot.png` - Dirt spot variations (2-4 types)

### Sounds

- `clean.mp3` - Satisfying cleaning sound
- `complete.mp3` - Completion sound (optional)

## Integration

### Add to Scene Index

```typescript
// src/scenes/index.ts
export { cleaningScene } from './cleaning'

// Add to game initialization
go('cleaning')
```

### Update Main Game

```typescript
// src/index.ts
import { cleaningScene } from './scenes/cleaning'

loadRoot('public/')
loadSprite('character', 'assets/sprites/character.png')
loadSound('clean', 'assets/sounds/clean.mp3')

// Start cleaning scene
cleaningScene()
go('cleaning')
```

## Testing

### Manual Testing Checklist

- [ ] Eraser follows mouse/touch movement
- [ ] Eraser has round collision detection
- [ ] Dirt spots appear on face areas
- [ ] Cleaning removes dirt spots
- [ ] Score increases when spots cleaned
- [ ] Visual feedback plays on cleaning
- [ ] Audio feedback plays on cleaning
- [ ] Progress tracking works
- [ ] Completion triggers correctly
- [ ] Performance maintains 60 FPS

### Performance Testing

- Test with maximum dirt spots (100)
- Verify FPS on target mobile devices
- Check memory usage during extended play
- Validate response time (<100ms)

## Next Steps

1. Implement mask application scene
2. Add visual polish and animations
3. Optimize for mobile performance
4. Add additional cleaning tools (future)
5. Integrate with scoring system

## Troubleshooting

### Common Issues

- **Eraser not following mouse**: Check `mousePos()` and event handlers
- **Collision not working**: Verify `area()` components and shapes
- **Performance issues**: Reduce dirt spot count or optimize collision detection
- **Assets not loading**: Check file paths and preload order

### Debug Tips

- Use Kaplay.js debug mode: `debug = true`
- Log collision events: `spot.onCollide("eraser", () => console.log("Hit"))`
- Monitor FPS: `debug.fps()` shows current frame rate
