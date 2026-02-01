# Feature Specification: Face Moisturizer Application

**Feature Branch**: `001-face-moisturizer`  
**Created**: 2026-02-01  
**Status**: Draft  
**Input**: User description: "draw moisturizer on face"

## Clarifications

### Session 2026-02-01

- Q: Should this moisturizer feature be integrated into an existing spa game scene/flow, or is it a standalone mini-game? → A: Integrated - Add to existing spa game as one step in a multi-treatment sequence (e.g., cleanse → mask → moisturize)
- Q: Where does the moisturizer step occur in the spa treatment sequence? → A: Last - Final step before spa session completion
- Q: How many moisturizers will be available and can they be upgraded via the shop? → A: Multiple moisturizer types (basic, premium, luxury) with unlock/upgrade mechanics via shop
- Q: What determines when players can unlock/upgrade moisturizers? → A: Levels and/or cost using existing game economy system
- Q: How is customer satisfaction scored based on moisturizer application? → A: Coverage percentage + moisturizer type bonus integrated with existing scoring system
- Q: Is the moisturizer tool similar to the cleanse tool in how it's enabled/disabled and drawn? → A: Yes - reuse same enable/disable logic and drawing mechanics from cleanse tool

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Basic Moisturizer Application (Priority: P1)

The player can interact with a character's face by clicking/touching and dragging to apply moisturizer cream. As they drag, the moisturizer appears on the face in real-time, following their cursor/touch path. The application should feel responsive and immediate.

**Why this priority**: This is the core gameplay mechanic. Without the ability to apply moisturizer, the feature doesn't exist. It delivers the fundamental value of the spa treatment experience.

**Independent Test**: Can be fully tested by loading a face scene and dragging across it to see moisturizer appear. Delivers immediate visual feedback and satisfying interaction.

**Acceptance Scenarios**:

1. **Given** the player is viewing a character's face, **When** they click/touch and drag across the face area, **Then** moisturizer cream appears along the drag path in real-time
2. **Given** the player is applying moisturizer, **When** they stop dragging, **Then** the moisturizer remains visible on the face
3. **Given** the player is applying moisturizer, **When** they drag outside the face boundaries, **Then** no moisturizer appears outside the face area

---

### User Story 2 - Coverage Feedback and Progress (Priority: P2)

The player receives visual feedback showing which areas of the face have been moisturized and which still need attention. A progress indicator shows what percentage of the face has been covered, helping the player understand how close they are to completion.

**Why this priority**: Enhances the core experience by providing guidance and a sense of progress. Makes the feature more engaging and helps players understand the goal.

**Independent Test**: Can be tested by applying moisturizer and observing real-time updates to a coverage indicator or visual feedback system.

**Acceptance Scenarios**:

1. **Given** moisturizer has been applied to a portion of the face, **When** the player views the face, **Then** moisturized areas are visually distinct from unmoisturized areas (e.g., shinier, different color)
2. **Given** the player is applying moisturizer, **When** coverage changes, **Then** a progress indicator updates to show the percentage of face covered
3. **Given** the player has applied moisturizer to specific areas, **When** they view those areas, **Then** they can clearly distinguish between covered and uncovered regions

---

### User Story 3 - Treatment Completion and Rewards (Priority: P3)

Once the player has applied moisturizer to a sufficient percentage of the face, the treatment is considered complete. The player receives positive feedback (visual/audio) and the spa session concludes, showing the final result and session summary.

**Why this priority**: Provides closure to the activity and enables game progression. Creates a satisfying sense of accomplishment.

**Independent Test**: Can be tested by achieving the coverage threshold and observing the completion state and transition.

**Acceptance Scenarios**:

1. **Given** the player has applied moisturizer to at least 85% of the face area, **When** they reach this threshold, **Then** a completion state triggers with positive visual/audio feedback
2. **Given** the treatment is complete, **When** completion is triggered, **Then** the spa session concludes and displays a summary screen
3. **Given** the player has not reached 85% coverage, **When** they attempt to proceed, **Then** they receive guidance to continue applying moisturizer

---

### Edge Cases

- What happens when the player applies moisturizer extremely quickly? (System should handle rapid input without lag or missed areas)
- How does the system handle overlapping moisturizer application on already-covered areas? (Should not penalize or double-count coverage)
- What happens if the player tries to apply moisturizer outside the designated face area? (Should be ignored or provide gentle boundary feedback)
- How does the system handle very small drag movements? (Should have a minimum threshold to avoid accidental dots)
- What if the player applies moisturizer in a repetitive back-and-forth pattern on the same small area? (Coverage should not exceed 100% for that region)
- How does the transition from the previous treatment work? (Should show face in state after prior treatments, e.g., clean and mask-free)
- What happens if the player tries to skip the moisturizer step? (Should require completion as this is the mandatory final step)
- How is the spa session completion communicated? (Should show clear session-end feedback and summary)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow players to apply moisturizer by clicking/touching and dragging across the face area
- **FR-002**: System MUST display moisturizer visually as the player drags, following the cursor/touch path in real-time
- **FR-003**: System MUST restrict moisturizer application to the defined face boundaries only
- **FR-004**: System MUST track and calculate the percentage of face area covered by moisturizer
- **FR-005**: System MUST provide visual distinction between moisturized and unmoisturized areas
- **FR-006**: System MUST display a progress indicator showing current coverage percentage
- **FR-007**: System MUST trigger a completion state when coverage reaches at least 85%
- **FR-008**: System MUST provide positive visual/audio feedback upon completion
- **FR-009**: System MUST prevent double-counting when moisturizer is applied to already-covered areas
- **FR-010**: System MUST allow players to proceed to next steps only after completion criteria are met
- **FR-011**: System MUST provide at least 3 moisturizer types (basic, premium, luxury) with distinct visual effects and properties
- **FR-012**: System MUST integrate with existing shop/economy system to allow unlocking/upgrading moisturizer types using in-game currency
- **FR-013**: System MUST enforce level requirements and/or cost thresholds for unlocking premium/luxury moisturizers
- **FR-014**: System MUST display available (unlocked) moisturizers in a selection UI before treatment begins
- **FR-015**: System MUST apply stat differences based on moisturizer type (e.g., coverage speed, visual quality, bonus rewards)
- **FR-016**: System MUST check player level and currency balance before allowing moisturizer unlocks/purchases
- **FR-017**: System MUST calculate customer satisfaction score based on coverage percentage (85-94%=3 stars, 95-99%=4 stars, 100%=5 stars)
- **FR-018**: System MUST apply moisturizer type multipliers to satisfaction score (basic=1x, premium=1.2x, luxury=1.5x)
- **FR-019**: System MUST integrate satisfaction scoring with existing spa session scoring system
- **FR-020**: System MUST follow the same tool enable/disable pattern as the cleanse tool (auto-enable when step begins, disable on completion)
- **FR-021**: System MUST reuse drawing mechanics from cleanse tool (drag-based application, boundary constraints, real-time rendering)
- **FR-022**: System MUST inherit input handling patterns from cleanse tool (mouse/touch support, drag detection, minimum movement thresholds)
- **FR-023**: System MUST render Basic moisturizer in white (#FFFFFF) with smooth cream texture
- **FR-024**: System MUST render Premium moisturizer in light blue (#ADD8E6) with smooth cream texture
- **FR-025**: System MUST render Luxury moisturizer in lavender (#E6E6FA) with smooth cream texture
- **FR-026**: System MUST apply consistent smooth cream texture across all moisturizer types, varying only the color by tier

### Key Entities

- **Face**: The interactive area representing a character's face, defined by visual boundaries and collision zones
- **Moisturizer Trail**: Visual representation of applied moisturizer, consisting of individual drawing strokes that combine to show coverage
- **Coverage State**: Tracks which regions of the face have been moisturized and calculates overall completion percentage
- **Moisturizer Types**: Collection of unlockable/upgradable moisturizers (basic, premium, luxury) with varying stats and visual effects
- **Shop Integration**: Interface for unlocking and upgrading moisturizer types using in-game currency or rewards
- **Satisfaction Score**: Composite rating based on coverage accuracy and moisturizer quality, feeding into overall spa session score

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Players can complete the moisturizer application in 30-90 seconds
- **SC-002**: The moisturizer drawing responds to input with less than 50ms latency
- **SC-003**: 90% of test players can successfully complete the treatment on first attempt without instructions
- **SC-004**: Coverage calculation is accurate within 5% of actual visual coverage
- **SC-005**: The feature is fully playable with mouse and touch controls
- **SC-006**: Players report satisfaction score of 4/5 or higher for the "satisfying" nature of the drawing mechanic
- **SC-007**: Satisfaction scoring integrates seamlessly with existing spa session scoring (no conflicts or double-counting)
- **SC-008**: Score calculation completes within 100ms of treatment completion

## Assumptions

- The face asset/character model will be provided and has a clear, closed boundary area
- Moisturizer visual effect will use color progression by tier: Basic=white, Premium=light blue, Luxury=lavender, all with smooth cream texture
- Input method will support both mouse (desktop) and touch (mobile) interactions
- The completion threshold of 85% provides enough buffer for players who may miss small areas
- Audio feedback will use pleasant, spa-like sounds (not clinical or harsh tones)
- This treatment is integrated into a larger spa treatment sequence (e.g., cleanse → mask → moisturize)
- Character state (face condition) is maintained across treatment transitions within a spa session
- Moisturizer tool implementation follows the same architectural pattern as the cleanse tool for consistency
