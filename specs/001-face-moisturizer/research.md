# Research: Face Moisturizer Application

**Feature**: Face Moisturizer Application  
**Date**: 2026-02-01  
**Status**: Complete

## Research Summary

All technical requirements were clarified through analysis of the existing codebase. No external research needed - solution follows established patterns from the cleaning/cleansing system.

## Technical Decisions

### Decision: Reuse Eraser Tool Architecture

**Decision**: Use the existing `EraserTool` class from `src/gameobjects/eraser.ts` as the base pattern for `MoisturizerTool`

**Rationale**:

- Spec explicitly requires reusing "same enable/disable logic and drawing mechanics from cleanse tool" (FR-020, FR-021, FR-022)
- Eraser already implements: drag-based application, boundary constraints, real-time rendering, mouse/touch support
- DRY principle from Constitution VI - don't duplicate working code
- Proven performance characteristics (maintains 60 FPS)

**Alternatives considered**:

- Build from scratch with custom drawing - REJECTED: violates spec requirements and Constitution code reuse principle
- Use Kaplay's built-in drawing components - REJECTED: less control over coverage tracking than custom solution

### Decision: Mirror Cleaning State Manager Pattern

**Decision**: Create `MoisturizingStateManager` following the same structure as `CleaningStateManager`

**Rationale**:

- Cleaning system already handles: collision detection, progress tracking, completion checking, scoring integration
- Coverage calculation logic can be adapted from spot-based to zone-based tracking
- Event system already established through `CleaningEventManager`

**Alternatives considered**:

- Single unified state manager - REJECTED: would couple unrelated features, harder to maintain
- Scene-local state - REJECTED: harder to test, doesn't match existing architecture

### Decision: Zone-Based Coverage Tracking

**Decision**: Use spatial zones (grid or quadtree) for coverage calculation instead of pixel-perfect detection

**Rationale**:

- Performance: O(1) zone lookups vs O(n) pixel checks
- Accuracy within 5% is acceptable per success criteria (SC-004)
- Mobile-friendly: less CPU intensive for touch devices
- Aligns with "85% coverage threshold" requirement - approximate tracking is sufficient

**Alternatives considered**:

- Pixel-perfect canvas tracking - REJECTED: too CPU intensive, doesn't meet 60 FPS requirement
- Polygon intersection math - REJECTED: overkill for this use case, zone-based is simpler and faster

### Decision: Extend Existing Shop System

**Decision**: Add moisturizer types to existing `ShopManager` and `SHOP_ITEMS` instead of separate shop

**Rationale**:

- Spec requires integration with "existing game economy system" (FR-012, FR-013)
- Shop already supports: level requirements, cost thresholds, unlock mechanics
- Type system already supports tool/mask/cosmetic categories - can add 'moisturizer' type

**Alternatives considered**:

- Separate moisturizer shop - REJECTED: fragments player experience, duplicates shop UI code
- Direct purchase without shop - REJECTED: violates spec requirements for unlock/upgrade mechanics

### Decision: Integrate with Existing Scoring System

**Decision**: Extend `ScoringSystem` with moisturizer-specific calculations rather than separate scoring

**Rationale**:

- Spec requires "integration with existing spa session scoring system" (FR-019)
- Existing system supports: base scores, multipliers, bonus calculations
- Satisfaction scoring pattern already exists (calculateSatisfactionBonus)

**Alternatives considered**:

- Separate moisturizer scoring module - REJECTED: would need custom integration logic anyway
- Hardcoded scoring in scene - REJECTED: violates DRY, harder to test and balance

## Implementation Patterns

### From Cleaning System

1. **Tool Pattern** (`eraser.ts`):
   - Position tracking with bounds constraint
   - Smooth movement interpolation
   - Input handling abstraction (mouse/touch)
   - Activation/deactivation lifecycle

2. **State Management** (`cleaning-state.ts`):
   - Progress tracking (cleanedSpots → coveredZones)
   - Collision detection integration
   - Completion threshold checking
   - Event emission on state changes

3. **Event System** (`cleaning.ts`, `cleaning-types.ts`):
   - Typed event map pattern
   - Singleton event manager
   - Specific event emitters for each action type

### New Patterns Required

1. **Coverage Zone System**:
   - Grid-based face subdivision
   - Zone activation on tool overlap
   - Percentage calculation from active/total zones

2. **Moisturizer Type System**:
   - Type definitions for Basic/Premium/Luxury
   - Color mapping (white/light blue/lavender)
   - Multiplier definitions (1x/1.2x/1.5x)

3. **Trail Rendering**:
   - Continuous path drawing (different from discrete spot cleaning)
   - Kaplay component composition for cream texture effect
   - Color tinting by moisturizer type

## Technology Stack Confirmation

All technologies already in use:

- ✅ TypeScript 5.9.3 with strict mode
- ✅ Kaplay.js 3001.0.19 (locked version)
- ✅ Vite 7.3.1 for builds
- ✅ ESLint + Prettier for code quality

No new dependencies required.

## Risk Assessment

| Risk                            | Likelihood | Mitigation                                               |
| ------------------------------- | ---------- | -------------------------------------------------------- |
| Coverage calculation inaccurate | Low        | Use sufficient zones (50-100), test on actual face asset |
| Touch input lag                 | Low        | Reuse proven eraser input handling, test on mobile       |
| Performance drop with trails    | Medium     | Limit trail segments, use object pooling, cap max trails |
| Shop integration complexity     | Low        | Extend existing patterns, minimal new code               |

## Success Criteria Verification

All success criteria can be met with selected approach:

- SC-001 (30-90s completion): Zone-based tracking enables fast completion detection
- SC-002 (<50ms latency): Reuses performant eraser input handling
- SC-003 (90% first-time success): Intuitive drag mechanic, clear coverage feedback
- SC-004 (5% accuracy): 50-100 zones provides ~2-4% accuracy
- SC-005 (mouse/touch): Inherits from eraser tool
- SC-006 (4/5 satisfaction): Cream texture rendering, immediate visual feedback
- SC-007 (seamless scoring): Uses existing scoring integration points
- SC-008 (<100ms calculation): Zone counting is O(1) with bitmasks
