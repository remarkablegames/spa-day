# Implementation Plan: Face Moisturizer Application

**Branch**: `001-face-moisturizer` | **Date**: 2026-02-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-face-moisturizer/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add a face moisturizer application feature to the existing spa game as the final step in a multi-treatment sequence (cleanse → mask → moisturize). Players drag to apply moisturizer cream with real-time coverage tracking, type-based satisfaction scoring, and shop integration for unlocking premium/luxury moisturizers.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode)  
**Primary Dependencies**: Kaplay.js 3001.0.19 (game engine), Vite 7.3.1 (build tool)  
**Storage**: Local storage via existing storage system (`src/systems/storage.ts`)  
**Testing**: Manual gameplay testing  
**Target Platform**: Web browsers (desktop + mobile) with static hosting  
**Project Type**: Single web game project  
**Performance Goals**: 60 FPS target, <50ms input latency, <100ms score calculation  
**Constraints**: Browser memory limits, touch-friendly controls, static deployment only  
**Scale/Scope**: Single feature addition, ~5 new source files, 3 moisturizer types

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Game-First**: ✅ Feature serves the game experience - final step in spa treatment sequence with clear player value (satisfying drawing mechanic, progression through shop unlocks)
- **Kaplay.js Native**: ✅ Will use existing Kaplay patterns - reuse drawing mechanics from cleanse tool, use Kaplay components for visual feedback, follow scene management patterns
- **Performance First**: ✅ Maintains 60 FPS - reuse performant eraser/cleaning patterns, coverage tracking uses spatial hashing for O(1) lookups, capped at 100ms for score calc
- **Static Web**: ✅ Runs entirely in browser - no server dependencies, uses existing local storage system
- **Mobile-First**: ✅ Touch controls - inherits mouse/touch input handling from eraser tool, UI scales to mobile screens
- **Code Reuse**: ✅ Follows DRY - reuses eraser tool patterns, integrates with existing shop/scoring systems, follows established manager patterns
- **Explicit Typing**: ✅ TypeScript strict mode - all new code will have explicit types, no `any` usage

## Project Structure

### Documentation (this feature)

```text
specs/001-face-moisturizer/
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
├── systems/
│   ├── moisturizing-state.ts      # MoisturizingStateManager (mirrors cleaning-state.ts)
│   └── shop.ts                    # Extend with moisturizer items (already exists)
├── gameobjects/
│   ├── moisturizer-tool.ts        # MoisturizerTool (mirrors eraser.ts)
│   ├── coverage-zone.ts           # Coverage tracking zones
│   └── moisturizer-trail.ts       # Visual trail for applied moisturizer
├── events/
│   ├── moisturizing.ts            # MoisturizingEventManager (mirrors cleaning.ts)
│   └── moisturizing-types.ts      # Event type definitions
├── constants/
│   └── moisturizing-config.ts     # Configuration values
└── scenes/
│   └── spa-game.ts                # Add moisturizer step to treatment flow (already exists)
```

**Structure Decision**: Single project structure - moisturizer feature integrates into existing spa game as additional treatment step, following established patterns from cleaning system.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| None      | -          | -                                    |
