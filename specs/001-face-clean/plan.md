# Implementation Plan: Face Cleaning Tool

**Branch**: `001-face-clean` | **Date**: 2026-01-31 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-face-clean/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Face cleaning tool that allows players to remove individual dirt spots from a character's face using a round eraser tool before applying spa masks. Features immediate scoring feedback per spot cleaned and prepares face areas for mask application.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.9.3  
**Primary Dependencies**: Kaplay.js 3001.0.19  
**Storage**: N/A (in-memory game state)  
**Testing**: Manual gameplay testing  
**Target Platform**: Web browser (WASM) with mobile-first design  
**Project Type**: Single web game  
**Performance Goals**: 60 FPS, <100ms visual feedback delay  
**Constraints**: Browser memory limits, touch-only controls  
**Scale/Scope**: Single scene feature, ~50-100 dirt spots max

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Game-First**: Feature MUST serve the game experience with clear player value
- **Kaplay.js Native**: Implementation MUST use Kaplay.js conventions and patterns
- **Performance First**: MUST maintain 60 FPS and stay within browser memory limits
- **Static Web**: MUST run entirely in browser with no server-side gameplay dependencies
- **Mobile-First**: Controls and UI MUST work on touch devices
- **Code Reuse**: MUST follow DRY principles and eliminate duplication

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

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── scenes/
│   ├── index.ts           # Scene exports
│   ├── game.ts            # Main game scene
│   └── cleaning.ts        # Face cleaning scene
├── gameobjects/
│   ├── base.ts            # Base game object
│   ├── character.ts       # Character with face
│   ├── eraser.ts          # Eraser tool
│   └── dirt-spot.ts       # Individual dirt spots
├── constants/
│   ├── game-config.ts     # Game configuration
│   └── cleaning-config.ts # Cleaning-specific config
├── events/
│   ├── index.ts           # Event exports
│   └── cleaning.ts        # Cleaning-related events
└── index.ts               # Main entry point

public/
├── assets/
│   ├── sprites/
│   │   ├── character.png  # Character face sprite
│   │   ├── eraser.png     # Eraser tool sprite
│   │   └── dirt-spot.png  # Dirt spot sprite
│   └── sounds/
│       └── clean.mp3      # Cleaning sound effect
```

**Structure Decision**: Single web game using existing Kaplay.js structure. Feature integrates into current scene system with new cleaning-specific game objects and constants.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
