# Task Breakdown: Face Moisturizer Application

**Feature**: Face Moisturizer Application  
**Branch**: `001-face-moisturizer`  
**Generated**: 2026-02-01  
**Input**: spec.md, plan.md, data-model.md, contracts/, quickstart.md

## Task Summary

| Phase     | Description                         | Task Count | Independent Test                  |
| --------- | ----------------------------------- | ---------- | --------------------------------- |
| Phase 1   | Setup                               | 3          | N/A                               |
| Phase 2   | Foundational                        | 5          | Type checking passes              |
| Phase 3   | User Story 1 - Basic Application    | 6          | Drag to see moisturizer trail     |
| Phase 4   | User Story 2 - Coverage Feedback    | 4          | Progress bar updates in real-time |
| Phase 5   | User Story 3 - Completion & Rewards | 6          | Score calculated at 85% coverage  |
| Phase 6   | Polish & Integration                | 4          | Full session flow works           |
| **Total** |                                     | **28**     |                                   |

## Dependency Graph

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational)
    ↓
Phase 3 (US1: Basic Application)
    ↓
Phase 4 (US2: Coverage Feedback)
    ↓
Phase 5 (US3: Completion)
    ↓
Phase 6 (Polish)
```

**Key Dependencies**:

- MoisturizerTool requires moisturizing-types.ts (T006) ✓ blocking
- CoverageZone requires moisturizing-types.ts (T006) ✓ blocking
- MoisturizingStateManager requires CoverageZone (T008) ✓ blocking
- Trail rendering requires MoisturizerTool (T007) ✓ blocking
- Shop integration requires types and config (T006, T004) ✓ blocking
- Scene integration requires all US1-3 components ✓ blocking

## Phase 1: Setup

**Goal**: Initialize feature development environment and reference existing patterns.

- [ ] T001 Review existing eraser.ts and cleaning-state.ts patterns to understand tool architecture and state management approach in src/gameobjects/eraser.ts and src/systems/cleaning-state.ts
- [ ] T002 Verify development environment by running npm start and confirming server starts at http://localhost:5173
- [ ] T003 Run lint and typecheck to establish baseline: npm run lint:fix && npm run lint:tsc

## Phase 2: Foundational

**Goal**: Create shared types, configuration, and event system used by all user stories.

**Independent Test**: All TypeScript compiles without errors, types are properly exported.

- [ ] T004 [P] Create MOISTURIZING_CONFIG constant with zone settings, tool settings, visual settings, scoring thresholds, and color definitions in src/constants/moisturizing-config.ts
- [ ] T005 [P] Create MoisturizerShopItem type definition extending ShopItem with moisturizer-specific fields (tier, color, satisfactionMultiplier) in src/types/shop.ts (extend existing)
- [ ] T006 Create core type definitions including Position, BoundingBox, MoisturizerTier, CoverageZone, MoisturizerState, SatisfactionScore, and all event types in src/events/moisturizing-types.ts
- [ ] T007 [P] Create MoisturizingEventManager singleton following the CleaningEventManager pattern with all moisturizing event types in src/events/moisturizing.ts
- [ ] T008 Export all moisturizing types and events from src/events/index.ts to make them available to other modules

## Phase 3: User Story 1 - Basic Moisturizer Application (P1)

**Story Goal**: Players can drag to apply moisturizer cream with real-time visual feedback.

**Independent Test**: Load spa game scene, drag across face area, see moisturizer trail appear in real-time following cursor path. Trail should stay within face boundaries.

**Acceptance Scenarios**:

1. Given player views face, when they click/touch and drag, then moisturizer appears along drag path in real-time
2. Given player is applying moisturizer, when they stop dragging, then moisturizer remains visible
3. Given player is applying moisturizer, when they drag outside face boundaries, then no moisturizer appears outside

- [ ] T009 [P] [US1] Create CoverageZone class with bounds-based collision detection for tool overlap checking in src/gameobjects/coverage-zone.ts
- [ ] T010 [US1] Create MoisturizerTool class mirroring EraserTool with position tracking, bounds constraint, smoothing, input handling (mouse/touch), and activation lifecycle in src/gameobjects/moisturizer-tool.ts
- [ ] T011 [P] [US1] Create MoisturizerTrail class for rendering cream texture along drag path using Kaplay components (rect, pos, color, opacity) with segment limiting for performance in src/gameobjects/moisturizer-trail.ts
- [ ] T012 [US1] Create MoisturizingStateManager class with zone generation from face bounds, coverage tracking, progress calculation, and tool integration in src/systems/moisturizing-state.ts
- [ ] T013 [P] [US1] Add moisturizer items (basic, premium, luxury) to SHOP_ITEMS in src/constants/shop-inventory.ts with proper requirements and tier metadata
- [ ] T014 [US1] Create minimal moisturizer step integration in spa-game.ts to verify tool, trail, and state manager work together end-to-end in src/scenes/spa-game.ts (basic integration only)

## Phase 4: User Story 2 - Coverage Feedback and Progress (P2)

**Story Goal**: Players receive visual feedback on coverage and see progress updates.

**Independent Test**: Apply moisturizer to portions of face, observe distinct visual difference between covered/uncovered areas, see progress percentage update in real-time.

**Acceptance Scenarios**:

1. Given moisturizer applied to portion of face, when player views face, then moisturized areas are visually distinct
2. Given player is applying moisturizer, when coverage changes, then progress indicator updates showing percentage
3. Given player has applied moisturizer, when they view areas, then they can distinguish covered from uncovered regions

**Dependencies**: Requires US1 completion (tool, state manager, trail working)

- [ ] T015 [US2] Add progress UI component showing coverage percentage with visual progress bar in spa game scene in src/scenes/spa-game.ts (progress display)
- [ ] T016 [US2] Implement visual distinction for covered zones (shinier/different color overlay) using Kaplay components when zones are activated in src/gameobjects/coverage-zone.ts (visual feedback)
- [ ] T017 [P] [US2] Create zone visualization debug mode (optional) to help test coverage accuracy - show grid overlay on face in src/gameobjects/coverage-zone.ts (debug visualization)
- [ ] T018 [US2] Add real-time progress updates to UI when coverage changes, emitting progress_updated events in src/systems/moisturizing-state.ts (progress events)

## Phase 5: User Story 3 - Treatment Completion and Rewards (P3)

**Story Goal**: Treatment completes at 85% coverage with scoring and session conclusion.

**Independent Test**: Achieve 85% coverage, observe completion trigger with visual/audio feedback, see calculated score with star rating (3-5 stars based on coverage), session transitions to results.

**Acceptance Scenarios**:

1. Given player applied moisturizer to at least 85% of face, when they reach threshold, then completion state triggers with positive feedback
2. Given treatment is complete, when completion triggered, then spa session concludes and displays summary
3. Given player has not reached 85% coverage, when they attempt to proceed, then they receive guidance to continue

**Dependencies**: Requires US2 completion (progress tracking working)

- [ ] T019 [P] [US3] Extend ScoringSystem with calculateMoisturizerScore method implementing star rating logic (85-94%=3★, 95-99%=4★, 100%=5★) and tier multipliers (basic=1x, premium=1.2x, luxury=1.5x) in src/systems/scoring.ts
- [ ] T020 [US3] Add completion detection logic in MoisturizingStateManager that triggers when coverage >= 85% and emits completion events in src/systems/moisturizing-state.ts (completion detection)
- [ ] T021 [US3] Create completion feedback system with visual celebration effects (particles, glow) and audio feedback using existing sound system in src/systems/visual-feedback.ts or new file src/systems/moisturizer-feedback.ts
- [ ] T022 [P] [US3] Implement satisfaction score calculation integration with spa session scoring, ensuring no double-counting and <100ms calculation time in src/systems/scoring.ts (session integration)
- [ ] T023 [US3] Add session completion logic that transitions from moisturizer step to results screen with final score display in src/scenes/spa-game.ts (session completion)
- [ ] T024 [US3] Create incomplete coverage guidance system that shows hint/prompt when player attempts to proceed before 85% threshold in src/scenes/spa-game.ts (completion guidance)

## Phase 6: Polish & Cross-Cutting Concerns

**Goal**: Final integration, edge case handling, performance optimization, and shop integration polish.

**Independent Test**: Full treatment flow works end-to-end, edge cases handled (rapid input, overlapping coverage, boundary constraints), shop shows moisturizer unlocks, mobile touch works smoothly.

- [ ] T025 [P] Handle edge cases: rapid input (batch updates), overlapping coverage (idempotent zone.cover()), boundary constraints (soft feedback), minimum movement thresholds (5px), repetitive patterns (ignore redundant coverage) in src/systems/moisturizing-state.ts and src/gameobjects/moisturizer-tool.ts (edge case handling)
- [ ] T026 [P] Optimize performance: cap trail segments at 100, limit zone checks to O(1) with spatial indexing, ensure 60 FPS during drag operations, pool trail segment objects in src/gameobjects/moisturizer-trail.ts and src/systems/moisturizing-state.ts (performance optimization)
- [ ] T027 Integrate moisturizer selection UI before treatment begins, showing only unlocked moisturizers with proper visual indicators for locked items in src/scenes/spa-game.ts or src/scenes/shop.ts (moisturizer selection UI)
- [ ] T028 Final verification: run npm run lint:fix && npm run lint:tsc, manual test on desktop and mobile, verify all success criteria met (SC-001 through SC-008) in all modified files (final verification)

## Parallel Execution Opportunities

### Within Phase 2 (Foundational)

Tasks T004, T005, T007 can be done in parallel (different files, no dependencies):

```bash
# Terminal 1: Config and types
# T004: Create src/constants/moisturizing-config.ts
# T006: Create src/events/moisturizing-types.ts

# Terminal 2: Event manager
# T007: Create src/events/moisturizing.ts
# T008: Update src/events/index.ts

# Terminal 3: Shop type extension
# T005: Extend src/types/shop.ts
```

### Within Phase 3 (User Story 1)

Tasks T009, T011, T013 can be done in parallel:

```bash
# Terminal 1: Zone and Tool (after T006 complete)
# T009: Create src/gameobjects/coverage-zone.ts
# T010: Create src/gameobjects/moisturizer-tool.ts

# Terminal 2: Trail rendering (after T006 complete)
# T011: Create src/gameobjects/moisturizer-trail.ts

# Terminal 3: Shop items (after T004, T005 complete)
# T013: Extend src/constants/shop-inventory.ts
```

### Within Phase 5 (User Story 3)

Tasks T019, T021, T022 can be done in parallel:

```bash
# Terminal 1: Scoring (after T018 complete)
# T019: Extend src/systems/scoring.ts with calculateMoisturizerScore
# T022: Session scoring integration

# Terminal 2: Feedback effects (after T018 complete)
# T021: Create visual/audio feedback system

# Terminal 3: Completion logic (after T018 complete)
# T020: Add completion detection to state manager
```

## Implementation Strategy

### MVP First (Recommended)

**MVP Scope**: Complete Phase 1-3 only (User Story 1)

This delivers the core gameplay mechanic: players can drag to apply moisturizer and see visual feedback. This is independently testable and provides immediate value.

**MVP Task List**:

- T001-T003: Setup
- T004-T008: Foundational types and events
- T009-T014: Basic tool, trail, and state management

**MVP Success Criteria**:

- SC-001: 30-90s completion time (tool responsive)
- SC-002: <50ms input latency (smooth drag)
- SC-003: 90% first-time success (intuitive)
- SC-005: Mouse/touch controls work
- SC-006: Satisfying drawing mechanic

### Incremental Delivery

**Sprint 1 (Days 1-2)**: Setup + Foundational (T001-T008)
**Sprint 2 (Days 3-4)**: User Story 1 - Basic Application (T009-T014)
**Sprint 3 (Days 5-6)**: User Story 2 - Coverage Feedback (T015-T018)
**Sprint 4 (Days 7-8)**: User Story 3 - Completion (T019-T024)
**Sprint 5 (Day 9)**: Polish + Shop Integration (T025-T028)

### Critical Path

The longest dependency chain:

```
T001 (Review patterns)
  → T004 (Config)
    → T006 (Types)
      → T009 (CoverageZone)
        → T012 (StateManager)
          → T014 (Basic Integration)
            → T015 (Progress UI)
              → T019 (Scoring)
                → T028 (Final Verification)
```

**Critical Path Length**: 10 tasks
**Parallel Path Opportunity**: T005, T007, T008, T010, T011, T013 can run in parallel with critical path

## Success Criteria Mapping

| Success Criteria               | Validated By Task                         |
| ------------------------------ | ----------------------------------------- |
| SC-001: 30-90s completion      | T014 (integration test)                   |
| SC-002: <50ms latency          | T010 (tool input handling)                |
| SC-003: 90% first-time success | T028 (user testing)                       |
| SC-004: 5% coverage accuracy   | T009 (zone collision), T012 (calculation) |
| SC-005: Mouse/touch controls   | T010 (input handling)                     |
| SC-006: 4/5 satisfaction       | T011 (trail rendering), T021 (feedback)   |
| SC-007: Seamless scoring       | T019, T022 (scoring integration)          |
| SC-008: <100ms calculation     | T020 (completion check)                   |

## File Modification Summary

### New Files (10 files)

1. `src/constants/moisturizing-config.ts` (T004)
2. `src/events/moisturizing-types.ts` (T006)
3. `src/events/moisturizing.ts` (T007)
4. `src/gameobjects/coverage-zone.ts` (T009)
5. `src/gameobjects/moisturizer-tool.ts` (T010)
6. `src/gameobjects/moisturizer-trail.ts` (T011)
7. `src/systems/moisturizing-state.ts` (T012)
8. `src/systems/moisturizer-feedback.ts` (T021 - optional, can use visual-feedback.ts)

### Modified Files (5 files)

1. `src/events/index.ts` (T008) - Export new types
2. `src/types/shop.ts` (T005) - Extend ShopItem type
3. `src/constants/shop-inventory.ts` (T013) - Add moisturizer items
4. `src/systems/scoring.ts` (T019, T022) - Add moisturizer scoring
5. `src/scenes/spa-game.ts` (T014, T015, T023, T024, T027) - Add moisturizer step

**Total**: 15 files affected (8 new, 5 modified, 2 optional)

## Risk Mitigation

| Risk                            | Mitigation Task                                               |
| ------------------------------- | ------------------------------------------------------------- |
| Coverage calculation inaccurate | T017 (debug visualization), T009 (sufficient zones)           |
| Touch input lag                 | T010 (reuse eraser patterns), T026 (performance optimization) |
| Performance drop with trails    | T011 (segment capping), T026 (object pooling)                 |
| Shop integration complexity     | T005, T013 (follow existing patterns)                         |
| Double-counting coverage        | T009 (idempotent cover() method)                              |
| Memory leaks                    | T012 (proper cleanup), T011 (trail destruction)               |
