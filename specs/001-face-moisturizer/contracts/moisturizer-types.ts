/**
 * Moisturizer Core Types
 *
 * Base type definitions for the moisturizer feature.
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
export interface CoverageZone {
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
export interface MoisturizerTrail {
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

// Score breakdown for detailed reporting
export interface MoisturizerScoreBreakdown {
  coverageComponent: number
  speedComponent: number
  efficiencyComponent: number
  tierMultiplier: number
  totalScore: number
  starRating: 3 | 4 | 5
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

// Zone update request
export interface ZoneUpdateRequest {
  toolPosition: Position
  toolRadius: number
  timestamp: number
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

// Shop integration types
export interface MoisturizerShopItem {
  id: string
  name: string
  type: 'moisturizer'
  basePrice: number
  description: string
  requirements: string[]
  isPurchased: boolean
  tier: MoisturizerTier
  color: string
  satisfactionMultiplier: number
  coverageSpeedMultiplier: number
}

export interface MoisturizerPurchaseRequest {
  moisturizerId: string
  playerLevel: number
  playerCurrency: number
  ownedItems: string[]
}

export interface MoisturizerPurchaseResult {
  success: boolean
  error?: string
  transaction?: {
    id: string
    type: 'purchase'
    amount: number
    itemId: string
    timestamp: Date
    balance: number
  }
  unlockedMoisturizer?: MoisturizerShopItem
}

export interface MoisturizerAvailabilityResult {
  available: MoisturizerShopItem[]
  locked: Array<{
    item: MoisturizerShopItem
    requirements: string[]
    missingRequirements: string[]
  }>
  owned: MoisturizerShopItem[]
}

// Scoring configuration
export interface MoisturizerScoreConfig {
  starThresholds: {
    threeStar: number
    fourStar: number
    fiveStar: number
  }
  tierMultipliers: {
    basic: number
    premium: number
    luxury: number
  }
  baseScores: {
    threeStar: number
    fourStar: number
    fiveStar: number
  }
}

export interface MoisturizerScoreRequest {
  sessionId: string
  coveragePercentage: number
  moisturizerTier: MoisturizerTier
  completionTime: number
  toolEfficiency: number
}

// Scene integration types
export interface MoisturizerStepConfig {
  stepOrder: number
  faceAssetId: string
  faceBounds: BoundingBox
  previousStepResult: PreviousStepResult
}

export interface PreviousStepResult {
  isComplete: boolean
  cleanlinessScore?: number
  maskScore?: number
}

export interface MoisturizerStepResult {
  stepId: 'moisturizer_application'
  isComplete: boolean
  coveragePercentage: number
  satisfactionScore: SatisfactionScore
  moisturizerTypeId: string
  sessionDuration: number
  canProceed: boolean
}

export interface SpaSessionState {
  steps: Array<{
    stepId: string
    isComplete: boolean
    result: unknown
  }>
  currentStepIndex: number
  overallScore: number
  canCompleteSession: boolean
}
