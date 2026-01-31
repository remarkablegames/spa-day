<!--
Sync Impact Report:
- Version change: 0.0.0 → 1.0.0 (initial constitution)
- Modified principles: N/A (initial creation)
- Added sections: Core Principles (5), Technical Standards, Development Workflow, Governance
- Removed sections: N/A (initial creation)
- Templates requiring updates: ✅ plan-template.md, ✅ spec-template.md, ✅ tasks-template.md
- Follow-up TODOs: None
-->

# Spa Day Constitution

## Core Principles

### I. Game-First Development

Every feature MUST serve the game experience; Game mechanics MUST be playable before any polish; Core loop MUST be functional and fun before adding additional content; No feature added without clear player value.

### II. Kaplay.js Native

All game code MUST use Kaplay.js conventions; Components MUST follow Kaplay entity-component pattern; Scene management MUST use Kaplay scene system; Asset loading MUST follow Kaplay preload patterns; Avoid external game engine abstractions; Use global Kaplay functions.

### III. Performance First (NON-NEGOTIABLE)

60 FPS target MUST be maintained on target devices; Asset bundling MUST optimize for web delivery; Memory usage MUST stay within browser limits; Performance testing REQUIRED before each release; No features that compromise frame rate.

### IV. Static Web Deployment

Game MUST run entirely in the browser; No server-side dependencies for gameplay; All assets MUST be bundled for static hosting; CDN-friendly asset structure REQUIRED; Offline capability preferred but not required.

### V. Mobile-First Design

Controls MUST work on touch devices; UI MUST scale appropriately on mobile screens; Game mechanics MUST be playable without keyboard; Performance MUST be adequate on mobile browsers; Desktop experience enhanced but not required.

## Technical Standards

### Technology Stack

- **Engine**: Kaplay.js 3001.0.19 (locked version)
- **Build Tool**: Vite with static optimization
- **Language**: TypeScript with strict mode
- **Testing**: Manual gameplay testing (automated testing optional)
- **Deployment**: Static hosting (GitHub Pages, Netlify, itch.io)

### Code Quality

- ESLint configuration MUST be followed
- Prettier formatting REQUIRED for all commits
- TypeScript strict mode enforced
- Conventional commits REQUIRED (using commitlint)
- All PRs MUST pass automated checks

## Development Workflow

### Feature Development

1. Create feature specification using `/speckit.specify`
2. Generate implementation plan using `/speckit.plan`
3. Create task breakdown using `/speckit.tasks`
4. Implement features following task order
5. Manual gameplay testing REQUIRED
6. Performance validation before merge

### Release Process

1. All features MUST be playable
2. Build MUST pass without errors
3. Bundle size MUST be reasonable (<10MB compressed)
4. Gameplay MUST be tested on target devices
5. Version MUST follow semantic versioning

## Governance

This constitution supersedes all other development practices. Amendments require:

- Documentation of proposed changes
- Team review and approval
- Updated version number following semantic versioning
- Migration plan for existing code
- Update of all dependent templates

All pull requests MUST verify compliance with this constitution. Complexity beyond these principles MUST be explicitly justified in implementation plans. Use this constitution as the primary guidance for all development decisions.

**Version**: 1.0.0 | **Ratified**: 2025-01-30 | **Last Amended**: 2025-01-30
