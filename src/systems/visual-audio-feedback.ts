import { GAME_CONFIG } from '../constants/game-config'

export interface FeedbackEvent {
  type:
    | 'mask_applied'
    | 'treatment_completed'
    | 'combo_achieved'
    | 'milestone_reached'
    | 'high_score'
    | 'satisfaction_boost'
  position?: { x: number; y: number }
  value?: number
  intensity: 'low' | 'medium' | 'high' | 'epic'
  timestamp: number
}

export class VisualAudioFeedbackSystem {
  private activeEffects: Map<string, string> = new Map()
  private soundEnabled: boolean = true
  private effectsEnabled: boolean = true

  constructor() {
    this.loadSettings()
  }

  private loadSettings(): void {
    try {
      const settings = getData(GAME_CONFIG.STORAGE_KEYS.GAME_SETTINGS)
      if (settings && typeof settings === 'object') {
        const settingsObj = settings as {
          soundEnabled?: boolean
          visualEffects?: boolean
        }
        this.soundEnabled = settingsObj.soundEnabled !== false
        this.effectsEnabled = settingsObj.visualEffects !== false
      }
    } catch {
      // Use defaults
    }
  }

  public triggerFeedback(event: FeedbackEvent): void {
    if (!this.effectsEnabled && !this.soundEnabled) return

    switch (event.type) {
      case 'mask_applied':
        this.handleMaskApplied(event)
        break
      case 'treatment_completed':
        this.handleTreatmentCompleted()
        break
      case 'combo_achieved':
        this.handleComboAchieved()
        break
      case 'milestone_reached':
        this.handleMilestoneReached()
        break
      case 'high_score':
        this.handleHighScore()
        break
      case 'satisfaction_boost':
        this.handleSatisfactionBoost(event)
        break
    }
  }

  private handleMaskApplied(event: FeedbackEvent): void {
    if (!event.position) return

    // Visual feedback
    if (this.effectsEnabled) {
      this.createMaskApplicationEffect(event.position, event.intensity)
    }

    // Audio feedback
    if (this.soundEnabled) {
      this.playMaskApplicationSound()
    }
  }

  private handleTreatmentCompleted(): void {
    // Visual feedback
    if (this.effectsEnabled) {
      this.createTreatmentCompletionEffect()
    }

    // Audio feedback
    if (this.soundEnabled) {
      this.playTreatmentCompletionSound()
    }
  }

  private handleComboAchieved(): void {
    // Visual feedback
    if (this.effectsEnabled) {
      this.createComboEffect()
    }

    // Audio feedback
    if (this.soundEnabled) {
      this.playComboSound()
    }
  }

  private handleMilestoneReached(): void {
    // Visual feedback
    if (this.effectsEnabled) {
      this.createMilestoneEffect()
    }

    // Audio feedback
    if (this.soundEnabled) {
      this.playMilestoneSound()
    }
  }

  private handleHighScore(): void {
    // Visual feedback
    if (this.effectsEnabled) {
      this.createHighScoreEffect()
    }

    // Audio feedback
    if (this.soundEnabled) {
      this.playHighScoreSound()
    }
  }

  private handleSatisfactionBoost(event: FeedbackEvent): void {
    if (!event.position) return

    // Visual feedback
    if (this.effectsEnabled) {
      this.createSatisfactionBoostEffect(event.position)
    }

    // Audio feedback
    if (this.soundEnabled) {
      this.playSatisfactionBoostSound()
    }
  }

  private createMaskApplicationEffect(
    position: { x: number; y: number },
    intensity: 'low' | 'medium' | 'high' | 'epic',
  ): void {
    const particleCount =
      intensity === 'epic'
        ? 15
        : intensity === 'high'
          ? 10
          : intensity === 'medium'
            ? 6
            : 3
    const colors = {
      low: [100, 200, 255],
      medium: [150, 100, 255],
      high: [255, 100, 200],
      epic: [255, 215, 0],
    }

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount
      const speed =
        intensity === 'epic'
          ? 100
          : intensity === 'high'
            ? 80
            : intensity === 'medium'
              ? 60
              : 40

      add([
        circle(
          intensity === 'epic'
            ? 6
            : intensity === 'high'
              ? 5
              : intensity === 'medium'
                ? 4
                : 3,
        ),
        pos(
          position.x + Math.cos(angle) * 10,
          position.y + Math.sin(angle) * 10,
        ),
        color(colors[intensity][0], colors[intensity][1], colors[intensity][2]),
        move((angle * 180) / Math.PI, speed),
        opacity(1),
        lifespan(1, { fade: 0.5 }),
        z(50),
      ])
    }

    // Ripple effect for high intensity
    if (intensity === 'high' || intensity === 'epic') {
      const ripple = add([
        circle(10),
        pos(width() / 2, height() / 2),
        color(255, 215, 0),
        opacity(0.3),
        z(90),
        scale(1),
      ])

      tween(
        10,
        intensity === 'epic' ? 60 : 40,
        0.5,
        (size) => (ripple.scale = vec2(size / 10, size / 10)),
        easings.easeOutQuad,
      )

      tween(
        0.6,
        0,
        0.5,
        (opacity) => (ripple.opacity = opacity),
        easings.easeOutQuad,
      )

      wait(0.5, () => destroy(ripple))
    }
  }

  private createTreatmentCompletionEffect(): void {
    const centerX = width() / 2
    const centerY = height() / 2
    const particleCount = 30

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2

      add([
        circle(Math.random() * 8 + 2),
        move((angle * 180) / Math.PI, 150 + Math.random() * 100),
        color(
          Math.random() * 55 + 200, // R: 200-255
          Math.random() * 105 + 150, // G: 150-255
          Math.random() * 100, // B: 0-100
        ),
        move((angle * 180) / Math.PI, 150 + Math.random() * 100),
        opacity(1),
        lifespan(2, { fade: 0.5 }),
        z(60),
      ])
    }

    // Celebration text
    const celebrationText = add([
      text('TREATMENT COMPLETE!', { size: 48, font: 'bold' }),
      pos(centerX, centerY),
      anchor('center'),
      color(255, 215, 0),
      opacity(0),
      z(70),
    ])

    tween(
      0,
      1,
      0.5,
      (opacity) => (celebrationText.opacity = opacity),
      easings.easeOutQuad,
    )

    tween(
      48,
      56,
      0.3,
      (size) => (celebrationText.textSize = size),
      easings.easeOutBack,
    )

    wait(2, () => destroy(celebrationText))
  }

  private createComboEffect(): void {
    const comboText = add([
      text('COMBO!', { size: 36, font: 'bold' }),
      pos(width() / 2, height() / 3),
      anchor('center'),
      color(255, 215, 0),
      opacity(0),
      z(100),
      scale(1),
    ])

    // Bounce in animation
    tween(
      0,
      1,
      0.3,
      (opacity) => (comboText.opacity = opacity),
      easings.easeOutBack,
    )

    tween(
      0,
      1.2,
      0.3,
      (scale) => (comboText.scale = vec2(scale, scale)),
      easings.easeOutBack,
    )

    tween(
      1.2,
      1,
      0.2,
      (scale) => (comboText.scale = vec2(scale, scale)),
      easings.easeInBack,
    )

    wait(1.5, () => destroy(comboText))

    // Sparkle effect
    for (let i = 0; i < 20; i++) {
      add([
        circle(2),
        pos(
          width() / 2 + Math.random() * 100 - 50,
          height() / 3 + Math.random() * 50 - 25,
        ),
        color(255, 215, 0),
        opacity(1),
        lifespan(1, { fade: 0.8 }),
        z(85),
      ])
    }
  }

  private createMilestoneEffect(): void {
    const milestoneText = add([
      text('MILESTONE!', { size: 42, font: 'bold' }),
      pos(width() / 2, height() / 2),
      anchor('center'),
      color(255, 215, 0),
      opacity(0),
      z(100),
      scale(1),
    ])

    // Dramatic entrance
    tween(
      0,
      1,
      0.5,
      (opacity) => (milestoneText.opacity = opacity),
      easings.easeOutQuad,
    )

    tween(
      0,
      1.5,
      0.5,
      (scale) => (milestoneText.scale = vec2(scale, scale)),
      easings.easeOutBack,
    )

    wait(2, () => destroy(milestoneText))

    // Star burst
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30
      add([
        circle(4),
        pos(width() / 2, height() / 2),
        color(255, 215, 0),
        move((angle * 180) / Math.PI, 200),
        opacity(1),
        lifespan(1.5, { fade: 0.5 }),
        z(95),
      ])
    }
  }

  private createHighScoreEffect(): void {
    const highScoreText = add([
      text('NEW HIGH SCORE!', { size: 52, font: 'bold' }),
      pos(width() / 2, height() / 2),
      anchor('center'),
      color(255, 215, 0),
      opacity(0),
      z(100),
      scale(1),
    ])

    // Pulsing effect
    tween(
      0,
      1,
      0.5,
      (opacity) => (highScoreText.opacity = opacity),
      easings.easeOutQuad,
    )

    let pulseCount = 0
    const pulse = () => {
      if (pulseCount >= 4) return

      tween(
        1,
        1.3,
        0.2,
        (scale) => (highScoreText.scale = vec2(scale, scale)),
        easings.easeOutBack,
      )

      tween(
        1.3,
        1,
        0.2,
        (scale) => (highScoreText.scale = vec2(scale, scale)),
        easings.easeInBack,
      )

      pulseCount++
      if (pulseCount < 4) {
        setTimeout(pulse, 400)
      }
    }

    pulse()

    wait(3, () => destroy(highScoreText))

    // Fireworks effect
    for (let j = 0; j < 5; j++) {
      setTimeout(() => {
        const x = Math.random() * width()
        const y = (Math.random() * height()) / 2

        for (let i = 0; i < 15; i++) {
          const angle = Math.random() * Math.PI * 2
          add([
            circle(3),
            pos(x, y),
            color(
              Math.random() * 55 + 200,
              Math.random() * 55 + 200,
              Math.random() * 100,
            ),
            move((angle * 180) / Math.PI, 50 + Math.random() * 100),
            opacity(1),
            lifespan(1.5, { fade: 0.5 }),
            z(105),
          ])
        }
      }, j * 200)
    }
  }

  private createSatisfactionBoostEffect(position: {
    x: number
    y: number
  }): void {
    const heart = add([
      text('❤️', { size: 24 }),
      pos(vec2(position.x, position.y)),
      anchor('center'),
      opacity(0),
      z(55),
    ])

    tween(
      0,
      1,
      0.3,
      (opacity) => (heart.opacity = opacity),
      easings.easeOutQuad,
    )

    tween(24, 32, 0.3, (size) => (heart.textSize = size), easings.easeOutBack)

    tween(
      heart.pos,
      vec2(position.x, position.y - 40),
      1.5,
      (pos) => (heart.pos = pos),
      easings.easeOutQuad,
    )

    tween(
      1,
      0,
      1.5,
      (opacity) => (heart.opacity = opacity),
      easings.easeOutQuad,
    )

    wait(1.5, () => destroy(heart))

    // Small sparkles
    for (let i = 0; i < 8; i++) {
      add([
        circle(2),
        pos(
          position.x + Math.random() * 30 - 15,
          position.y + Math.random() * 30 - 15,
        ),
        color(255, 100, 150),
        opacity(1),
        lifespan(1, { fade: 0.8 }),
        z(56),
      ])
    }
  }

  // Audio feedback methods (placeholder implementations)
  private playMaskApplicationSound(): void {
    // Placeholder: play('mask_apply', { volume: intensity === 'epic' ? 0.8 : intensity === 'high' ? 0.6 : 0.4 })
  }

  private playTreatmentCompletionSound(): void {
    // Placeholder: play('treatment_complete', { volume: 0.8 })
  }

  private playComboSound(): void {
    // Placeholder: play('combo', { volume: 0.7, detune: 0 })
  }

  private playMilestoneSound(): void {
    // Placeholder: play('milestone', { volume: 0.9 })
  }

  private playHighScoreSound(): void {
    // Placeholder: play('high_score', { volume: 1.0 })
  }

  private playSatisfactionBoostSound(): void {
    // Placeholder: play('satisfaction_boost', { volume: 0.5 })
  }

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled
    this.saveSettings()
  }

  public setEffectsEnabled(enabled: boolean): void {
    this.effectsEnabled = enabled
    this.saveSettings()
  }

  private saveSettings(): void {
    try {
      const settings = {
        soundEnabled: this.soundEnabled,
        visualEffects: this.effectsEnabled,
      }
      setData(GAME_CONFIG.STORAGE_KEYS.GAME_SETTINGS, settings)
    } catch {
      // Silently fail
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled
  }

  public areEffectsEnabled(): boolean {
    return this.effectsEnabled
  }
}

// Global instance
let feedbackSystem: VisualAudioFeedbackSystem | null = null

export function getFeedbackSystem(): VisualAudioFeedbackSystem {
  if (!feedbackSystem) {
    feedbackSystem = new VisualAudioFeedbackSystem()
  }
  return feedbackSystem
}

export function initFeedbackSystem(): VisualAudioFeedbackSystem {
  feedbackSystem = new VisualAudioFeedbackSystem()
  return feedbackSystem
}
