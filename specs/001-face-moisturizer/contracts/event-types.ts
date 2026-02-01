/**
 * Moisturizing Event Types
 *
 * Type definitions for the moisturizing event system.
 * Mirrors the pattern from src/events/cleaning-types.ts
 */

import type { Position, SatisfactionScore } from './moisturizer-types'

export interface MoisturizerSelectedEvent {
  sessionId: string
  moisturizerId: string
  tier: 'basic' | 'premium' | 'luxury'
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
