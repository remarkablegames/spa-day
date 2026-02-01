/**
 * Moisturizing Events Manager
 *
 * Handles event emission and listening for moisturizing-related events.
 * Mirrors the pattern from src/events/cleaning.ts
 */

import type {
  CompletionThresholdMetEvent,
  MoisturizerSelectedEvent,
  MoisturizingEventMap,
  ProgressUpdatedEvent,
  ScoreCalculatedEvent,
  SessionCompletedEvent,
  ToolActivatedEvent,
  ToolDeactivatedEvent,
  ToolMovedEvent,
  ZoneCoveredEvent,
} from './moisturizing-types'

export class MoisturizingEventManager {
  private static instance: MoisturizingEventManager
  private listeners: Map<
    keyof MoisturizingEventMap,
    Array<(event: unknown) => void>
  > = new Map()

  private constructor() {
    // Initialize listener maps for all event types
    const eventTypes: (keyof MoisturizingEventMap)[] = [
      'moisturizer-selected',
      'tool-activated',
      'tool-moved',
      'tool-deactivated',
      'zone-covered',
      'progress-updated',
      'completion-threshold-met',
      'session-completed',
      'score-calculated',
    ]

    eventTypes.forEach((eventType) => {
      this.listeners.set(eventType, [])
    })
  }

  public static getInstance(): MoisturizingEventManager {
    if (!MoisturizingEventManager.instance) {
      MoisturizingEventManager.instance = new MoisturizingEventManager()
    }
    return MoisturizingEventManager.instance
  }

  /**
   * Register event listener
   */
  public on<K extends keyof MoisturizingEventMap>(
    eventType: K,
    callback: (event: MoisturizingEventMap[K]) => void,
  ): void {
    const currentListeners = this.listeners.get(eventType) || []
    currentListeners.push(callback as (event: unknown) => void)
    this.listeners.set(eventType, currentListeners)
  }

  /**
   * Remove event listener
   */
  public off<K extends keyof MoisturizingEventMap>(
    eventType: K,
    callback: (event: MoisturizingEventMap[K]) => void,
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
  public emit<K extends keyof MoisturizingEventMap>(
    eventType: K,
    event: MoisturizingEventMap[K],
  ): void {
    const currentListeners = this.listeners.get(eventType) || []
    currentListeners.forEach((listener) => {
      try {
        listener(event)
      } catch {
        // TODO: Handle error logging when integrated with scene
      }
    })
  }

  /**
   * Emit moisturizer selected event
   */
  public emitMoisturizerSelected(event: MoisturizerSelectedEvent): void {
    this.emit('moisturizer-selected', event)
  }

  /**
   * Emit tool activated event
   */
  public emitToolActivated(event: ToolActivatedEvent): void {
    this.emit('tool-activated', event)
  }

  /**
   * Emit tool moved event
   */
  public emitToolMoved(event: ToolMovedEvent): void {
    this.emit('tool-moved', event)
  }

  /**
   * Emit tool deactivated event
   */
  public emitToolDeactivated(event: ToolDeactivatedEvent): void {
    this.emit('tool-deactivated', event)
  }

  /**
   * Emit zone covered event
   */
  public emitZoneCovered(event: ZoneCoveredEvent): void {
    this.emit('zone-covered', event)
  }

  /**
   * Emit progress updated event
   */
  public emitProgressUpdated(event: ProgressUpdatedEvent): void {
    this.emit('progress-updated', event)
  }

  /**
   * Emit completion threshold met event
   */
  public emitCompletionThresholdMet(event: CompletionThresholdMetEvent): void {
    this.emit('completion-threshold-met', event)
  }

  /**
   * Emit session completed event
   */
  public emitSessionCompleted(event: SessionCompletedEvent): void {
    this.emit('session-completed', event)
  }

  /**
   * Emit score calculated event
   */
  public emitScoreCalculated(event: ScoreCalculatedEvent): void {
    this.emit('score-calculated', event)
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
