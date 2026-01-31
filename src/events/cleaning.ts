/**
 * Cleaning Events Manager
 *
 * Handles event emission and listening for cleaning-related events
 * Integrates eraser tool events with the cleaning state system.
 */

import type {
  CleaningCompletedEvent,
  CleaningEventMap,
  CleaningProgressEvent,
  DirtSpotCleanedEvent,
  EraserActivatedEvent,
  EraserDeactivatedEvent,
  EraserMovedEvent,
  RegionCleanedEvent,
} from './cleaning-types'

export class CleaningEventManager {
  private static instance: CleaningEventManager
  private listeners: Map<
    keyof CleaningEventMap,
    Array<(event: unknown) => void>
  > = new Map()

  private constructor() {
    // Initialize listener maps for all event types
    const eventTypes: (keyof CleaningEventMap)[] = [
      'dirt-spot-cleaned',
      'region-cleaned',
      'eraser-activated',
      'eraser-moved',
      'eraser-deactivated',
      'cleaning-completed',
      'cleaning-progress',
    ]

    eventTypes.forEach((eventType) => {
      this.listeners.set(eventType, [])
    })
  }

  public static getInstance(): CleaningEventManager {
    if (!CleaningEventManager.instance) {
      CleaningEventManager.instance = new CleaningEventManager()
    }
    return CleaningEventManager.instance
  }

  /**
   * Register event listener
   */
  public on<K extends keyof CleaningEventMap>(
    eventType: K,
    callback: (event: CleaningEventMap[K]) => void,
  ): void {
    const currentListeners = this.listeners.get(eventType) || []
    currentListeners.push(callback as (event: unknown) => void)
    this.listeners.set(eventType, currentListeners)
  }

  /**
   * Remove event listener
   */
  public off<K extends keyof CleaningEventMap>(
    eventType: K,
    callback: (event: CleaningEventMap[K]) => void,
  ): void {
    const currentListeners = this.listeners.get(eventType) || []
    const filteredListeners = currentListeners.filter(
      (listener) => listener !== callback,
    )
    this.listeners.set(eventType, filteredListeners)
  }

  /**
   * Emit event to all listeners
   */
  public emit<K extends keyof CleaningEventMap>(
    eventType: K,
    event: CleaningEventMap[K],
  ): void {
    const currentListeners = this.listeners.get(eventType) || []
    currentListeners.forEach((listener) => {
      try {
        listener(event)
      } catch {
        // TODO: Handle error logging when integrated with scene
        // console.error(`Error in event listener for ${String(eventType)}:`, error)
      }
    })
  }

  /**
   * Emit dirt spot cleaned event
   */
  public emitDirtSpotCleaned(event: DirtSpotCleanedEvent): void {
    this.emit('dirt-spot-cleaned', event)
  }

  /**
   * Emit region cleaned event
   */
  public emitRegionCleaned(event: RegionCleanedEvent): void {
    this.emit('region-cleaned', event)
  }

  /**
   * Emit eraser activated event
   */
  public emitEraserActivated(event: EraserActivatedEvent): void {
    this.emit('eraser-activated', event)
  }

  /**
   * Emit eraser moved event
   */
  public emitEraserMoved(event: EraserMovedEvent): void {
    this.emit('eraser-moved', event)
  }

  /**
   * Emit eraser deactivated event
   */
  public emitEraserDeactivated(event: EraserDeactivatedEvent): void {
    this.emit('eraser-deactivated', event)
  }

  /**
   * Emit cleaning completed event
   */
  public emitCleaningCompleted(event: CleaningCompletedEvent): void {
    this.emit('cleaning-completed', event)
  }

  /**
   * Emit cleaning progress event
   */
  public emitCleaningProgress(event: CleaningProgressEvent): void {
    this.emit('cleaning-progress', event)
  }

  /**
   * Clear all listeners
   */
  public clearAllListeners(): void {
    this.listeners.forEach((_, key) => {
      this.listeners.set(key, [])
    })
  }
}
