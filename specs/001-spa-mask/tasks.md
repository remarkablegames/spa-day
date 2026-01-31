---
description: 'Task list template for feature implementation'
---

# Tasks: Spa Face Mask Game

**Input**: Design documents from `/specs/001-spa-mask/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Manual gameplay testing is REQUIRED for all game features - automated testing is optional but encouraged for utility functions.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each gameplay mechanic.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Game project**: `src/` at repository root with Kaplay.js structure
- **Game structure**: `src/scenes/`, `src/gameobjects/`, `src/constants/`, `src/events/`
- **Assets**: `public/sprites/`, `public/sounds/`
- **Testing**: Manual gameplay testing (automated testing optional in `tests/` if needed)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure per implementation plan
- [x] T002 Initialize TypeScript project with Kaplay.js dependencies
- [x] T003 [P] Configure linting and formatting tools

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Setup Kaplay.js game engine and basic scene management
- [x] T005 [P] Implement touch input handling system in src/systems/input.ts
- [x] T006 [P] Setup asset management system in src/systems/assets.ts
- [x] T007 Create base game objects that all stories depend on in src/gameobjects/
- [x] T008 Configure game constants in src/constants/game-config.ts
- [x] T009 Setup local storage persistence system

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Apply Face Masks (Priority: P1) 🎯 MVP

**Goal**: Player applies different face masks to a character's face to create spa treatments and achieve relaxation goals

**Independent Test**: Can be fully tested by selecting and applying face masks to a character and observing the visual and score effects

### Implementation for User Story 1

- [x] T010 [P] [US1] Create Character entity in src/gameobjects/character.ts with face areas using geometric shapes
- [x] T011 [P] [US1] Create FaceMask entity in src/gameobjects/mask.ts with geometric shape visuals
- [x] T012 [US1] Create TreatmentSession entity in src/gameobjects/treatment.ts
- [x] T013 [US1] Implement main gameplay scene in src/scenes/game.ts (depends on T010, T011, T012)
- [x] T014 [US1] Add mask selection and placement logic in src/scenes/game.ts
- [x] T015 [US1] Implement treatment timer and completion logic
- [x] T016 [US1] Add visual feedback for mask application using geometric shapes
- [x] T017 [US1] Implement basic scoring system in src/systems/scoring.ts
- [x] T018 [US1] Add touch controls for mask placement in src/systems/input.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Mask Collection & Selection (Priority: P2)

**Goal**: Player unlocks and collects different types of face masks with varying effects and properties

**Independent Test**: Can be fully tested by browsing the mask collection and unlocking new masks through gameplay

### Implementation for User Story 2

- [ ] T019 [P] [US2] Create mask type definitions in src/constants/mask-types.ts
- [ ] T020 [US2] Implement mask collection scene in src/scenes/collection.ts
- [ ] T021 [US2] Create progression system in src/systems/progression.ts
- [ ] T022 [US2] Add mask unlock logic based on treatment completion
- [ ] T023 [US2] Implement mask selection UI in collection scene
- [ ] T024 [US2] Integrate collection scene with main game flow
- [ ] T025 [US2] Add visual feedback for unlocked masks

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Customer Satisfaction & Scoring (Priority: P3)

**Goal**: Player earns points and feedback based on mask combinations and treatment quality

**Independent Test**: Can be fully tested by completing treatments and observing score changes and customer reactions

### Implementation for User Story 3

- [ ] T026 [P] [US3] Enhance scoring system with satisfaction calculations in src/systems/scoring.ts
- [ ] T027 [US3] Create treatment results scene in src/scenes/results.ts
- [ ] T028 [US3] Implement character satisfaction feedback system
- [ ] T029 [US3] Add score display and animations
- [ ] T030 [US3] Implement customer return logic for high satisfaction
- [ ] T031 [US3] Add visual and audio feedback for scoring events

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T032 [P] Add sound effects for mask application and completion
- [ ] T033 [P] Implement particle effects for mask application
- [ ] T034 [P] Performance optimization across all scenes
- [ ] T035 Add background spa music
- [ ] T036 [P] Mobile responsiveness optimization
- [ ] T037 Add loading screen and asset preloading
- [ ] T038 Implement pause/resume functionality
- [ ] T039 Add game over and restart functionality
- [ ] T040 Asset preparation for external image swapping capability

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all models for User Story 1 together:
Task: "Create Character entity in src/gameobjects/character.ts with face areas using geometric shapes"
Task: "Create FaceMask entity in src/gameobjects/mask.ts with geometric shape visuals"
Task: "Create TreatmentSession entity in src/gameobjects/treatment.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Manual gameplay testing required after each user story completion
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
