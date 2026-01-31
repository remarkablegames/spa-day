# Research: Face Cleaning Tool

**Date**: 2026-01-31  
**Feature**: Face Cleaning Tool  
**Status**: Complete

## Kaplay.js Circular Collision Detection

**Decision**: Use native Kaplay.js `area()` component with Circle shape  
**Rationale**: Kaplay.js 3001.0.19 includes built-in circular collision detection using `new Circle()` constructor. This provides optimized spatial hash grid performance and integrates seamlessly with existing collision events.  
**Alternatives considered**:

- Custom pixel-perfect collision (overkill, performance impact)
- Rectangle collision (doesn't match round eraser shape)

## Eraser Tool Implementation

**Decision**: Round eraser using Kaplay.js Circle collision area  
**Rationale**: Round shape provides natural omnidirectional cleaning motion and is most intuitive for mobile touch interactions. Circle collision matches visual shape perfectly.  
**Alternatives considered**:

- Square eraser (less natural for cleaning motions)
- Oval eraser (directional bias, more complex)

## Dirt Spot Display

**Decision**: Individual small spots (2-4px) using sprite objects  
**Rationale**: Individual spots provide clear visual feedback and satisfying one-to-one cleaning interaction. Each spot can be independently tracked for scoring and removal.  
**Alternatives considered**:

- Texture overlay (less granular feedback)
- Large patches (reserved for future tools)

## Scoring System

**Decision**: Points per spot cleaned with immediate feedback  
**Rationale**: Immediate scoring provides gratification and clear progression. Each cleaned spot triggers score increment and visual/audio feedback.  
**Alternatives considered**:

- Completion bonus only (delayed gratification)
- Time-based scoring (adds complexity)

## Performance Considerations

**Decision**: Limit to ~50-100 dirt spots maximum  
**Rationale**: Maintains 60 FPS target while providing sufficient gameplay density. Kaplay.js spatial hashing handles this volume efficiently.  
**Optimizations**:

- Object pooling for dirt spots
- Efficient collision detection with spatial hash
- Minimal visual feedback overhead

## Mobile-First Controls

**Decision**: Touch/mouse input with eraser following cursor position  
**Rationale**: Direct manipulation provides intuitive control. Eraser position updates in real-time following touch/mouse movement.  
**Implementation**: Use Kaplay.js `onMouseMove()` and `onTouchMove()` events

## Asset Requirements

**Decision**: Minimal sprite assets with sound feedback  
**Rationale**: Keeps bundle size small while providing satisfying feedback.  
**Required assets**:

- Character face sprite (existing)
- Eraser tool cursor (small, simple)
- Dirt spot sprites (2-4 variations)
- Cleaning sound effect (short, satisfying)

## Integration Points

**Decision**: Extend existing scene system with new cleaning scene  
**Rationale**: Maintains architectural consistency while isolating cleaning logic.  
**Integration**:

- New `cleaning.ts` scene
- Extend existing game object base classes
- Use existing event system
- Follow current asset loading patterns
