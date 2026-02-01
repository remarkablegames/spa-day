/**
 * Moisturizing Configuration Constants
 *
 * Configuration values for the face moisturizer application mechanic including
 * zone settings, tool settings, visual settings, scoring thresholds, and colors.
 */

export const MOISTURIZING_CONFIG = {
  // Zone settings for coverage tracking
  zones: {
    gridSize: 45, // Pixels per zone (larger for easier application)
    completionThreshold: 0.85, // 85% for completion
    maxZones: 100, // Maximum zones per face
    minZones: 50, // Minimum zones per face
  },

  // Tool settings
  tool: {
    defaultRadius: 15,
    minRadius: 10,
    maxRadius: 25,
    smoothingFactor: 0.2,
    minMovementThreshold: 5, // Minimum 5px movement to register
  },

  // Visual settings
  visual: {
    maxTrailSegments: 10000, // High limit to allow full face coverage
    trailWidth: 8,
    minTrailDistance: 5, // Minimum 5px between trail points
    trailOpacity: 0.8,
    coveredZoneOpacity: 0.3, // Visual feedback for covered zones
  },

  // Scoring settings
  scoring: {
    thresholds: {
      threeStar: 85, // 85-94%
      fourStar: 95, // 95-99%
      fiveStar: 100, // 100%
    },
    baseScores: {
      threeStar: 100,
      fourStar: 150,
      fiveStar: 200,
    },
    multipliers: {
      basic: 1.0,
      premium: 1.2,
      luxury: 1.5,
    },
    maxCalculationTime: 100, // ms
  },

  // Colors for different moisturizer tiers
  colors: {
    basic: '#FFFFFF', // White
    premium: '#ADD8E6', // Light blue
    luxury: '#E6E6FA', // Lavender
  },

  // Performance settings
  performance: {
    targetFPS: 60,
    maxResponseTime: 50, // ms for input latency
    batchUpdateInterval: 16, // ms (roughly 1 frame at 60 FPS)
  },
} as const

export type MoisturizingConfig = typeof MOISTURIZING_CONFIG
