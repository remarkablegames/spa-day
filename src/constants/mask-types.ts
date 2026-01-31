/**
 * Mask type definitions for the spa day game
 * Defines different categories of face masks with their properties
 */

export enum MaskType {
  HYDRATING = 'hydrating',
  SOOTHING = 'soothing',
  PURIFYING = 'purifying',
  ANTI_AGING = 'anti_aging',
  BRIGHTENING = 'brightening',
  NOURISHING = 'nourishing',
}

export interface MaskTypeConfig {
  id: MaskType
  name: string
  description: string
  baseColor: string
  unlockRequirement: {
    type: 'score' | 'completions' | 'satisfaction'
    value: number
  }
  effectiveness: number
  duration: number
  icon: string
}

export const MASK_TYPE_CONFIGS: Record<MaskType, MaskTypeConfig> = {
  [MaskType.HYDRATING]: {
    id: MaskType.HYDRATING,
    name: 'Hydrating',
    description: 'Deep moisture treatment for dry skin',
    baseColor: '#4FC3F7', // Light blue
    unlockRequirement: {
      type: 'score',
      value: 100,
    },
    effectiveness: 85,
    duration: 30,
    icon: '💧',
  },
  [MaskType.SOOTHING]: {
    id: MaskType.SOOTHING,
    name: 'Soothing',
    description: 'Calms irritated and sensitive skin',
    baseColor: '#81C784', // Light green
    unlockRequirement: {
      type: 'completions',
      value: 3,
    },
    effectiveness: 80,
    duration: 25,
    icon: '🌿',
  },
  [MaskType.PURIFYING]: {
    id: MaskType.PURIFYING,
    name: 'Purifying',
    description: 'Deep cleanses and detoxifies pores',
    baseColor: '#FFB74D', // Light orange
    unlockRequirement: {
      type: 'score',
      value: 300,
    },
    effectiveness: 90,
    duration: 35,
    icon: '✨',
  },
  [MaskType.ANTI_AGING]: {
    id: MaskType.ANTI_AGING,
    name: 'Anti-Aging',
    description: 'Reduces fine lines and wrinkles',
    baseColor: '#CE93D8', // Light purple
    unlockRequirement: {
      type: 'completions',
      value: 10,
    },
    effectiveness: 95,
    duration: 40,
    icon: '🌟',
  },
  [MaskType.BRIGHTENING]: {
    id: MaskType.BRIGHTENING,
    name: 'Brightening',
    description: 'Evens skin tone and adds radiance',
    baseColor: '#FFD54F', // Light yellow
    unlockRequirement: {
      type: 'satisfaction',
      value: 85,
    },
    effectiveness: 88,
    duration: 30,
    icon: '☀️',
  },
  [MaskType.NOURISHING]: {
    id: MaskType.NOURISHING,
    name: 'Nourishing',
    description: 'Rich nutrients for healthy skin',
    baseColor: '#F06292', // Light pink
    unlockRequirement: {
      type: 'score',
      value: 500,
    },
    effectiveness: 92,
    duration: 45,
    icon: '🌸',
  },
}

export interface MaskVariant {
  id: string
  name: string
  type: MaskType
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  effectiveness: number
  duration: number
  specialEffect?: string
}

export const MASK_VARIANTS: MaskVariant[] = [
  // Hydrating variants
  {
    id: 'hydrating_basic',
    name: 'Basic Hydrating',
    type: MaskType.HYDRATING,
    rarity: 'common',
    effectiveness: 85,
    duration: 30,
  },
  {
    id: 'hydrating_aloe',
    name: 'Aloe Hydrating',
    type: MaskType.HYDRATING,
    rarity: 'rare',
    effectiveness: 90,
    duration: 35,
    specialEffect: 'Extra soothing',
  },
  {
    id: 'hydrating_cucumber',
    name: 'Cucumber Hydrating',
    type: MaskType.HYDRATING,
    rarity: 'epic',
    effectiveness: 95,
    duration: 40,
    specialEffect: 'Cooling effect',
  },

  // Soothing variants
  {
    id: 'soothing_chamomile',
    name: 'Chamomile Soothing',
    type: MaskType.SOOTHING,
    rarity: 'common',
    effectiveness: 80,
    duration: 25,
  },
  {
    id: 'soothing_lavender',
    name: 'Lavender Soothing',
    type: MaskType.SOOTHING,
    rarity: 'rare',
    effectiveness: 85,
    duration: 30,
    specialEffect: 'Relaxing aroma',
  },

  // Purifying variants
  {
    id: 'purifying_charcoal',
    name: 'Charcoal Purifying',
    type: MaskType.PURIFYING,
    rarity: 'common',
    effectiveness: 90,
    duration: 35,
  },
  {
    id: 'purifying_clay',
    name: 'Clay Purifying',
    type: MaskType.PURIFYING,
    rarity: 'epic',
    effectiveness: 95,
    duration: 40,
    specialEffect: 'Deep cleanse',
  },
]

export function getMaskTypeConfig(type: MaskType): MaskTypeConfig {
  return MASK_TYPE_CONFIGS[type]
}

export function getMaskVariantsByType(maskType: MaskType): MaskVariant[] {
  return MASK_VARIANTS.filter((variant) => variant.type === maskType)
}

export function getUnlockedMaskTypes(
  playerScore: number,
  completions: number,
  satisfaction: number,
): MaskType[] {
  return Object.values(MaskType).filter((maskType) => {
    const config = getMaskTypeConfig(maskType)
    const { type: reqType, value: reqValue } = config.unlockRequirement

    switch (reqType) {
      case 'score':
        return playerScore >= reqValue
      case 'completions':
        return completions >= reqValue
      case 'satisfaction':
        return satisfaction >= reqValue
      default:
        return false
    }
  })
}

export function getRarityColor(rarity: MaskVariant['rarity']): string {
  switch (rarity) {
    case 'common':
      return '#9E9E9E' // Gray
    case 'rare':
      return '#4FC3F7' // Blue
    case 'epic':
      return '#CE93D8' // Purple
    case 'legendary':
      return '#FFD700' // Gold
    default:
      return '#9E9E9E'
  }
}
