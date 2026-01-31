/**
 * Cleaning Configuration Constants
 *
 * Configuration values for the face cleaning mechanic including
 * eraser settings, dirt spot properties, and scoring.
 */

export const CLEANING_CONFIG = {
  // Eraser settings
  eraser: {
    defaultRadius: 32,
    minRadius: 16,
    maxRadius: 48,
  },

  // Dirt spot settings
  dirtSpots: {
    count: 50,
    minPoints: 5,
    maxPoints: 15,
    size: 4,
  },

  // Face region settings
  faceRegions: {
    requiredCleanliness: 0.8, // 80% clean for mask readiness
    regionCount: 3,
  },

  // Scoring settings
  scoring: {
    pointsPerSpot: 10,
    bonusMultiplier: 1.5,
    completionBonus: 100,
  },

  // Performance settings
  performance: {
    maxDirtSpots: 100,
    targetFPS: 60,
    maxResponseTime: 100, // ms
  },
} as const

export type CleaningConfig = typeof CLEANING_CONFIG
