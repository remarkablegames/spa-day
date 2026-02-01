import type {
  CustomerTemplate,
  Level,
  LevelConfig,
  UnlockCriteria,
} from '../types/level'

/**
 * Level configuration constants
 * Defines all levels with their difficulty, customers, and unlock criteria
 */

// Level configurations by level number
export const LEVEL_CONFIGS: Record<number, LevelConfig> = {
  1: {
    timeLimit: 15,
    satisfactionThreshold: 35,
    availableMaskTypes: ['hydrating', 'soothing'],
    scoreMultiplier: 1.0,
    difficultyMultiplier: 1.0,
    dirtSpotCount: 3,
  },
  2: {
    timeLimit: 15,
    satisfactionThreshold: 65,
    availableMaskTypes: ['hydrating', 'soothing', 'clarifying'],
    scoreMultiplier: 1.2,
    difficultyMultiplier: 1.1,
    dirtSpotCount: 5,
  },
  3: {
    timeLimit: 15,
    satisfactionThreshold: 70,
    availableMaskTypes: ['hydrating', 'soothing', 'clarifying', 'anti_aging'],
    scoreMultiplier: 1.4,
    difficultyMultiplier: 1.2,
    dirtSpotCount: 7,
  },
  4: {
    timeLimit: 15,
    satisfactionThreshold: 75,
    availableMaskTypes: [
      'hydrating',
      'soothing',
      'clarifying',
      'anti_aging',
      'detoxifying',
    ],
    scoreMultiplier: 1.6,
    difficultyMultiplier: 1.3,
    dirtSpotCount: 9,
  },
  5: {
    timeLimit: 15,
    satisfactionThreshold: 80,
    availableMaskTypes: [
      'hydrating',
      'soothing',
      'clarifying',
      'anti_aging',
      'detoxifying',
    ],
    scoreMultiplier: 1.8,
    difficultyMultiplier: 1.4,
    dirtSpotCount: 12,
  },
}

// Customer templates for each level
export const CUSTOMER_TEMPLATES: Record<number, CustomerTemplate> = {
  1: {
    id: 'beginner',
    name: 'New Client',
    preferredMaskTypes: ['hydrating'],
    satisfactionDecayRate: 0.5,
    personalityTraits: ['patient', 'forgiving'],
    appearanceConfig: {
      baseColor: '#FFE4E1',
      eyeStyle: 'simple',
      expressionType: 'neutral',
    },
  },
  2: {
    id: 'regular',
    name: 'Regular Customer',
    preferredMaskTypes: ['hydrating', 'soothing'],
    satisfactionDecayRate: 0.8,
    personalityTraits: ['knowledgeable', 'expectant'],
    appearanceConfig: {
      baseColor: '#F5DEB3',
      eyeStyle: 'detailed',
      expressionType: 'neutral',
    },
  },
  3: {
    id: 'demanding',
    name: 'VIP Client',
    preferredMaskTypes: ['clarifying', 'anti_aging'],
    satisfactionDecayRate: 1.2,
    personalityTraits: ['demanding', 'impatient', 'generous'],
    appearanceConfig: {
      baseColor: '#FFE4C4',
      eyeStyle: 'expressive',
      expressionType: 'picky',
    },
  },
  4: {
    id: 'expert',
    name: 'Skincare Expert',
    preferredMaskTypes: ['anti_aging', 'detoxifying'],
    satisfactionDecayRate: 1.5,
    personalityTraits: ['expert', 'critical', 'high_value'],
    appearanceConfig: {
      baseColor: '#FAEBD7',
      eyeStyle: 'analytical',
      expressionType: 'evaluating',
    },
  },
  5: {
    id: 'celebrity',
    name: 'Celebrity Client',
    preferredMaskTypes: ['detoxifying', 'anti_aging'],
    satisfactionDecayRate: 2.0,
    personalityTraits: ['celebrity', 'impatient', 'extremely_generous'],
    appearanceConfig: {
      baseColor: '#FFF8DC',
      eyeStyle: 'glamorous',
      expressionType: 'demanding',
    },
  },
}

// Unlock criteria for each level
export const UNLOCK_CRITERIA: Record<number, UnlockCriteria> = {
  1: {
    requiredScore: 0,
    requiredSatisfaction: 0,
    previousLevelRequired: '',
    optionalChallenges: [],
  },
  2: {
    requiredScore: 300,
    requiredSatisfaction: 60,
    previousLevelRequired: '1',
    optionalChallenges: [
      {
        id: 'perfect_satisfaction_1',
        name: 'Perfect Service',
        description: 'Achieve 100% satisfaction on Level 1',
        rewardType: 'currency',
        rewardValue: 100,
      },
    ],
  },
  3: {
    requiredScore: 400,
    requiredSatisfaction: 65,
    previousLevelRequired: '2',
    optionalChallenges: [
      {
        id: 'quick_completion_2',
        name: 'Speed Demon',
        description: 'Complete Level 2 in under 30 seconds',
        rewardType: 'currency',
        rewardValue: 150,
      },
    ],
  },
  4: {
    requiredScore: 500,
    requiredSatisfaction: 70,
    previousLevelRequired: '3',
    optionalChallenges: [
      {
        id: 'combo_master_3',
        name: 'Combo Master',
        description: 'Get 5 perfect combos on Level 3',
        rewardType: 'unlock',
        rewardValue: 'special_mask_1',
      },
    ],
  },
  5: {
    requiredScore: 600,
    requiredSatisfaction: 75,
    previousLevelRequired: '4',
    optionalChallenges: [
      {
        id: 'expert_status_4',
        name: 'Expert Status',
        description: 'Complete Level 4 with 90%+ satisfaction',
        rewardType: 'upgrade',
        rewardValue: 'premium_tools',
      },
    ],
  },
}

// Maximum levels available
export const MAX_LEVELS = 5

// Helper function to create a full Level object
export function createLevel(levelNumber: number): Level {
  const config = LEVEL_CONFIGS[levelNumber]
  const customerTemplate = CUSTOMER_TEMPLATES[levelNumber]
  const unlockCriteria = UNLOCK_CRITERIA[levelNumber]

  if (!config || !customerTemplate || !unlockCriteria) {
    throw new Error(`Invalid level number: ${levelNumber}`)
  }

  return {
    id: levelNumber.toString(),
    name: getLevelName(levelNumber),
    number: levelNumber,
    isUnlocked: levelNumber === 1, // Level 1 is always unlocked
    customerTemplate,
    config,
    unlockCriteria,
  }
}

// Get level name based on number
function getLevelName(levelNumber: number): string {
  const names: Record<number, string> = {
    1: 'First Steps',
    2: 'Regular Routine',
    3: 'VIP Treatment',
    4: 'Expert Care',
    5: 'Celebrity Spa Day',
  }
  return names[levelNumber] || `Level ${levelNumber}`
}

// Get all levels as an array
export function getAllLevels(): Level[] {
  return Array.from({ length: MAX_LEVELS }, (_, i) => createLevel(i + 1))
}

// Validate level completion
export function validateLevelCompletion(
  levelNumber: number,
  satisfaction: number,
): boolean {
  const config = LEVEL_CONFIGS[levelNumber]
  if (!config) return false

  // Level only fails if satisfaction requirement not met
  // Score and time don't affect passing
  return satisfaction >= config.satisfactionThreshold
}

// Check if player can unlock next level
export function canUnlockNextLevel(
  currentLevel: number,
  satisfaction: number,
): boolean {
  const nextLevel = currentLevel + 1
  if (nextLevel > MAX_LEVELS) return false

  const criteria = UNLOCK_CRITERIA[nextLevel]
  if (!criteria) return false

  // Only satisfaction matters for unlocking next level
  return satisfaction >= criteria.requiredSatisfaction
}
