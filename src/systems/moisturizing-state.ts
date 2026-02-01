/**
 * Moisturizing State Management System
 *
 * Manages the global moisturizing state including coverage zones,
 * progress tracking, completion detection, and tool integration.
 * Mirrors the pattern from src/systems/cleaning-state.ts
 */

import { MOISTURIZING_CONFIG } from '../constants/moisturizing-config'
import {
  type BoundingBox,
  type MoisturizerState,
  type MoisturizerTier,
  MoisturizingEventManager,
  type MoisturizingSessionConfig,
  type Position,
  type SatisfactionScore,
  type ValidationResult,
  type ZoneUpdateResult,
} from '../events'
import { CoverageZone } from '../gameobjects/coverage-zone'
import { MoisturizerTool } from '../gameobjects/moisturizer-tool'

export class MoisturizingStateManager {
  private state: MoisturizerState
  private zones: Map<string, CoverageZone> = new Map()
  private tool: MoisturizerTool | null = null
  private lastToolPosition: Position | null = null
  private eventManager: MoisturizingEventManager
  private sessionConfig: MoisturizingSessionConfig | null = null

  constructor() {
    this.eventManager = MoisturizingEventManager.getInstance()
    this.state = this.createInitialState()
  }

  private createInitialState(): MoisturizerState {
    return {
      sessionId: '',
      selectedMoisturizerId: '',
      totalZones: 0,
      coveredZones: 0,
      coveragePercentage: 0,
      isComplete: false,
      startTime: 0,
      completionTime: null,
      trailPositions: [],
      sessionState: 'initialized',
    }
  }

  /**
   * Initialize a new moisturizing session
   */
  public initialize(config: MoisturizingSessionConfig): void {
    this.sessionConfig = config
    this.state = {
      sessionId: config.sessionId,
      selectedMoisturizerId: config.moisturizerTypeId,
      totalZones: 0,
      coveredZones: 0,
      coveragePercentage: 0,
      isComplete: false,
      startTime: Date.now(),
      completionTime: null,
      trailPositions: [],
      sessionState: 'initialized',
    }

    // Generate coverage zones from face bounds
    this.generateZones(config.faceBounds, config.zoneGridSize)

    // Emit initialization event
    this.eventManager.emitMoisturizerSelected({
      sessionId: config.sessionId,
      moisturizerId: config.moisturizerTypeId,
      tier: this.getMoisturizerTier(config.moisturizerTypeId),
      color: this.getMoisturizerColor(config.moisturizerTypeId),
      timestamp: Date.now(),
    })
  }

  /**
   * Generate coverage zones based on face bounds and grid size
   */
  private generateZones(faceBounds: BoundingBox, gridSize: number): void {
    this.zones.clear()

    const cols = Math.ceil(faceBounds.width / gridSize)
    const rows = Math.ceil(faceBounds.height / gridSize)
    let zoneId = 0

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const bounds: BoundingBox = {
          x: faceBounds.x + col * gridSize,
          y: faceBounds.y + row * gridSize,
          width: Math.min(
            gridSize,
            faceBounds.x + faceBounds.width - (faceBounds.x + col * gridSize),
          ),
          height: Math.min(
            gridSize,
            faceBounds.y + faceBounds.height - (faceBounds.y + row * gridSize),
          ),
        }

        const zone = new CoverageZone(`zone-${zoneId}`, bounds)
        this.zones.set(zone.id, zone)
        zoneId++
      }
    }

    this.state.totalZones = this.zones.size
  }

  /**
   * Set the moisturizer tool
   */
  public setTool(tool: MoisturizerTool): void {
    this.tool = tool
  }

  /**
   * Get the moisturizer tool
   */
  public getTool(): MoisturizerTool | null {
    return this.tool
  }

  /**
   * Update coverage based on current tool position
   * Call this in the game update loop
   */
  public updateCoverage(): ZoneUpdateResult {
    if (!this.tool || !this.tool.isActive) {
      return {
        zonesActivated: 0,
        totalCovered: this.state.coveredZones,
        coveragePercentage: this.state.coveragePercentage,
        isNewCoverage: false,
      }
    }

    // Change state to applying on first active use
    if (this.state.sessionState === 'initialized') {
      this.state.sessionState = 'applying'
    }

    const result = this.processCoverageUpdate(
      this.tool.position,
      this.tool.radius,
    )

    // Update last position
    this.lastToolPosition = { ...this.tool.position }

    return result
  }

  /**
   * Process coverage update for a specific position and radius
   */
  private processCoverageUpdate(
    toolPosition: Position,
    toolRadius: number,
  ): ZoneUpdateResult {
    const zonesArray = Array.from(this.zones.values())
    let newCoverages = 0

    // Check all zones for overlap (spatial optimization could be added here)
    for (const zone of zonesArray) {
      if (zone.isCovered) continue

      if (zone.overlapsWithTool(toolPosition, toolRadius)) {
        const wasNewCoverage = zone.cover()
        if (wasNewCoverage) {
          newCoverages++
          this.emitZoneCovered(zone.id)
        }
      }
    }

    // Update state if there were new coverages
    if (newCoverages > 0) {
      this.state.coveredZones += newCoverages
      this.updateCoveragePercentage()
      this.emitProgressUpdated()
      this.checkCompletion()
    }

    return {
      zonesActivated: newCoverages,
      totalCovered: this.state.coveredZones,
      coveragePercentage: this.state.coveragePercentage,
      isNewCoverage: newCoverages > 0,
    }
  }

  /**
   * Update coverage percentage
   */
  private updateCoveragePercentage(): void {
    if (this.state.totalZones === 0) {
      this.state.coveragePercentage = 0
      return
    }

    this.state.coveragePercentage = Math.min(
      100,
      Math.round((this.state.coveredZones / this.state.totalZones) * 100),
    )
  }

  /**
   * Check if completion threshold is reached
   */
  private checkCompletion(): void {
    const threshold =
      this.sessionConfig?.completionThreshold ??
      MOISTURIZING_CONFIG.zones.completionThreshold

    if (
      this.state.coveragePercentage >= threshold * 100 &&
      !this.state.isComplete
    ) {
      this.state.isComplete = true
      this.state.completionTime = Date.now() - this.state.startTime
      this.state.sessionState = 'complete'

      this.eventManager.emitCompletionThresholdMet({
        sessionId: this.state.sessionId,
        coveragePercentage: this.state.coveragePercentage,
        timestamp: Date.now(),
      })

      this.eventManager.emitSessionCompleted({
        sessionId: this.state.sessionId,
        coveragePercentage: this.state.coveragePercentage,
        completionTime: this.state.completionTime,
        timestamp: Date.now(),
      })
    }
  }

  /**
   * Calculate satisfaction score
   */
  public calculateSatisfactionScore(
    moisturizerTier: MoisturizerTier,
  ): SatisfactionScore {
    const startCalcTime = Date.now()

    // Determine star rating based on coverage
    let starRating: 3 | 4 | 5
    if (this.state.coveragePercentage >= 100) {
      starRating = 5
    } else if (this.state.coveragePercentage >= 95) {
      starRating = 4
    } else {
      starRating = 3
    }

    // Get base score from star rating
    const baseScores = MOISTURIZING_CONFIG.scoring.baseScores
    const baseScore =
      baseScores[
        starRating === 5
          ? 'fiveStar'
          : starRating === 4
            ? 'fourStar'
            : 'threeStar'
      ]

    // Apply tier multiplier
    const multiplier = MOISTURIZING_CONFIG.scoring.multipliers[moisturizerTier]
    const finalScore = Math.floor(baseScore * multiplier)

    const calculationTime = Date.now() - startCalcTime

    const score: SatisfactionScore = {
      coveragePercentage: this.state.coveragePercentage,
      starRating,
      baseScore,
      moisturizerMultiplier: multiplier,
      finalScore,
      calculationTime,
    }

    this.state.sessionState = 'scored'

    this.eventManager.emitScoreCalculated({
      sessionId: this.state.sessionId,
      score,
      timestamp: Date.now(),
    })

    return score
  }

  /**
   * Validate if coverage meets requirements
   */
  public validateCoverage(): ValidationResult {
    const threshold =
      this.sessionConfig?.completionThreshold ??
      MOISTURIZING_CONFIG.zones.completionThreshold
    const requiredPercentage = threshold * 100

    return {
      isValid: this.state.coveragePercentage >= requiredPercentage,
      coverage: this.state.coveragePercentage,
      requiredCoverage: requiredPercentage,
      message:
        this.state.coveragePercentage >= requiredPercentage
          ? 'Coverage requirement met!'
          : `Need ${Math.round(requiredPercentage - this.state.coveragePercentage)}% more coverage`,
    }
  }

  /**
   * Get current state
   */
  public getState(): MoisturizerState {
    return { ...this.state }
  }

  /**
   * Get all zones
   */
  public getZones(): CoverageZone[] {
    return Array.from(this.zones.values())
  }

  /**
   * Get covered zones count
   */
  public getCoveredZonesCount(): number {
    return this.state.coveredZones
  }

  /**
   * Get total zones count
   */
  public getTotalZonesCount(): number {
    return this.state.totalZones
  }

  /**
   * Get coverage percentage
   */
  public getCoveragePercentage(): number {
    return this.state.coveragePercentage
  }

  /**
   * Check if session is complete
   */
  public isComplete(): boolean {
    return this.state.isComplete
  }

  /**
   * Reset the state manager
   */
  public reset(): void {
    this.state = this.createInitialState()
    this.zones.clear()
    this.tool = null
    this.lastToolPosition = null
    this.sessionConfig = null
  }

  /**
   * Get moisturizer tier from ID (helper method)
   */
  private getMoisturizerTier(moisturizerId: string): MoisturizerTier {
    if (moisturizerId.includes('premium')) return 'premium'
    if (moisturizerId.includes('luxury')) return 'luxury'
    return 'basic'
  }

  /**
   * Get moisturizer color from ID (helper method)
   */
  private getMoisturizerColor(moisturizerId: string): string {
    if (moisturizerId.includes('premium'))
      return MOISTURIZING_CONFIG.colors.premium
    if (moisturizerId.includes('luxury'))
      return MOISTURIZING_CONFIG.colors.luxury
    return MOISTURIZING_CONFIG.colors.basic
  }

  /**
   * Emit zone covered event
   */
  private emitZoneCovered(zoneId: string): void {
    this.eventManager.emitZoneCovered({
      sessionId: this.state.sessionId,
      zoneId,
      totalCovered: this.state.coveredZones,
      totalZones: this.state.totalZones,
      timestamp: Date.now(),
    })
  }

  /**
   * Emit progress updated event
   */
  private emitProgressUpdated(): void {
    this.eventManager.emitProgressUpdated({
      sessionId: this.state.sessionId,
      coveragePercentage: this.state.coveragePercentage,
      coveredZones: this.state.coveredZones,
      totalZones: this.state.totalZones,
      timestamp: Date.now(),
    })
  }
}

// Global state manager instance
let moisturizingStateManager: MoisturizingStateManager | null = null

export function initMoisturizingStateManager(): MoisturizingStateManager {
  if (!moisturizingStateManager) {
    moisturizingStateManager = new MoisturizingStateManager()
  }
  return moisturizingStateManager
}

export function getMoisturizingStateManager(): MoisturizingStateManager {
  if (!moisturizingStateManager) {
    throw new Error(
      'Moisturizing state manager not initialized. Call initMoisturizingStateManager() first.',
    )
  }
  return moisturizingStateManager
}

export function resetMoisturizingStateManager(): void {
  moisturizingStateManager = null
}
