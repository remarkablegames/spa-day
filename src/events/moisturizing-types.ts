/**
 * Moisturizing Types
 *
 * Core type definitions for the moisturizer feature.
 * Based on contracts/moisturizer-types.ts
 */

// Position coordinate
export interface Position {
  x: number
  y: number
}

// Bounding box for zones and constraints
export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

// Moisturizer tier enum
export type MoisturizerTier = 'basic' | 'premium' | 'luxury'

// Session state enum
export type MoisturizerSessionState =
  | 'initialized'
  | 'applying'
  | 'complete'
  | 'scored'

// Moisturizer type definition
export interface MoisturizerType {
  id: string
  name: string
  tier: MoisturizerTier
  color: string
  coverageMultiplier: number
  satisfactionMultiplier: number
  texture: string
  basePrice: number
  levelRequirement: number
  isDefault: boolean
}

// Coverage zone definition
export interface CoverageZoneData {
  id: string
  bounds: BoundingBox
  isCovered: boolean
  coverageTimestamp: number | null
  overlapCount: number
}

// Moisturizer state tracking
export interface MoisturizerState {
  sessionId: string
  selectedMoisturizerId: string
  totalZones: number
  coveredZones: number
  coveragePercentage: number
  isComplete: boolean
  startTime: number
  completionTime: number | null
  trailPositions: Position[]
  sessionState: MoisturizerSessionState
}

// Trail segment for visual rendering
export interface MoisturizerTrailData {
  id: string
  positions: Position[]
  color: string
  width: number
  opacity: number
  createdAt: number
}

// Satisfaction score result
export interface SatisfactionScore {
  coveragePercentage: number
  starRating: 3 | 4 | 5
  baseScore: number
  moisturizerMultiplier: number
  finalScore: number
  calculationTime: number
}

// Tool configuration
export interface MoisturizerToolConfig {
  id: string
  initialPosition: Position
  moisturizerTypeId: string
  allowedBounds: BoundingBox
  coverageRadius: number
  smoothingFactor: number
}

// Session configuration
export interface MoisturizingSessionConfig {
  sessionId: string
  faceBounds: BoundingBox
  zoneGridSize: number
  completionThreshold: number
  moisturizerTypeId: string
}

// Zone update result
export interface ZoneUpdateResult {
  zonesActivated: number
  totalCovered: number
  coveragePercentage: number
  isNewCoverage: boolean
}

// Validation result
export interface ValidationResult {
  isValid: boolean
  coverage: number
  requiredCoverage: number
  message: string
}

// Error types
export type MoisturizerErrorCode =
  | 'INVALID_MOISTURIZER_ID'
  | 'INSUFFICIENT_FUNDS'
  | 'LEVEL_REQUIREMENT_NOT_MET'
  | 'SESSION_NOT_FOUND'
  | 'TOOL_NOT_ACTIVE'
  | 'COVERAGE_CALCULATION_ERROR'
  | 'INVALID_POSITION'
  | 'COMPLETION_THRESHOLD_NOT_MET'

export interface MoisturizerError {
  code: MoisturizerErrorCode
  message: string
  details?: Record<string, unknown>
  timestamp: number
}

// Generic result type
export interface Result<T> {
  success: boolean
  data?: T
  error?: MoisturizerError
}

// Event types
export interface MoisturizerSelectedEvent {
  sessionId: string
  moisturizerId: string
  tier: MoisturizerTier
  color: string
  timestamp: number
}

export interface ToolActivatedEvent {
  sessionId: string
  toolId: string
  position: Position
  timestamp: number
}

export interface ToolMovedEvent {
  sessionId: string
  toolId: string
  position: Position
  velocity: number
  timestamp: number
}

export interface ToolDeactivatedEvent {
  sessionId: string
  toolId: string
  position: Position
  timestamp: number
}

export interface ZoneCoveredEvent {
  sessionId: string
  zoneId: string
  totalCovered: number
  totalZones: number
  timestamp: number
}

export interface ProgressUpdatedEvent {
  sessionId: string
  coveragePercentage: number
  coveredZones: number
  totalZones: number
  timestamp: number
}

export interface CompletionThresholdMetEvent {
  sessionId: string
  coveragePercentage: number
  timestamp: number
}

export interface SessionCompletedEvent {
  sessionId: string
  coveragePercentage: number
  completionTime: number
  timestamp: number
}

export interface ScoreCalculatedEvent {
  sessionId: string
  score: SatisfactionScore
  timestamp: number
}

export interface MoisturizingEventMap {
  'moisturizer-selected': MoisturizerSelectedEvent
  'tool-activated': ToolActivatedEvent
  'tool-moved': ToolMovedEvent
  'tool-deactivated': ToolDeactivatedEvent
  'zone-covered': ZoneCoveredEvent
  'progress-updated': ProgressUpdatedEvent
  'completion-threshold-met': CompletionThresholdMetEvent
  'session-completed': SessionCompletedEvent
  'score-calculated': ScoreCalculatedEvent
}
