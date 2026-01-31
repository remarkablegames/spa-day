import { Vec2 } from 'kaplay'

import { GAME_CONFIG } from '../constants/game-config'

export interface VisualEffect {
  id: string
  type: 'particle' | 'glow' | 'pulse' | 'sparkle'
  position: Vec2
  duration: number
  startTime: number
  isActive: boolean
}

export class VisualFeedbackSystem {
  private effects: VisualEffect[] = []
  private particlePool: Array<{
    id: string
    position: Vec2
    velocity: Vec2
    lifetime: number
    maxLifetime: number
    size: number
    color: string
    isActive: boolean
  }> = []

  constructor() {
    this.initializeParticlePool()
  }

  private initializeParticlePool() {
    // Create a pool of reusable particle objects
    for (let i = 0; i < GAME_CONFIG.PARTICLE_COUNT; i++) {
      this.particlePool.push({
        id: `particle_${i}`,
        position: vec2(0, 0),
        velocity: vec2(0, 0),
        lifetime: 0,
        maxLifetime: 1,
        size: 4,
        color: GAME_CONFIG.COLORS.UI_ACCENT,
        isActive: false,
      })
    }
  }

  public createMaskApplicationEffect(position: Vec2, maskType: string): void {
    // Create sparkle effect for mask application
    const sparkleCount = 8
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (Math.PI * 2 * i) / sparkleCount
      const distance = 20
      const targetPos = vec2(
        position.x + Math.cos(angle) * distance,
        position.y + Math.sin(angle) * distance,
      )

      this.createParticle({
        id: `sparkle_${Date.now()}_${i}`,
        type: 'sparkle',
        position: position,
        targetPosition: targetPos,
        color: this.getMaskColor(maskType),
        size: 3,
        lifetime: 0.5,
      })
    }

    // Create glow effect
    this.createGlowEffect(position, maskType)
  }

  public createTreatmentCompleteEffect(position: Vec2): void {
    // Create completion celebration effect
    const particleCount = 12
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount
      const speed = 100 + Math.random() * 50
      const velocity = vec2(Math.cos(angle) * speed, Math.sin(angle) * speed)

      this.createParticle({
        id: `completion_${Date.now()}_${i}`,
        type: 'particle',
        position: position,
        velocity: velocity,
        color: GAME_CONFIG.COLORS.SATISFACTION_HIGH,
        size: 4 + Math.random() * 4,
        lifetime: 1.5,
      })
    }

    // Create pulse effect
    this.createPulseEffect(position)
  }

  public createScorePopupEffect(position: Vec2, score: number): void {
    // Create floating score text
    const scoreText = add([
      text(`+${score}`, { size: 24, font: 'bold' }),
      pos(position),
      color(GAME_CONFIG.COLORS.SATISFACTION_HIGH),
      z(200),
      stay(),
      opacity(),
    ])

    // Animate the score popup
    scoreText.onUpdate(() => {
      scoreText.move(0, -100 * dt())
      scoreText.opacity -= dt()
      if (scoreText.opacity <= 0) {
        destroy(scoreText)
      }
    })

    // Create small sparkle effect
    this.createParticle({
      id: `score_${Date.now()}`,
      type: 'sparkle',
      position: position,
      velocity: vec2(0, -50),
      color: GAME_CONFIG.COLORS.SATISFACTION_HIGH,
      size: 2,
      lifetime: 0.3,
    })
  }

  public createErrorEffect(position: Vec2): void {
    // Create error feedback (red X or shake)
    const errorText = add([
      text('✗', { size: 32, font: 'bold' }),
      pos(position),
      color(GAME_CONFIG.COLORS.SATISFACTION_LOW),
      z(200),
      stay(),
      opacity(),
    ])

    // Shake animation
    const originalPos = errorText.pos
    let shakeTime = 0
    errorText.onUpdate(() => {
      shakeTime += dt()
      if (shakeTime < 0.5) {
        errorText.pos = originalPos.add(
          vec2(Math.sin(shakeTime * 30) * 5, Math.cos(shakeTime * 30) * 5),
        )
      } else {
        errorText.pos = originalPos
        errorText.opacity -= dt()
        if (errorText.opacity <= 0) {
          destroy(errorText)
        }
      }
    })
  }

  public createUnlockEffect(position: Vec2): void {
    // Create unlock celebration effect
    const colors = [
      GAME_CONFIG.COLORS.UI_ACCENT,
      GAME_CONFIG.COLORS.SATISFACTION_HIGH,
      '#FFD700', // Gold
    ]

    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 * i) / 16
      const speed = 80 + Math.random() * 40
      const velocity = vec2(Math.cos(angle) * speed, Math.sin(angle) * speed)

      this.createParticle({
        id: `unlock_${Date.now()}_${i}`,
        type: 'particle',
        position: position,
        velocity: velocity,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 3,
        lifetime: 2,
      })
    }

    // Create star burst effect
    this.createStarBurst(position)
  }

  private createParticle(config: {
    id: string
    type: string
    position: Vec2
    targetPosition?: Vec2
    velocity?: Vec2
    color: string
    size: number
    lifetime: number
  }): void {
    const particle = add([
      circle(config.size),
      pos(config.position),
      color(config.color),
      opacity(1),
      z(150),
      stay(),
    ])

    let lifetime = 0

    particle.onUpdate(() => {
      lifetime += dt()

      if (config.targetPosition) {
        // Move towards target position
        const direction = config.targetPosition.sub(particle.pos)
        const distance = direction.len()

        if (distance > 1) {
          particle.pos = particle.pos.add(direction.unit().scale(200 * dt()))
        }
      } else if (config.velocity) {
        // Apply velocity
        particle.pos = particle.pos.add(config.velocity.scale(dt()))
      }

      // Fade out
      particle.opacity = Math.max(0, 1 - lifetime / config.lifetime)

      // Remove when done
      if (lifetime >= config.lifetime) {
        destroy(particle)
      }
    })
  }

  private createGlowEffect(position: Vec2, maskType: string): void {
    const glow = add([
      circle(GAME_CONFIG.MASK_SIZE * 1.5),
      pos(position),
      color(this.getMaskColor(maskType)),
      opacity(0.3),
      z(50),
      stay(),
      { scale: 1 },
    ])

    let scale = 1
    glow.onUpdate(() => {
      scale += dt()
      glow.scale = scale
      glow.opacity = Math.max(0, 0.3 - (scale - 1) * 0.3)

      if (glow.opacity <= 0) {
        destroy(glow)
      }
    })
  }

  private createPulseEffect(position: Vec2): void {
    const pulse = add([
      circle(GAME_CONFIG.MASK_SIZE * 2),
      pos(position),
      color(GAME_CONFIG.COLORS.SATISFACTION_HIGH),
      opacity(0.5),
      z(50),
      stay(),
      { scale: 0.1 },
    ])

    let scale = 0.1
    pulse.onUpdate(() => {
      scale += dt() * 2
      pulse.scale = scale
      pulse.opacity = Math.max(0, 0.5 - (scale - 1) * 0.5)

      if (pulse.opacity <= 0) {
        destroy(pulse)
      }
    })
  }

  private createStarBurst(position: Vec2): void {
    const starCount = 8
    for (let i = 0; i < starCount; i++) {
      const angle = (Math.PI * 2 * i) / starCount
      const distance = 50 + Math.random() * 30
      const targetPos = vec2(
        position.x + Math.cos(angle) * distance,
        position.y + Math.sin(angle) * distance,
      )

      const star = add([
        polygon([
          vec2(0, -8),
          vec2(2, -2),
          vec2(8, -2),
          vec2(3, 2),
          vec2(5, 8),
          vec2(0, 4),
          vec2(-5, 8),
          vec2(-3, 2),
          vec2(-8, -2),
          vec2(-2, -2),
        ]),
        pos(position),
        color('#FFD700'),
        opacity(1),
        z(200),
        stay(),
        rotate(0),
      ])

      let progress = 0
      star.onUpdate(() => {
        progress += dt()
        star.pos = star.pos.add(targetPos.sub(star.pos).scale(dt() * 2))
        star.opacity = Math.max(0, 1 - progress)
        star.angle += dt() * 180

        if (progress >= 1) {
          destroy(star)
        }
      })
    }
  }

  private getMaskColor(maskType: string): string {
    switch (maskType) {
      case GAME_CONFIG.MASK_TYPES.HYDRATING:
        return GAME_CONFIG.COLORS.MASK_HYDRATING
      case GAME_CONFIG.MASK_TYPES.CLARIFYING:
        return GAME_CONFIG.COLORS.MASK_CLARIFYING
      case GAME_CONFIG.MASK_TYPES.ANTI_AGING:
        return GAME_CONFIG.COLORS.MASK_ANTI_AGING
      case GAME_CONFIG.MASK_TYPES.SOOTHING:
        return GAME_CONFIG.COLORS.MASK_SOOTHING
      case GAME_CONFIG.MASK_TYPES.DETOXIFYING:
        return GAME_CONFIG.COLORS.MASK_DETOXIFYING
      default:
        return GAME_CONFIG.COLORS.UI_ACCENT
    }
  }

  public update(): void {
    // Update all active effects
    this.effects = this.effects.filter((effect) => {
      if (!effect.isActive) return false

      const elapsed = Date.now() - effect.startTime
      if (elapsed >= effect.duration) {
        effect.isActive = false
        return false
      }

      return true
    })
  }

  public clearAllEffects(): void {
    this.effects.forEach((effect) => {
      effect.isActive = false
    })
    this.effects = []
  }
}

// Global visual feedback system instance
let visualFeedbackSystem: VisualFeedbackSystem | null = null

export function initVisualFeedbackSystem(): VisualFeedbackSystem {
  if (!visualFeedbackSystem) {
    visualFeedbackSystem = new VisualFeedbackSystem()
  }
  return visualFeedbackSystem
}

export function getVisualFeedbackSystem(): VisualFeedbackSystem {
  if (!visualFeedbackSystem) {
    throw new Error(
      'Visual feedback system not initialized. Call initVisualFeedbackSystem() first.',
    )
  }
  return visualFeedbackSystem
}
