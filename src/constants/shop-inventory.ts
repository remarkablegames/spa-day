import type { ShopInventory, ShopItem, ShopUpgrade } from '../types/level'

/**
 * Shop inventory definitions
 * Defines all purchasable items and upgrades
 */

// Shop items (masks, tools, cosmetics)
export const SHOP_ITEMS: ShopItem[] = [
  // Level 1 - Basic masks (already unlocked by default)
  {
    id: 'mask_hydrating_basic',
    name: 'Hydrating Mask',
    type: 'mask',
    basePrice: 0, // Free - starting item
    description: 'Basic hydrating treatment for dry skin',
    requirements: [],
    isPurchased: true, // Already owned
  },
  {
    id: 'mask_soothing_basic',
    name: 'Soothing Mask',
    type: 'mask',
    basePrice: 50,
    description: 'Calming treatment for sensitive skin',
    requirements: [],
    isPurchased: false,
  },

  // Level 2 - Advanced masks
  {
    id: 'mask_clarifying',
    name: 'Clarifying Mask',
    type: 'mask',
    basePrice: 100,
    description: 'Deep cleansing for oily skin',
    requirements: ['level_2_unlocked'],
    isPurchased: false,
  },

  // Level 3 - Premium masks
  {
    id: 'mask_anti_aging',
    name: 'Anti-Aging Mask',
    type: 'mask',
    basePrice: 200,
    description: 'Premium treatment for mature skin',
    requirements: ['level_3_unlocked'],
    isPurchased: false,
  },
  {
    id: 'tool_steam_device',
    name: 'Steam Device',
    type: 'tool',
    basePrice: 150,
    description: 'Opens pores for better mask absorption',
    requirements: ['level_3_unlocked'],
    isPurchased: false,
  },

  // Level 4 - Expert masks
  {
    id: 'mask_detoxifying',
    name: 'Detoxifying Mask',
    type: 'mask',
    basePrice: 300,
    description: 'Removes impurities and toxins',
    requirements: ['level_4_unlocked'],
    isPurchased: false,
  },

  // Level 5 - Luxury items
  {
    id: 'mask_gold_luxury',
    name: 'Gold Luxury Mask',
    type: 'mask',
    basePrice: 500,
    description: 'Ultimate luxury treatment with gold particles',
    requirements: ['level_5_unlocked'],
    isPurchased: false,
  },
  {
    id: 'cosmetic_spa_theme',
    name: 'Luxury Spa Theme',
    type: 'cosmetic',
    basePrice: 1000,
    description: 'Exclusive spa visual theme',
    requirements: ['level_5_unlocked', 'all_masks_owned'],
    isPurchased: false,
  },
]

// Shop upgrades for masks
export const SHOP_UPGRADES: ShopUpgrade[] = [
  {
    id: 'upgrade_hydrating_1',
    targetItemId: 'mask_hydrating_basic',
    level: 1,
    price: 75,
    effects: [
      {
        type: 'satisfaction_boost',
        value: 5,
        description: '+5% satisfaction bonus',
      },
    ],
    requirements: ['mask_hydrating_basic_owned'],
  },
  {
    id: 'upgrade_hydrating_2',
    targetItemId: 'mask_hydrating_basic',
    level: 2,
    price: 150,
    effects: [
      {
        type: 'satisfaction_boost',
        value: 10,
        description: '+10% satisfaction bonus',
      },
      {
        type: 'score_multiplier',
        value: 1.1,
        description: '+10% score bonus',
      },
    ],
    requirements: ['upgrade_hydrating_1_purchased'],
  },
  {
    id: 'upgrade_soothing_1',
    targetItemId: 'mask_soothing_basic',
    level: 1,
    price: 100,
    effects: [
      {
        type: 'satisfaction_boost',
        value: 5,
        description: '+5% satisfaction bonus',
      },
    ],
    requirements: ['mask_soothing_basic_owned'],
  },
  {
    id: 'upgrade_premium_1',
    targetItemId: 'mask_anti_aging',
    level: 1,
    price: 300,
    effects: [
      {
        type: 'satisfaction_boost',
        value: 15,
        description: '+15% satisfaction bonus',
      },
      {
        type: 'score_multiplier',
        value: 1.2,
        description: '+20% score bonus',
      },
    ],
    requirements: ['mask_anti_aging_owned'],
  },
]

// Featured items (rotating daily/weekly)
export const FEATURED_ITEMS: string[] = [
  'mask_soothing_basic',
  'tool_steam_device',
]

// Complete shop inventory
export function createShopInventory(): ShopInventory {
  return {
    items: [...SHOP_ITEMS],
    upgrades: [...SHOP_UPGRADES],
    featuredItems: [...FEATURED_ITEMS],
  }
}

// Helper functions
export function getShopItem(itemId: string): ShopItem | undefined {
  return SHOP_ITEMS.find((item) => item.id === itemId)
}

export function getShopUpgrade(upgradeId: string): ShopUpgrade | undefined {
  return SHOP_UPGRADES.find((upgrade) => upgrade.id === upgradeId)
}

export function getUpgradesForItem(itemId: string): ShopUpgrade[] {
  return SHOP_UPGRADES.filter((upgrade) => upgrade.targetItemId === itemId)
}

// Check if requirements are met
export function checkRequirements(
  requirements: string[],
  unlockedLevels: string[],
  ownedItems: string[],
  purchasedUpgrades: string[],
): boolean {
  return requirements.every((req) => {
    // Level requirements
    if (req.startsWith('level_') && req.endsWith('_unlocked')) {
      const levelNum = req.replace('level_', '').replace('_unlocked', '')
      return unlockedLevels.includes(levelNum)
    }

    // Item ownership requirements
    if (req.endsWith('_owned')) {
      const itemId = req.replace('_owned', '')
      return ownedItems.includes(itemId)
    }

    // Upgrade requirements
    if (req.endsWith('_purchased')) {
      const upgradeId = req.replace('_purchased', '')
      return purchasedUpgrades.includes(upgradeId)
    }

    // Special requirements
    if (req === 'all_masks_owned') {
      const maskItems = SHOP_ITEMS.filter((item) => item.type === 'mask')
      return maskItems.every((mask) => ownedItems.includes(mask.id))
    }

    return false
  })
}
