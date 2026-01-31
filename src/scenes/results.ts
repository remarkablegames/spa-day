import { GAME_CONFIG } from '../constants/game-config'
import { Scene } from '../constants/scene'
import { Character } from '../gameobjects/character'
import { TreatmentSession } from '../gameobjects/treatment'
import { CustomerLoyaltySystem } from '../systems/customer-loyalty'
import { getProgressionSystem } from '../systems/progression'
import { ScoreBreakdown } from '../systems/scoring'

export interface ResultsData {
  session: TreatmentSession
  character: Character
  scoreBreakdown: ScoreBreakdown
  treatmentDuration: number
}

export function createResultsScene() {
  scene(Scene.Results, (data: ResultsData) => {
    const { session, character, scoreBreakdown, treatmentDuration } = data

    // Background
    add([rect(width(), height()), color(100, 150, 200), opacity(0.9), z(0)])

    // Title
    add([
      text('Treatment Complete!', {
        size: 48,
        font: 'monospace',
      }),
      pos(width() / 2, 80),
      anchor('center'),
      color(255, 255, 255),
      z(10),
    ])

    // Character display
    add([
      circle(80),
      pos(width() / 2, 200),
      color(255, 220, 177),
      anchor('center'),
      z(5),
    ])

    // Satisfaction indicator
    const satisfactionLevel = character.getSatisfaction()
    const satisfactionColor =
      satisfactionLevel >= 80 ? GREEN : satisfactionLevel >= 60 ? YELLOW : RED

    add([
      text(`Satisfaction: ${satisfactionLevel}%`, {
        size: 24,
        font: 'monospace',
      }),
      pos(width() / 2, 300),
      anchor('center'),
      color(satisfactionColor),
      z(10),
    ])

    // Score display
    add([
      text('Score Breakdown:', {
        size: 32,
        font: 'monospace',
      }),
      pos(width() / 2, 360),
      anchor('center'),
      color(255, 255, 255),
      z(10),
    ])

    // Score breakdown items
    const scoreItems = [
      { label: 'Base Score', value: scoreBreakdown.baseScore },
      {
        label: 'Effectiveness Bonus',
        value: scoreBreakdown.effectivenessBonus,
      },
      { label: 'Timing Bonus', value: scoreBreakdown.timingBonus },
      { label: 'Completion Bonus', value: scoreBreakdown.completionBonus },
      { label: 'Satisfaction Bonus', value: scoreBreakdown.satisfactionBonus },
      {
        label: 'Combo Multiplier',
        value: `x${scoreBreakdown.comboMultiplier.toFixed(1)}`,
      },
    ]

    let yPos = 410
    scoreItems.forEach((item) => {
      add([
        text(`${item.label}: ${item.value}`, {
          size: 20,
          font: 'monospace',
        }),
        pos(width() / 2, yPos),
        anchor('center'),
        color(204, 204, 204),
        z(10),
      ])
      yPos += 30
    })

    // Total score with animation
    const totalScoreText = add([
      text(`Total Score: ${scoreBreakdown.totalScore}`, {
        size: 36,
        font: 'monospace',
      }),
      pos(width() / 2, yPos + 20),
      anchor('center'),
      color(255, 215, 0),
      z(10),
    ])

    // Animate total score
    tween(
      0,
      scoreBreakdown.totalScore,
      1.5,
      (value: number) => {
        totalScoreText.text = `Total Score: ${Math.floor(value)}`
      },
      easings.easeOutBounce,
    )

    // Performance rating
    const rating = getPerformanceRating(
      scoreBreakdown.totalScore,
      satisfactionLevel,
    )
    add([
      text(`Rating: ${rating}`, {
        size: 28,
        font: 'monospace',
      }),
      pos(width() / 2, yPos + 70),
      anchor('center'),
      color(getRatingColor(rating)),
      z(10),
    ])

    // Treatment duration
    add([
      text(`Duration: ${Math.floor(treatmentDuration / 1000)}s`, {
        size: 20,
        font: 'monospace',
      }),
      pos(width() / 2, yPos + 110),
      anchor('center'),
      color(204, 204, 204),
      z(10),
    ])

    // Masks applied
    add([
      text(`Masks Applied: ${session.appliedMasks.length}`, {
        size: 20,
        font: 'monospace',
      }),
      pos(width() / 2, yPos + 140),
      anchor('center'),
      color(204, 204, 204),
      z(10),
    ])

    // Continue button
    const continueButton = add([
      rect(200, 60),
      pos(width() / 2, height() - 100),
      color(100, 200, 100),
      anchor('center'),
      area(),
      z(10),
    ])

    add([
      text('Continue', {
        size: 24,
        font: 'monospace',
      }),
      pos(width() / 2, height() - 100),
      anchor('center'),
      color(255, 255, 255),
      z(11),
    ])

    // Button interactions
    continueButton.onHover(() => {
      tween(
        continueButton.color,
        rgb(102, 187, 102),
        0.2,
        (color) => (continueButton.color = color),
      )
    })

    continueButton.onHoverEnd(() => {
      tween(
        continueButton.color,
        rgb(100, 200, 100),
        0.2,
        (color) => (continueButton.color = color),
      )
    })

    continueButton.onClick(() => {
      // play('confirm', { volume: 0.5 }) // Sound not loaded yet
      go(Scene.SpaGame) // Return to spa game scene
    })

    // Particle effects for high scores
    if (scoreBreakdown.totalScore >= GAME_CONFIG.PERFECT_TIMING_BONUS * 5) {
      createCelebrationParticles()
    }

    // Customer return logic with loyalty system
    const loyaltySystem = new CustomerLoyaltySystem()
    const customerRecord = loyaltySystem.recordCustomerVisit(
      character.id,
      character.name,
      satisfactionLevel,
      scoreBreakdown.totalScore,
      character.preferredMaskTypes,
    )

    // Update progression system
    const progressionSystem = getProgressionSystem()
    progressionSystem.updateProgress(
      scoreBreakdown.totalScore,
      satisfactionLevel,
    )

    if (customerRecord.willReturn) {
      const loyaltyText = getLoyaltyLevelText(customerRecord.loyaltyLevel)
      const returnText = add([
        text(`${customerRecord.name} will return! ${loyaltyText}`, {
          size: 24,
          font: 'monospace',
        }),
        pos(width() / 2, height() - 160),
        anchor('center'),
        color(255, 215, 0),
        opacity(0),
        z(10),
      ])

      // Fade in animation
      tween(
        0,
        1,
        1,
        (opacity) => (returnText.opacity = opacity),
        easings.easeInOutSine,
      )

      // Show loyalty bonus if applicable
      const loyaltyBonus = loyaltySystem.getLoyaltyBonus()
      if (loyaltyBonus > 0) {
        const bonusText = add([
          text(`Loyalty Bonus: +${loyaltyBonus}`, {
            size: 20,
            font: 'monospace',
          }),
          pos(width() / 2, height() - 130),
          anchor('center'),
          color(0, 255, 0),
          opacity(0),
          z(10),
        ])

        tween(
          0,
          1,
          1,
          (opacity) => (bonusText.opacity = opacity),
          easings.easeInOutSine,
        )
      }
    } else {
      const returnText = add([
        text(`${customerRecord.name} needs better service`, {
          size: 20,
          font: 'monospace',
        }),
        pos(width() / 2, height() - 160),
        anchor('center'),
        color(255, 100, 100),
        opacity(0),
        z(10),
      ])

      // Fade in animation
      tween(
        0,
        1,
        1,
        (opacity) => (returnText.opacity = opacity),
        easings.easeInOutSine,
      )
    }
  })
}

function getLoyaltyLevelText(
  level: 'new' | 'regular' | 'loyal' | 'vip',
): string {
  switch (level) {
    case 'new':
      return ''
    case 'regular':
      return '👍'
    case 'loyal':
      return '⭐'
    case 'vip':
      return '👑'
    default:
      return ''
  }
}

function getPerformanceRating(score: number, satisfaction: number): string {
  const combinedScore = score + satisfaction * 10

  if (combinedScore >= 1000) return 'Excellent! ⭐⭐⭐'
  if (combinedScore >= 750) return 'Great! ⭐⭐'
  if (combinedScore >= 500) return 'Good! ⭐'
  if (combinedScore >= 250) return 'Fair'
  return 'Needs Improvement'
}

function getRatingColor(rating: string) {
  if (rating.includes('Excellent')) return rgb(255, 215, 0)
  if (rating.includes('Great')) return rgb(192, 192, 192)
  if (rating.includes('Good')) return rgb(205, 127, 50)
  return rgb(255, 107, 107)
}

function createCelebrationParticles(): void {
  for (let i = 0; i < 50; i++) {
    add([
      circle(rand(4, 8)),
      pos(rand(0, width()), rand(0, height())),
      color(rand(200, 255), rand(150, 255), rand(0, 100)),
      move(rand(0, 360), rand(50, 150)),
      opacity(1),
      lifespan(2, { fade: 0.5 }),
      z(20),
    ])
  }
}
