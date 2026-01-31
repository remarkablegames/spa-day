# spa-day Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-30

## Active Technologies

- TypeScript 5.x (strict mode) + Kaplay.js 3001.0.19 (locked version) (001-levels)
- Browser localStorage for progress/inventory persistence (001-levels)

- TypeScript 5.9.3 + Kaplay.js 3001.0.19 (001-face-clean)
- N/A (in-memory game state) (001-face-clean)

- TypeScript 5.9.3 + Kaplay.js 3001.0.19, Vite build tool (001-spa-mask)

## Project Structure

```text
src/
├── constants/     # Game configuration and constants
├── events/        # Event handling and cursors
├── gameobjects/   # Game entities (character, enemy, etc.)
├── scenes/        # Game scenes (game, collection, etc.)
├── index.ts       # Main game entry point
└── style.css      # Game styles

public/
├── assets/        # Static assets
├── sounds/        # Audio files
├── sprites/       # Game sprites
└── manifest.json  # Web app manifest

specs/             # Feature specifications
├── 001-face-clean/
└── 001-spa-mask/

scripts/           # Build and utility scripts
.windsurf/         # Development workflows and rules
.specify/          # Specification templates and memory
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.9.3: Follow standard conventions

## Recent Changes

- 001-levels: Added TypeScript 5.x (strict mode) + Kaplay.js 3001.0.19 (locked version)

- 001-face-clean: Added TypeScript 5.9.3 + Kaplay.js 3001.0.19

- 001-spa-mask: Added TypeScript 5.9.3 + Kaplay.js 3001.0.19, Vite build tool

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
