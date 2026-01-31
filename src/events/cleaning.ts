/**
 * Cleaning Events
 *
 * Event definitions for the face cleaning mechanic including
 * dirt spot cleaning, tool interactions, and progress tracking.
 */

export interface CleaningEventMap {
  // Dirt spot events
  'dirt-spot-cleaned': {
    spotId: string
    position: { x: number; y: number }
    points: number
    timestamp: number
  }

  // Face region events
  'region-cleaned': {
    regionId: string
    cleanliness: number
    maskReady: boolean
    timestamp: number
  }

  // Tool events
  'eraser-activated': {
    toolId: string
    position: { x: number; y: number }
    timestamp: number
  }

  'eraser-moved': {
    toolId: string
    fromPosition: { x: number; y: number }
    toPosition: { x: number; y: number }
    timestamp: number
  }

  'eraser-deactivated': {
    toolId: string
    finalPosition: { x: number; y: number }
    timestamp: number
  }

  // Cleaning completion events
  'cleaning-completed': {
    totalSpots: number
    finalScore: number
    completionTime: number
    timestamp: number
  }

  'cleaning-progress': {
    cleanedSpots: number
    totalSpots: number
    progress: number
    timestamp: number
  }
}

// Event type helpers
export type DirtSpotCleanedEvent = CleaningEventMap['dirt-spot-cleaned']
export type RegionCleanedEvent = CleaningEventMap['region-cleaned']
export type EraserActivatedEvent = CleaningEventMap['eraser-activated']
export type EraserMovedEvent = CleaningEventMap['eraser-moved']
export type EraserDeactivatedEvent = CleaningEventMap['eraser-deactivated']
export type CleaningCompletedEvent = CleaningEventMap['cleaning-completed']
export type CleaningProgressEvent = CleaningEventMap['cleaning-progress']
