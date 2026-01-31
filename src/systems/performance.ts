/**
 * Performance monitoring and optimization utilities
 */

import { GAME_CONFIG } from '../constants/game-config'

export interface PerformanceMetrics {
  fps: number
  memoryUsage: number
  drawCalls: number
  objectCount: number
}

export class PerformanceMonitor {
  private frameCount: number = 0
  private lastTime: number = 0
  private fps: number = 60
  private metrics: PerformanceMetrics = {
    fps: 60,
    memoryUsage: 0,
    drawCalls: 0,
    objectCount: 0,
  }

  constructor() {
    this.lastTime = Date.now()
  }

  public update(): void {
    this.frameCount++
    const currentTime = Date.now()
    const deltaTime = currentTime - this.lastTime

    if (deltaTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / deltaTime)
      this.frameCount = 0
      this.lastTime = currentTime
      this.metrics.fps = this.fps

      // Update memory usage if available
      if ('memory' in performance) {
        this.metrics.memoryUsage = Math.round(
          (performance.memory as { usedJSHeapSize: number }).usedJSHeapSize /
            1048576,
        )
      }
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  public isPerformanceGood(): boolean {
    return this.fps >= 50 && this.metrics.memoryUsage < GAME_CONFIG.MEMORY_LIMIT
  }

  public shouldOptimize(): boolean {
    return (
      this.fps < 45 || this.metrics.memoryUsage > GAME_CONFIG.MEMORY_LIMIT * 0.8
    )
  }
}

// Global performance monitor instance
let performanceMonitor: PerformanceMonitor | null = null

export function initPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor()
  }
  return performanceMonitor
}

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor) {
    throw new Error('Performance monitor not initialized')
  }
  return performanceMonitor
}

// Object pooling for frequently created/destroyed objects
export class ObjectPool<T> {
  private pool: T[] = []
  private createFn: () => T
  private resetFn: (obj: T) => void

  constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize = 10) {
    this.createFn = createFn
    this.resetFn = resetFn

    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(createFn())
    }
  }

  public get(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!
    }
    return this.createFn()
  }

  public release(obj: T): void {
    this.resetFn(obj)
    this.pool.push(obj)
  }

  public clear(): void {
    this.pool = []
  }
}

// FPS limiter to maintain consistent performance
export class FPSLimiter {
  private targetFPS: number
  private frameTime: number
  private lastFrameTime: number = 0

  constructor(targetFPS: number = GAME_CONFIG.TARGET_FPS) {
    this.targetFPS = targetFPS
    this.frameTime = 1000 / targetFPS
    this.lastFrameTime = performance.now()
  }

  public shouldRender(): boolean {
    const now = performance.now()
    const elapsed = now - this.lastFrameTime

    if (elapsed >= this.frameTime) {
      this.lastFrameTime = now - (elapsed % this.frameTime)
      return true
    }

    return false
  }
}
