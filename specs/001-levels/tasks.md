---
description: 'Task list template for feature implementation'
---

# Tasks: Game Levels

**Input**: Design documents from `/specs/001-levels/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Manual gameplay testing is REQUIRED for all game features - automated testing is optional but encouraged for utility functions.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each gameplay mechanic.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Game project**: `src/` at repository root with Kaplay.js structure
- **Game structure**: `src/scenes/`, `src/gameobjects/`, `src/constants/`, `src/events/`, `src/systems/`
- **Shared utilities**: `src/utils/` for common patterns and DRY compliance
- **Assets**: `public/sprites/`, `public/sounds/`
- **Testing**: Manual gameplay testing (automated testing optional in `tests/` if needed)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create TypeScript interfaces for level system in src/types/level.ts
- [x] T002 [P] Create directory structure for systems in src/systems/
- [x] T003 [P] Create directory structure for new scenes in src/scenes/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Implement localStorage storage manager in src/utils/storage.ts
- [x] T005 [P] Create level configuration constants in src/constants/level-config.ts
- [x] T006 [P] Update game constants to include level system in src/constants/game-config.ts
- [x] T007 Create base system manager interface in src/systems/base.ts
- [x] T008 [P] Update scene constants to include new scenes in src/constants/index.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Progressive Difficulty Levels (Priority: P1) 🎯 MVP

**Goal**: Players advance through increasingly challenging treatment sessions with level progression mechanics

**Independent Test**: Complete level 1 with 70%+ satisfaction and observe automatic advancement to level 2

### Implementation for User Story 1

- [ ] T009 [US1] Implement LevelManager class in src/systems/levelmanager.ts
- [ ] T010 [US1] Create level progress tracking UI in src/gameobjects/levelprogress.ts
- [ ] T011 [US1] Implement level completion validation in src/systems/levelmanager.ts
- [ ] T012 [US1] Add level progression to spa-game scene in src/scenes/spa-game.ts
- [ ] T013 [US1] Create level selection scene in src/scenes/level-select.ts
- [ ] T014 [US1] Add level indicators to game UI in src/scenes/spa-game.ts
- [ ] T015 [US1] Implement level retry functionality in src/systems/levelmanager.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Level-Specific Customer Types (Priority: P2)

**Goal**: Each level features different customer characters with unique preferences and requirements

**Independent Test**: Play level 3 and observe customer with advanced preferences different from level 1

### Implementation for User Story 2

- [ ] T016 [P] [US2] Create customer template definitions in src/constants/customer-templates.ts
- [ ] T017 [US2] Enhance Character class for level-specific customers in src/gameobjects/character.ts
- [ ] T018 [US2] Implement customer personality system in src/gameobjects/character.ts
- [ ] T019 [US2] Add customer feedback system in src/gameobjects/character.ts
- [ ] T020 [US2] Integrate customer templates with LevelManager in src/systems/levelmanager.ts
- [ ] T021 [US2] Add customer-specific UI elements in src/scenes/spa-game.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Level Unlock System (Priority: P3)

**Goal**: Players unlock new levels by meeting performance criteria with optional challenges

**Independent Test**: Score 1000+ points and observe next level unlock notification

### Implementation for User Story 3

- [ ] T022 [P] [US3] Create unlock criteria definitions in src/constants/unlock-criteria.ts
- [ ] T023 [US3] Implement challenge system in src/systems/challenges.ts
- [ ] T024 [US3] Add unlock validation to LevelManager in src/systems/levelmanager.ts
- [ ] T025 [US3] Create unlock notification UI in src/gameobjects/unlock-notification.ts
- [ ] T026 [US3] Implement bonus level system in src/systems/levelmanager.ts
- [ ] T027 [US3] Add unlock animations and feedback in src/scenes/level-select.ts

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: User Story 4 - Shop Inventory System (Priority: P2)

**Goal**: Players earn currency from scores and purchase/upgrade masks between levels

**Independent Test**: Complete treatment, access shop, purchase item, and verify it's available in next treatment

### Implementation for User Story 4

- [ ] T028 [P] [US4] Implement EconomyManager class in src/systems/economy.ts
- [ ] T029 [P] [US4] Create shop inventory definitions in src/constants/shop-inventory.ts
- [ ] T030 [US4] Implement ShopManager class in src/systems/shop.ts
- [ ] T031 [US4] Create shop scene interface in src/scenes/shop.ts
- [ ] T032 [US4] Implement shop UI components in src/gameobjects/shop-ui.ts
- [ ] T033 [US4] Add currency conversion to treatment completion in src/scenes/spa-game.ts
- [ ] T034 [US4] Implement purchase validation and feedback in src/systems/shop.ts
- [ ] T035 [US4] Add shop navigation between levels in src/scenes/spa-game.ts
- [ ] T036 [US4] Create upgrade system for masks in src/systems/shop.ts
- [ ] T037 [US4] Add inventory persistence in src/systems/economy.ts

**Checkpoint**: Shop system should be fully functional and integrated with level progression

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T038 [P] Create manual test documentation for level progression in tests/manual/level-progression.md
- [ ] T039 [P] Create manual test documentation for shop functionality in tests/manual/shop-functionality.md
- [ ] T040 [P] Add error handling for corrupted save data in src/utils/storage.ts
- [ ] T041 [P] Optimize localStorage operations with debouncing in src/utils/storage.ts
- [ ] T042 Add performance monitoring for level transitions in src/systems/levelmanager.ts
- [ ] T043 [P] Add loading states for scene transitions in src/scenes/level-select.ts
- [ ] T044 [P] Add loading states for shop data in src/scenes/shop.ts
- [ ] T045 Implement responsive UI scaling for mobile devices in src/scenes/shop.ts
- [ ] T046 [P] Add sound effects for level completion in src/scenes/spa-game.ts
- [ ] T047 [P] Add sound effects for shop transactions in src/scenes/shop.ts
- [ ] T048 Create integration tests for level flow in tests/integration/level-flow.test.ts
- [ ] T049 Validate quickstart.md implementation examples
- [ ] T050 Performance validation for 60 FPS target on mobile devices

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Integrates with US1 but independently testable
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 but independently testable

### Within Each User Story

- Models/constants before services
- Services before scenes
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Constants and interfaces within stories marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all constants/interfaces for User Story 1 together:
Task: "Create TypeScript interfaces for level system in src/types/level.ts"
Task: "Create level configuration constants in src/constants/level-config.ts"

# Launch system and scene components in parallel:
Task: "Implement LevelManager class in src/systems/levelmanager.ts"
Task: "Create level selection scene in src/scenes/level-select.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test level progression independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 4 → Test independently → Deploy/Demo
5. Add User Story 3 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Level Progression)
   - Developer B: User Story 2 (Customer Types)
   - Developer C: User Story 4 (Shop System)
3. User Story 3 can be picked up when any developer becomes available
4. Stories complete and integrate independently

---

## Task Summary

- **Total Tasks**: 50
- **Setup Phase**: 3 tasks
- **Foundational Phase**: 5 tasks (CRITICAL)
- **User Story 1**: 7 tasks (MVP)
- **User Story 2**: 6 tasks
- **User Story 3**: 6 tasks
- **User Story 4**: 10 tasks
- **Polish Phase**: 13 tasks

**Parallel Opportunities**: 23 tasks marked [P] for parallel execution
**Independent Test Criteria**: Each user story has explicit independent test scenarios
**MVP Scope**: User Story 1 (Progressive Difficulty Levels) - 15 total tasks including setup

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Manual gameplay testing REQUIRED per constitution
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Avoid**: vague tasks, same file conflicts, cross-story dependencies that break independence
- **Code Reuse**: Extract common patterns into shared utilities, eliminate duplication across systems
- **TypeScript Typing**: Use explicit types for all variables and functions, `any` type is PROHIBITED
- **Performance First**: Maintain 60 FPS target, validate on mobile devices
- **Kaplay.js Native**: Use scene management and entity patterns per constitution
