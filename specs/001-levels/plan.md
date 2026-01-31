# Implementation Plan: Game Levels

**Branch**: `001-levels` | **Date**: 2026-01-31 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-levels/spec.md`

## Summary

Add progressive level system with shop inventory to Spa Day game. Players advance through increasingly challenging treatment sessions, earn currency from scores, and purchase/upgrade masks between levels. Implementation uses Kaplay.js scene management with TypeScript for level progression logic and browser localStorage for persistence.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)  
**Primary Dependencies**: Kaplay.js 3001.0.19 (locked version)  
**Storage**: Browser localStorage for progress/inventory persistence  
**Testing**: Manual gameplay testing (per constitution)  
**Target Platform**: Web browser with mobile-first touch controls  
**Project Type**: Single web application with static deployment  
**Performance Goals**: 60 FPS on target mobile devices, <100MB memory usage  
**Constraints**: Browser-only gameplay, no server dependencies, offline-capable preferred  
**Scale/Scope**: 5+ levels with shop system, <10MB compressed bundle

## Constitution Check

_✅ GATE PASSED: All constitutional requirements satisfied_

- **Game-First**: ✅ Levels provide clear progression and player engagement through increasingly challenging gameplay
- **Kaplay.js Native**: ✅ Implementation uses Kaplay.js scene management, entity patterns, and conventions
- **Performance First**: ✅ 60 FPS target maintained with localStorage persistence (no network calls during gameplay)
- **Static Web**: ✅ Browser-only with localStorage, no server dependencies for gameplay
- **Mobile-First**: ✅ Touch-based shop interface and level selection designed for mobile screens
- **Code Reuse**: ✅ Extends existing systems (character, scenes) with shared patterns for persistence
- **Explicit Typing**: ✅ All TypeScript interfaces and types defined, `any` type prohibited

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── constants/
│   ├── game-config.ts          # Existing - add level configs
│   └── level-config.ts         # New - level definitions
├── systems/
│   ├── levelmanager.ts         # New - level progression logic
│   ├── shop.ts                 # New - shop inventory system
│   └── economy.ts              # New - currency management
├── gameobjects/
│   ├── character.ts            # Existing - enhance for level-specific customers
│   └── levelprogress.ts        # New - progress tracking UI
├── scenes/
│   ├── spa-game.ts             # Existing - integrate level/shop
│   ├── shop.ts                 # New - shop interface scene
│   └── level-select.ts         # New - level selection scene
└── types/
    └── level.ts                # New - level-related TypeScript interfaces

tests/
├── manual/
│   ├── level-progression.md    # Manual test cases
│   └── shop-functionality.md  # Shop test cases
└── integration/
    └── level-flow.test.ts      # Integration tests (optional)
```

**Structure Decision**: Single project structure following existing Spa Day codebase organization. New systems and scenes integrate with current architecture while maintaining separation of concerns.

## Phase 0: Research & Analysis

### Research Tasks

No NEEDS CLARIFICATION items found in Technical Context. All technical decisions align with existing Spa Day architecture and constitutional requirements.

## Phase 1: Design & Contracts

### Generated Artifacts

✅ **research.md** - Technical decisions and architecture analysis  
✅ **data-model.md** - Complete entity definitions and relationships  
✅ **contracts/api-contracts.md** - System interfaces and integration points  
✅ **quickstart.md** - Implementation guide and integration steps  
✅ **Agent Context Updated** - Windsurf rules updated with TypeScript/Kaplay.js

### Design Validation

**Constitution Check**: ✅ All requirements satisfied

- Game-First: Clear progression mechanics and player value
- Kaplay.js Native: Scene management and entity patterns
- Performance First: 60 FPS maintained with localStorage
- Static Web: Browser-only with no server dependencies
- Mobile-First: Touch-based shop and level selection
- Code Reuse: Extends existing systems with shared patterns
- Explicit Typing: All TypeScript interfaces defined

### Architecture Decisions

- **Persistence**: localStorage for all progress/inventory data
- **Scene Management**: Kaplay.js scenes for level select, shop, game
- **Currency System**: 1:1 score-to-currency conversion
- **Shop Access**: Between levels only (maintains gameplay flow)
- **Level Progression**: Configurable definitions with scaling difficulty

## Implementation Ready

The levels feature is now fully planned and ready for task generation. All technical decisions have been made, contracts defined, and integration paths established.

**Next Step**: Run `/speckit.tasks` to generate actionable implementation tasks.
