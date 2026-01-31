# Research Analysis: Game Levels

**Date**: 2026-01-31  
**Feature**: Game Levels with Shop Inventory

## Technical Decisions

### Persistence Strategy

**Decision**: Browser localStorage for all progress and inventory data  
**Rationale**: Aligns with Static Web constitutional requirement, no server dependencies, offline-capable  
**Alternatives considered**: IndexedDB (rejected - complexity overkill), SessionStorage (rejected - doesn't persist)

### Scene Management

**Decision**: Use Kaplay.js scene system for level select, shop, and game scenes  
**Rationale**: Native Kaplay.js pattern, proven in existing codebase, maintains performance  
**Alternatives considered**: Single scene with UI overlays (rejected - violates Kaplay.js conventions)

### Currency System

**Decision**: 1:1 score-to-currency conversion with integer values  
**Rationale**: Simple and intuitive, avoids floating-point precision issues, easy to understand  
**Alternatives considered**: Complex conversion rates (rejected - unnecessary complexity)

### Shop Integration

**Decision**: Shop scene accessed between levels only  
**Rationale**: Maintains gameplay flow, natural break points, reduces context switching  
**Alternatives considered**: In-game shop access (rejected - would break treatment flow)

### Level Progression

**Decision**: Configurable level definitions with scaling difficulty parameters  
**Rationale**: Flexible system allows easy addition of new levels, maintains performance through configuration  
**Alternatives considered**: Hardcoded level progression (rejected - not maintainable)

## Architecture Patterns

### System Managers

Following existing Spa Day patterns with dedicated system managers:

- LevelManager: Handles progression logic and validation
- ShopManager: Manages inventory and transactions
- EconomyManager: Handles currency conversion and persistence

### TypeScript Interfaces

All entities will have explicit interfaces following constitutional requirements:

- Level configuration interfaces
- Shop item interfaces
- Progress tracking interfaces
- Customer template interfaces

### Performance Considerations

- All localStorage operations are synchronous but fast
- Scene transitions use Kaplay.js optimized loading
- Shop UI uses lightweight geometric shapes (no heavy assets)
- Level data loaded once and cached in memory

## Integration Points

### Existing Systems

- Character system enhanced for level-specific customer types
- Scene system extended with new scenes
- Constants system extended with level configurations
- Game state management integrated with progression

### Data Flow

1. Treatment completion → score calculation → currency conversion
2. Level results → progression validation → unlock checking
3. Shop access → inventory loading → transaction processing
4. Next level start → customer template loading → difficulty application

## Risk Assessment

### Low Risk

- localStorage persistence (well-supported)
- Kaplay.js scene management (existing pattern)
- TypeScript interfaces (constitutional requirement)

### Medium Risk

- Shop UI performance (mitigated with geometric shapes)
- Level balance (mitigated with configurable parameters)

### Mitigation Strategies

- Manual gameplay testing required per constitution
- Performance monitoring during development
- Iterative level design based on testing feedback
