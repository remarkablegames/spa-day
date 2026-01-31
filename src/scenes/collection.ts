import {
  AnchorComp,
  ColorComp,
  GameObj,
  PosComp,
  TextComp,
  ZComp,
} from 'kaplay'

import { Scene } from '../constants'
import { GAME_CONFIG } from '../constants/game-config'
import type { MaskTypeConfig } from '../constants/mask-types'
import {
  getMaskTypeConfig,
  getUnlockedMaskTypes,
  MaskType,
} from '../constants/mask-types'
import { getGameStateManager } from '../gameobjects/base'

// Helper function to convert hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 102, g: 102, b: 102 }
}

interface CollectionState {
  selectedMaskType: MaskType | null
  scrollOffset: number
  unlockedTypes: MaskType[]
}

export function createCollectionScene() {
  const collectionState: CollectionState = {
    selectedMaskType: null,
    scrollOffset: 0,
    unlockedTypes: [],
  }

  // Get player progress
  const stateManager = getGameStateManager()
  const playerScore = stateManager.getScore()
  const completions = stateManager.getCompletions()
  const satisfaction = stateManager.getAverageSatisfaction()

  // Determine unlocked mask types
  collectionState.unlockedTypes = getUnlockedMaskTypes(
    playerScore,
    completions,
    satisfaction,
  )

  // Background
  add([
    rect(width(), height()),
    pos(0, 0),
    color(GAME_CONFIG.COLORS.BACKGROUND),
    z(0),
  ])

  // Title
  add([
    text('Mask Collection', { size: 32, font: 'bold' }),
    pos(center().x, 50),
    anchor('center'),
    color(GAME_CONFIG.COLORS.UI_TEXT),
    z(10),
  ])

  // Back button
  const backButton = add([
    rect(100, 40),
    pos(50, 50),
    color(GAME_CONFIG.COLORS.UI_BUTTON),
    z(10),
    area(),
  ])

  add([
    text('Back', { size: 16 }),
    pos(backButton.pos.x + 50, backButton.pos.y + 20),
    anchor('center'),
    color(255, 255, 255),
    z(11),
  ])

  backButton.onClick(() => {
    go(Scene.SpaGame)
  })

  // Stats display
  const statsY = 120
  add([
    text(`Score: ${playerScore}`, { size: 18 }),
    pos(50, statsY),
    color(GAME_CONFIG.COLORS.UI_TEXT),
    z(10),
  ])

  add([
    text(`Completions: ${completions}`, { size: 18 }),
    pos(50, statsY + 30),
    color(GAME_CONFIG.COLORS.UI_TEXT),
    z(10),
  ])

  add([
    text(`Avg Satisfaction: ${satisfaction}%`, { size: 18 }),
    pos(50, statsY + 60),
    color(GAME_CONFIG.COLORS.UI_TEXT),
    z(10),
  ])

  // Mask type grid
  const gridStartY = 220
  const gridCols = 3
  const gridSpacing = 150
  const cardWidth = 120
  const cardHeight = 140

  Object.values(MaskType).forEach((maskType, index) => {
    const config = getMaskTypeConfig(maskType)
    const isUnlocked = collectionState.unlockedTypes.includes(maskType)

    const col = index % gridCols
    const row = Math.floor(index / gridCols)
    const x = 100 + col * gridSpacing
    const y = gridStartY + row * (cardHeight + 20)

    // Card background
    const baseColorRgb = hexToRgb(config.baseColor)
    const cardColorRgb = isUnlocked
      ? [baseColorRgb.r, baseColorRgb.g, baseColorRgb.b]
      : [102, 102, 102]

    const card = add([
      rect(cardWidth, cardHeight),
      pos(x, y),
      color(cardColorRgb[0], cardColorRgb[1], cardColorRgb[2]),
      z(5),
      area(),
    ])

    // Lock overlay if not unlocked
    if (!isUnlocked) {
      add([
        rect(cardWidth, cardHeight),
        pos(x, y),
        color(0, 0, 0),
        opacity(0.7),
        z(6),
      ])

      add([
        text('🔒', { size: 32 }),
        pos(x + cardWidth / 2, y + cardHeight / 2 - 10),
        anchor('center'),
        z(7),
      ])

      // Unlock requirement
      const reqText = getUnlockRequirementText(config.unlockRequirement)
      add([
        text(reqText, { size: 12 }),
        pos(x + cardWidth / 2, y + cardHeight / 2 + 20),
        anchor('center'),
        color(255, 255, 255),
        z(7),
      ])
    }

    // Icon
    add([
      text(config.icon, { size: 32 }),
      pos(x + cardWidth / 2, y + 30),
      anchor('center'),
      z(7),
    ])

    // Name
    add([
      text(config.name, { size: 14, font: 'bold' }),
      pos(x + cardWidth / 2, y + 60),
      anchor('center'),
      color(255, 255, 255),
      z(7),
    ])

    // Stats
    add([
      text(`⭐ ${config.effectiveness}%`, { size: 10 }),
      pos(x + 10, y + 85),
      color(255, 255, 255),
      z(7),
    ])

    add([
      text(`⏱️ ${config.duration}s`, { size: 10 }),
      pos(x + 10, y + 100),
      color(255, 255, 255),
      z(7),
    ])

    // Description
    add([
      text(config.description, { size: 9, width: cardWidth - 20 }),
      pos(x + 10, y + 115),
      color(255, 255, 255),
      z(7),
    ])

    // Selection indicator
    if (isUnlocked) {
      card.onClick(() => {
        collectionState.selectedMaskType = maskType
        updateSelectionIndicator()
      })

      card.onHover(() => {
        card.color = new Color(255, 255, 255)
      })

      card.onHoverEnd(() => {
        card.color = new Color(
          cardColorRgb[0],
          cardColorRgb[1],
          cardColorRgb[2],
        )
      })
    }
  })

  // Selection indicator
  let selectionIndicator: GameObj<PosComp | ColorComp | ZComp> | null = null

  function updateSelectionIndicator() {
    if (selectionIndicator) {
      destroy(selectionIndicator)
      selectionIndicator = null
    }

    if (collectionState.selectedMaskType) {
      const index = Object.values(MaskType).indexOf(
        collectionState.selectedMaskType,
      )
      const col = index % gridCols
      const row = Math.floor(index / gridCols)
      const x = 100 + col * gridSpacing - 5
      const y = gridStartY + row * (cardHeight + 20) - 5

      selectionIndicator = add([
        rect(cardWidth, cardHeight),
        pos(x, y),
        color(0, 0, 0),
        opacity(0.7),
        z(6),
      ])
    }
  }

  // Details panel
  const detailsPanel = add([
    rect(width() - 250, 200),
    pos(width() - 130, center().y),
    color(GAME_CONFIG.COLORS.UI_PANEL),
    z(5),
  ])

  let detailsTitle: GameObj<
    TextComp | PosComp | ColorComp | ZComp | AnchorComp
  > | null = null
  let detailsText: GameObj<
    TextComp | PosComp | ColorComp | ZComp | AnchorComp
  > | null = null

  function updateDetailsPanel() {
    if (detailsTitle) {
      destroy(detailsTitle)
      detailsTitle = null
    }
    if (detailsText) {
      destroy(detailsText)
      detailsText = null
    }

    if (collectionState.selectedMaskType) {
      const config = getMaskTypeConfig(collectionState.selectedMaskType)

      detailsTitle = add([
        text(config.name, { size: 20, font: 'bold' }),
        pos(width() - 130, detailsPanel.pos.y + 30),
        anchor('center'),
        color(GAME_CONFIG.COLORS.UI_TEXT),
        z(6),
      ])

      detailsText = add([
        text(
          `${config.description}\n\nEffectiveness: ${config.effectiveness}%\nDuration: ${config.duration}s\n\n${config.icon} ${config.name} masks provide ${config.name.toLowerCase()} benefits for the skin.`,
          { size: 14, width: width() - 280 },
        ),
        pos(width() - 130, detailsPanel.pos.y + 70),
        anchor('center'),
        color(GAME_CONFIG.COLORS.UI_TEXT),
        z(6),
      ])
    } else {
      detailsTitle = add([
        text('Select a mask type', { size: 18, font: 'bold' }),
        pos(width() - 130, detailsPanel.pos.y + 100),
        anchor('center'),
        color(GAME_CONFIG.COLORS.UI_TEXT),
        z(6),
      ])
    }
  }

  // Initial panel setup
  updateDetailsPanel()

  // Update details when selection changes
  onUpdate(() => {
    if (collectionState.selectedMaskType) {
      updateDetailsPanel()
    }
  })

  function getUnlockRequirementText(
    requirement: MaskTypeConfig['unlockRequirement'],
  ): string {
    switch (requirement.type) {
      case 'score':
        return `Score: ${requirement.value}`
      case 'completions':
        return `${requirement.value} completions`
      case 'satisfaction':
        return `${requirement.value}% satisfaction`
      default:
        return 'Locked'
    }
  }
}

// Scene registration
scene('collection', createCollectionScene)
