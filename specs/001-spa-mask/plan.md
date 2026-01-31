# Implementation Plan: Spa Face Mask Game

**Branch**: `001-spa-mask` | **Date**: 2026-01-30 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-spa-mask/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create a spa face mask game where players apply different face masks to characters for relaxation treatments. The game features mask collection, treatment timing, scoring system, and customer satisfaction mechanics. Built with Kaplay.js for browser-based mobile-first gameplay with touch controls and 60 FPS performance target. MVP uses geometric shapes for visual assets with seamless external image swapping capability for final polish.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.0+  
**Primary Dependencies**: Kaplay.js 3001.0.19, Vite build tool  
**Storage**: Local browser storage for game progress  
**Testing**: Manual gameplay testing  
**Target Platform**: Web browsers (mobile-first)  
**Project Type**: Single web game  
**Performance Goals**: 60 FPS on mobile devices, <3 second load time  
**Constraints**: Browser memory limits, touch-only controls, static deployment  
**Scale/Scope**: Single-player game with local progression  
**Visual Assets**: Geometric shapes for MVP, external images for final polish

## Constitution Check

_✅ PASSED: All requirements satisfied with Phase 1 design_

- **Game-First**: ✅ Feature serves game experience with clear player value through mask application, scoring, and progression mechanics
- **Kaplay.js Native**: ✅ Implementation uses Kaplay.js entity-component system, scene management, and native touch input handling
- **Performance First**: ✅ 60 FPS target maintained through object pooling, sprite optimization, and frame rate monitoring
- **Static Web**: ✅ Game runs entirely in browser using Kaplay's localStorage helpers (`getData`, `setData`) for persistence, no server-side dependencies
- **Mobile-First**: ✅ Touch controls prioritized, 44x44px touch targets, mobile testing required, responsive design

## Project Structure

### Documentation (this feature)

```text
specs/001-spa-mask/
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
├── gameobjects/
│   ├── character.ts     # Character entity with face areas (geometric shapes)
│   ├── mask.ts          # Face mask entities and effects (geometric shapes)
│   └── treatment.ts     # Treatment session management
├── scenes/
│   ├── game.ts          # Main gameplay scene
│   ├── collection.ts    # Mask collection scene
│   └── results.ts       # Treatment results scene
├── systems/
│   ├── scoring.ts       # Score calculation system
│   ├── progression.ts  # Unlock and progression system
│   ├── input.ts         # Touch input handling
│   └── assets.ts        # Asset management (shapes → images swap)
└── constants/
    ├── mask-types.ts    # Mask type definitions
    └── game-config.ts   # Game configuration

public/
└── assets/              # Static game assets (for final polish images)
```

**Structure Decision**: Single web game project using existing Kaplay.js structure. Game objects organized by entity type (character, mask, treatment) with scene-based gameplay flow. Systems handle core mechanics (scoring, progression, input). Asset management system supports geometric shapes for MVP with seamless external image swapping for final polish.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
