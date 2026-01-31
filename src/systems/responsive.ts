/**
 * Mobile responsiveness utilities
 */

import { GAME_CONFIG } from '../constants/game-config'

export interface ViewportMetrics {
  width: number
  height: number
  scale: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

export class ResponsiveManager {
  private metrics: ViewportMetrics
  private breakpoints = {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
  }

  constructor() {
    this.metrics = this.calculateMetrics()
    this.setupResizeListener()
  }

  private calculateMetrics(): ViewportMetrics {
    const screenWidth = width()
    const screenHeight = height()
    const scale = Math.min(
      screenWidth / GAME_CONFIG.SCREEN_WIDTH,
      screenHeight / GAME_CONFIG.SCREEN_HEIGHT,
    )

    return {
      width: screenWidth,
      height: screenHeight,
      scale,
      isMobile: screenWidth <= this.breakpoints.mobile,
      isTablet:
        screenWidth > this.breakpoints.mobile &&
        screenWidth <= this.breakpoints.tablet,
      isDesktop: screenWidth > this.breakpoints.tablet,
    }
  }

  private setupResizeListener(): void {
    onResize(() => {
      this.metrics = this.calculateMetrics()
      this.applyResponsiveScaling()
    })
  }

  private applyResponsiveScaling(): void {
    // Apply responsive scaling to UI elements
    const rootElement = document.documentElement
    if (rootElement) {
      rootElement.style.setProperty(
        '--scale-factor',
        this.metrics.scale.toString(),
      )
    }
  }

  public getMetrics(): ViewportMetrics {
    return { ...this.metrics }
  }

  public getScaledSize(baseSize: number): number {
    return Math.floor(baseSize * this.metrics.scale)
  }

  public getScaledPosition(basePos: { x: number; y: number }): {
    x: number
    y: number
  } {
    return {
      x: Math.floor(basePos.x * this.metrics.scale),
      y: Math.floor(basePos.y * this.metrics.scale),
    }
  }

  public getOptimalTouchTargetSize(): number {
    // Ensure touch targets are at least 44px on mobile
    const baseSize = GAME_CONFIG.MIN_TOUCH_TARGET_SIZE
    return this.metrics.isMobile
      ? Math.max(baseSize, 44)
      : this.getScaledSize(baseSize)
  }

  public adjustForMobile<T>(mobileValue: T, defaultValue: T): T {
    return this.metrics.isMobile ? mobileValue : defaultValue
  }

  public adjustForTablet<T>(tabletValue: T, defaultValue: T): T {
    return this.metrics.isTablet ? tabletValue : defaultValue
  }

  public getResponsiveLayout(): {
    columns: number
    spacing: number
    fontSize: number
  } {
    if (this.metrics.isMobile) {
      return {
        columns: 1,
        spacing: this.getScaledSize(10),
        fontSize: this.getScaledSize(14),
      }
    } else if (this.metrics.isTablet) {
      return {
        columns: 2,
        spacing: this.getScaledSize(15),
        fontSize: this.getScaledSize(16),
      }
    } else {
      return {
        columns: 3,
        spacing: this.getScaledSize(20),
        fontSize: this.getScaledSize(18),
      }
    }
  }
}

// Global responsive manager instance
let responsiveManager: ResponsiveManager | null = null

export function initResponsiveManager(): ResponsiveManager {
  if (!responsiveManager) {
    responsiveManager = new ResponsiveManager()
  }
  return responsiveManager
}

export function getResponsiveManager(): ResponsiveManager {
  if (!responsiveManager) {
    throw new Error('Responsive manager not initialized')
  }
  return responsiveManager
}

// Helper functions for common responsive calculations
export function getResponsiveFontSize(baseSize: number): number {
  const manager = getResponsiveManager()
  return manager.getScaledSize(baseSize)
}

export function getResponsiveSpacing(baseSpacing: number): number {
  const manager = getResponsiveManager()
  return manager.getScaledSize(baseSpacing)
}

export function isMobileDevice(): boolean {
  const manager = getResponsiveManager()
  return manager.getMetrics().isMobile
}

export function isTabletDevice(): boolean {
  const manager = getResponsiveManager()
  return manager.getMetrics().isTablet
}
