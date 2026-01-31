# Research: Spa Face Mask Game

**Phase**: 0 - Outline & Research  
**Date**: 2026-01-30  
**Feature**: Spa Face Mask Game

## Research Findings

### Kaplay.js Entity Component Pattern

**Decision**: Use Kaplay.js entity-component system for game objects  
**Rationale**: Kaplay.js provides built-in entity management with components, aligns with constitution requirements, and simplifies game object creation and interaction  
**Alternatives considered**: Custom class hierarchy (rejected due to complexity), plain objects (rejected due to lack of built-in features)

### Touch Input Implementation

**Decision**: Use Kaplay.js pointer events and touch detection  
**Rationale**: Kaplay.js handles cross-platform touch/mouse input automatically, provides gesture support, and maintains mobile-first design principle  
**Alternatives considered**: Custom touch library (rejected due to performance impact), browser touch events only (rejected due to limited functionality)

### Game State Management

**Decision**: Use Kaplay.js scene system with local storage persistence  
**Rationale**: Scene system provides natural state separation, local storage meets static deployment requirement, and maintains browser-only operation  
**Alternatives considered**: External state management library (rejected due to complexity), in-memory only (rejected due to persistence requirement)

### Asset Loading Strategy

**Decision**: Use Kaplay.js load() with sprite sheets and sound bundles  
**Rationale**: Optimized for web delivery, supports preloading, maintains 60 FPS performance target, and follows Kaplay.js conventions  
**Alternatives considered**: Individual asset loading (rejected due to performance), external CDN (rejected due to static deployment requirement)

### Scoring System Architecture

**Decision**: Event-driven scoring with Kaplay.js custom events  
**Rationale**: Decouples scoring from game logic, allows easy modification, and integrates well with entity system  
**Alternatives considered**: Direct score updates (rejected due to coupling), external scoring library (rejected due to complexity)

### Progression and Unlock System

**Decision**: Local storage-based progression with achievement tracking  
**Rationale**: Meets static deployment requirement, provides persistent progression, and enables offline gameplay  
**Alternatives considered**: Server-side progression (rejected due to static requirement), session-only progression (rejected due to user experience)

### Performance Optimization

**Decision**: Object pooling for masks, sprite optimization, and frame rate monitoring  
**Rationale**: Maintains 60 FPS target, manages browser memory limits, and provides performance feedback  
**Alternatives considered**: Dynamic loading (rejected due to complexity), reduced visual quality (rejected due to user experience)

## Constitution Compliance Verification

All technical decisions align with constitution requirements:

- **Game-First**: All decisions serve gameplay experience
- **Kaplay.js Native**: Uses native Kaplay.js patterns and conventions
- **Performance First**: Maintains 60 FPS and browser memory limits
- **Static Web**: No server-side dependencies, browser-only operation
- **Mobile-First**: Touch controls and mobile optimization prioritized

## Technical Architecture Summary

The spa face mask game will use Kaplay.js entity-component system with scene-based gameplay flow. Touch input handled through native Kaplay.js pointer events. Game state persisted in local storage for static deployment. Assets optimized for web delivery with sprite sheets and sound bundles. Event-driven systems for scoring and progression maintain clean separation of concerns while meeting all performance and mobile-first requirements.
