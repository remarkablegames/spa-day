# Feature Specification: Game Levels

**Feature Branch**: `001-levels`  
**Created**: 2026-01-31  
**Status**: Draft  
**Input**: User description: "add levels"

## Clarifications

### Session 2026-01-31

- Q: Can players upgrade their items? → A: Score becomes money earned in a shop inventory system for purchasing/upgrading items
- Q: When can players access the shop? → A: Only between levels (after results, before next level starts)
- Q: How should scores convert to currency? → A: 1:1 conversion (1 score point = 1 currency unit)

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Progressive Difficulty Levels (Priority: P1)

Players experience increasingly challenging spa treatment sessions as they advance through levels, with each level introducing new customer types, time constraints, and satisfaction requirements.

**Why this priority**: Core progression mechanic that provides long-term engagement and skill development for players.

**Independent Test**: Can be fully tested by completing a single level session and observing the level transition mechanics, delivering a complete gameplay loop with clear advancement criteria.

**Acceptance Scenarios**:

1. **Given** player is on level 1, **When** they complete a treatment with 70%+ satisfaction, **Then** they advance to level 2
2. **Given** player fails to meet level requirements, **When** the treatment ends, **Then** they retry the current level
3. **Given** player completes a level, **When** they return to the game, **Then** their level progress is saved

---

### User Story 2 - Level-Specific Customer Types (Priority: P2)

Each level features different customer characters with unique preferences, satisfaction thresholds, and treatment requirements that increase in complexity.

**Why this priority**: Provides variety and strategic depth to gameplay, making each level feel distinct and challenging.

**Independent Test**: Can be fully tested by playing a single level and observing customer behavior differences from previous levels, delivering unique character interactions.

**Acceptance Scenarios**:

1. **Given** player is on level 3, **When** the level starts, **Then** a customer with advanced preferences appears
2. **Given** a customer has specific mask preferences, **When** wrong masks are applied, **Then** satisfaction decreases more than usual
3. **Given** level completion, **When** viewing results, **Then** customer-specific feedback is displayed

---

### User Story 3 - Level Unlock System (Priority: P3)

Players unlock new levels by meeting performance criteria, with optional challenges and bonus objectives for additional progression rewards.

**Why this priority**: Provides clear goals and motivation for players to improve their skills and replay levels.

**Independent Test**: Can be fully tested by achieving specific score thresholds and observing level unlock notifications, delivering a sense of accomplishment.

**Acceptance Scenarios**:

1. **Given** player scores 1000+ points, **When** level completes, **Then** next level unlocks
2. **Given** player achieves perfect satisfaction, **When** level completes, **Then** bonus level or challenge unlocks
3. **Given** player has unlocked multiple levels, **When** on level select, **Then** they can choose any unlocked level

---

### User Story 4 - Shop Inventory System (Priority: P2)

Players earn currency from treatment scores and can purchase new masks or upgrade existing ones in a shop interface between levels.

**Why this priority**: Provides additional progression path and resource management mechanic that enhances replay value.

**Independent Test**: Can be fully tested by completing a treatment, accessing the shop, making purchases, and verifying items are available in subsequent treatments.

**Acceptance Scenarios**:

1. **Given** player completes a treatment with 500 points, **When** they access the shop between levels, **Then** they have currency equivalent to their score
2. **Given** player purchases a mask upgrade, **When** starting next treatment, **Then** the upgraded mask provides enhanced benefits
3. **Given** player has insufficient currency, **When** attempting purchase, **Then** shop displays insufficient funds message

---

### Edge Cases

- What happens when player loses connection during level progression?
- How does system handle corrupted level save data?
- What occurs when player achieves multiple level unlock criteria simultaneously?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST track player's current level number and progress
- **FR-002**: System MUST load level-specific customer configurations when starting a level
- **FR-003**: System MUST validate level completion criteria before advancing
- **FR-004**: System MUST persist level progress between game sessions
- **FR-005**: System MUST display level number and progress indicators in UI
- **FR-006**: System MUST calculate level-specific difficulty parameters including time limits, customer satisfaction requirements, preferred mask type availability, and score thresholds
- **FR-007**: System MUST provide level selection interface for unlocked levels
- **FR-008**: System MUST handle level retry functionality when requirements aren't met
- **FR-009**: System MUST convert treatment scores to currency for shop purchases
- **FR-010**: System MUST provide shop interface between levels for purchasing/upgrading masks and tools
- **FR-011**: System MUST persist player inventory and purchased items between sessions

### Key Entities

- **Level**: Represents a stage of progression with customer type, difficulty settings, and unlock criteria
- **LevelProgress**: Tracks player's advancement through levels, completion status, and best scores
- **CustomerTemplate**: Defines customer characteristics for each level (preferences, satisfaction thresholds, time limits)
- **LevelConfig**: Contains level-specific parameters (time limits, score multipliers, available mask types)
- **ShopInventory**: Contains purchasable items, prices, and upgrade tiers
- **PlayerInventory**: Tracks owned items, currency balance, and upgrade status
- **Economy**: Defines 1:1 score-to-currency conversion rate and pricing rules

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Players can progress through at least 5 distinct levels with increasing difficulty
- **SC-002**: Level transition occurs within 3 seconds of treatment completion
- **SC-003**: 90% of test players understand level progression mechanics without tutorial
- **SC-004**: Level progress saves and loads correctly within 1 second
- **SC-005**: Each level provides unique customer challenges that are clearly distinguishable from previous levels
- **SC-006**: Shop transactions complete within 2 seconds and inventory updates persist correctly
- **SC-007**: 85% of test players understand the score-to-currency conversion without tutorial
