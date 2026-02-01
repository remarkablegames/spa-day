/**
 * Base system manager interface
 * All system managers should implement this interface for consistency
 */

export interface BaseSystemManager {
  /** Initialize the system */
  initialize(): void

  /** Clean up and destroy the system */
  destroy(): void

  /** Check if system is initialized */
  isInitialized(): boolean
}

/**
 * System manager with save/load capabilities
 */
export interface PersistentSystemManager extends BaseSystemManager {
  /** Save current state to storage */
  save(): boolean

  /** Load state from storage */
  load(): boolean

  /** Reset to default state */
  reset(): void
}

/**
 * Event emitter interface for systems that emit events
 */
export interface EventEmitter<
  T extends Record<string, (...args: unknown[]) => void>,
> {
  /** Subscribe to an event */
  on<K extends keyof T>(event: K, callback: T[K]): () => void

  /** Unsubscribe from an event */
  off<K extends keyof T>(event: K, callback: T[K]): void

  /** Emit an event */
  emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): void
}

/**
 * Singleton pattern helper for system managers
 */
export abstract class SingletonSystemManager implements BaseSystemManager {
  private static instances: Map<string, SingletonSystemManager> = new Map()
  protected initialized = false

  protected constructor() {}

  static getInstance<T extends SingletonSystemManager>(this: new () => T): T {
    const className = this.name
    if (!SingletonSystemManager.instances.has(className)) {
      SingletonSystemManager.instances.set(className, new this())
    }
    return SingletonSystemManager.instances.get(className) as T
  }

  abstract initialize(): void
  abstract destroy(): void

  isInitialized(): boolean {
    return this.initialized
  }
}

/**
 * Performance monitoring mixin for system managers
 */
export interface PerformanceMonitored {
  /** Get last operation time in milliseconds */
  getLastOperationTime(): number

  /** Get average operation time */
  getAverageOperationTime(): number

  /** Reset performance metrics */
  resetPerformanceMetrics(): void
}

/**
 * Error handling interface
 */
export interface ErrorHandled {
  /** Last error that occurred */
  getLastError(): Error | null

  /** Clear error state */
  clearError(): void

  /** Check if system is in error state */
  hasError(): boolean
}
