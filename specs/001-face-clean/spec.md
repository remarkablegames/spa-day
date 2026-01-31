# Feature Specification: Face Cleaning Tool

**Feature Branch**: `001-face-clean`  
**Created**: 2026-01-31  
**Status**: Draft  
**Input**: User description: "clean face with an erase tool before putting on mask"

## Clarifications

### Session 2026-01-31

- Q: Will there be multiple cleaning tools or just one erase tool? → A: One erase tool for now
- Q: What is the shape of the eraser? Is it round? → A: Round
- Q: How will the dirt be displayed on the face? → A: Individual small spots only (larger patches for future tools)
- Q: How will the score be affected with this feature? → A: Points per spot cleaned

## User Scenarios & Testing _(mandatory)_

<!--
  IMPORTANT: User stories should be PRIORITIZED as player journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value to players.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of gameplay that can be:
  - Developed independently
  - Tested independently (manual gameplay testing)
  - Demonstrated to players independently
  - Fun and playable on its own
-->

### User Story 1 - Face Cleaning Preparation (Priority: P1)

Player wants to clean the character's face using an erase tool before applying a spa mask. The cleaning process should remove impurities and prepare the skin for mask application.

**Why this priority**: This is the core mechanic that enables the spa treatment gameplay loop - cleaning is essential preparation before mask application.

**Independent Test**: Can be fully tested by using the erase tool on the face area and observing the cleaning effect, delivering a satisfying preparation experience.

**Acceptance Scenarios**:

1. **Given** a character with visible facial impurities, **When** player uses the erase tool on the face, **Then** impurities are removed and skin appears cleaner
2. **Given** a cleaned face area, **When** player attempts to apply a mask, **Then** mask adheres properly to the cleaned area
3. **Given** an unclean face area, **When** player attempts to apply a mask, **Then** mask application is less effective or blocked

---

### User Story 2 - Erase Tool Interaction (Priority: P2)

Player needs intuitive controls for the erase tool that provide satisfying feedback during the cleaning process.

**Why this priority**: Tool interaction quality directly impacts player satisfaction and engagement with the cleaning mechanic.

**Independent Test**: Can be fully tested by manipulating the erase tool and verifying responsive controls and visual/audio feedback.

**Acceptance Scenarios**:

1. **Given** the erase tool is selected, **When** player touches/drags on the face, **Then** cleaning effect follows the touch path smoothly
2. **Given** the erase tool is active, **When** cleaning occurs, **Then** appropriate visual and audio feedback plays
3. **Given** different pressure or speed, **When** using the erase tool, **Then** cleaning intensity varies appropriately

---

### Edge Cases

- What happens when player tries to clean areas outside the face region?
- How does system handle rapid, chaotic cleaning movements?
- What happens when cleaning is interrupted (player lifts finger/mouse)?
- How does system handle cleaning when face is already fully clean?
- What happens when multiple cleaning tools are available? (Resolved: One erase tool only)

## Requirements _(mandatory)_

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST provide an erase tool for cleaning facial areas
- **FR-002**: System MUST display visual impurities on the character's face that can be cleaned
- **FR-003**: System MUST detect touch/mouse input on face regions when erase tool is active
- **FR-004**: System MUST remove impurities progressively as the erase tool passes over them
- **FR-005**: System MUST provide visual feedback showing cleaning progress and results
- **FR-006**: System MUST play appropriate audio feedback during cleaning actions
- **FR-007**: System MUST validate face cleanliness before allowing mask application
- **FR-008**: System MUST maintain cleaning state between different face regions
- **FR-009**: System MUST prevent cleaning outside designated face areas
- **FR-010**: System MUST provide clear visual indication when face is sufficiently clean for mask application

### Key Entities

- **Face Region**: Areas of the character's face that can be cleaned and have masks applied, with cleanliness state tracking
- **Impurities**: Visual elements on the face that can be removed by the erase tool, with position and removal progress
- **Erase Tool**: Interactive tool that responds to player input for cleaning actions, with active state and effect parameters
- **Cleaning State**: Progress tracking for each face region's cleanliness level, affecting mask application eligibility
- **Mask Application**: Process that validates face cleanliness and applies spa masks to cleaned areas

## Success Criteria _(mandatory)_

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable, focusing on player experience.
-->

### Measurable Outcomes

- **SC-001**: Players can clean a face to mask-ready state within 30 seconds using the erase tool
- **SC-002**: Cleaning interactions maintain 60 FPS on target mobile devices during continuous touch input
- **SC-003**: 90% of test players find the erase tool intuitive and satisfying to use
- **SC-004**: Face cleaning state accurately reflects player actions with no more than 100ms visual feedback delay
- **SC-005**: Cleaning mechanic is fully playable with touch controls only on mobile devices
- **SC-006**: Players successfully understand the relationship between cleaning and mask application without tutorial
