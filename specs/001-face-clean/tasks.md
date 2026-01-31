---
description: 'Task list template for feature implementation'
---

# Tasks: Face Cleaning Tool

**Input**: Design documents from `/specs/001-face-clean/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, contracts/

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

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create cleaning scene structure in src/scenes/cleaning.ts
- [ ] T002 [P] Create cleaning constants in src/constants/cleaning-config.ts
- [ ] T003 [P] Create cleaning events in src/events/cleaning.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create base eraser tool game object in src/gameobjects/eraser.ts
- [ ] T005 Create base dirt spot game object in src/gameobjects/dirt-spot.ts
- [ ] T006 Create character game object with face regions in src/gameobjects/character.ts
- [ ] T007 Create cleaning state management system in src/systems/cleaning-state.ts
- [ ] T008 Setup asset loading for cleaning sprites and sounds in public/assets/
- [ ] T009 Create base cleaning scene with initialization in src/scenes/cleaning.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Face Cleaning Preparation (Priority: P1) 🎯 MVP

**Goal**: Player can clean the character's face using an erase tool before applying a spa mask

**Independent Test**: Use the erase tool on the face area and observe the cleaning effect, delivering a satisfying preparation experience

### Implementation for User Story 1

- [ ] T010 [P] [US1] Implement EraserTool class with round collision detection in src/gameobjects/eraser.ts
- [ ] T011 [P] [US1] Implement DirtSpot class with cleaning state in src/gameobjects/dirt-spot.ts
- [ ] T012 [P] [US1] Create FaceRegion class with cleanliness tracking in src/gameobjects/character.ts
- [ ] T013 [US1] Implement collision detection between eraser and dirt spots in src/systems/cleaning-state.ts
- [ ] T014 [US1] Add cleaning logic and score system in src/systems/cleaning-state.ts
- [ ] T015 [US1] Implement cleaning scene initialization in src/scenes/cleaning.ts
- [ ] T016 [US1] Add visual feedback for cleaning actions in src/gameobjects/dirt-spot.ts
- [ ] T017 [US1] Add audio feedback for cleaning actions in src/scenes/cleaning.ts
- [ ] T018 [US1] Implement face cleanliness validation in src/systems/cleaning-state.ts
- [ ] T019 [US1] Add cleaning progress display in src/scenes/cleaning.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Erase Tool Interaction (Priority: P2)

**Goal**: Player needs intuitive controls for the erase tool that provide satisfying feedback during the cleaning process

**Independent Test**: Manipulate the erase tool and verify responsive controls and visual/audio feedback

### Implementation for User Story 2

- [ ] T020 [P] [US2] Implement mouse/touch input handling for eraser in src/gameobjects/eraser.ts
- [ ] T021 [US2] Add smooth eraser movement and following behavior in src/gameobjects/eraser.ts
- [ ] T022 [US2] Implement eraser activation/deactivation states in src/gameobjects/eraser.ts
- [ ] T023 [US2] Add visual feedback for eraser tool state in src/gameobjects/eraser.ts
- [ ] T024 [US2] Implement cleaning intensity variation based on input in src/systems/cleaning-state.ts
- [ ] T025 [US2] Add boundary validation to prevent cleaning outside face areas in src/gameobjects/eraser.ts
- [ ] T026 [US2] Integrate eraser events with cleaning state in src/events/cleaning.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T027 [P] Add character sprite to public/sprites/character.png
- [ ] T028 [P] Add eraser cursor sprite to public/sprites/eraser.png
- [ ] T029 [P] Add dirt spot sprites to public/sprites/dirt-spot.png
- [ ] T030 [P] Add cleaning sound effect to public/sounds/clean.mp3
- [ ] T031 [P] Update scene index to include cleaning scene in src/scenes/index.ts
- [ ] T032 Update main game to load cleaning assets in src/index.ts
- [ ] T033 Performance optimization for collision detection in src/systems/cleaning-state.ts
- [ ] T034 Add error handling for invalid input positions in src/gameobjects/eraser.ts
- [ ] T035 Run manual gameplay testing per quickstart.md checklist
- [ ] T036 Update README.md with cleaning feature documentation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 but should be independently testable

### Within Each User Story

- Game objects before systems
- Systems before scene integration
- Core implementation before feedback systems
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Game objects within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all game objects for User Story 1 together:
Task: "Implement EraserTool class with round collision detection in src/gameobjects/eraser.ts"
Task: "Implement DirtSpot class with cleaning state in src/gameobjects/dirt-spot.ts"
Task: "Create FaceRegion class with cleanliness tracking in src/gameobjects/character.ts"

# Then systems and scene integration:
Task: "Implement collision detection between eraser and dirt spots in src/systems/cleaning-state.ts"
Task: "Implement cleaning scene initialization in src/scenes/cleaning.ts"
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
4. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Manual gameplay testing required after each user story
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Avoid**: vague tasks, same file conflicts, cross-story dependencies that break independence
- **Code Reuse**: Extract common patterns into shared utilities, eliminate duplication across systems
