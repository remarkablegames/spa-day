import {
  checkRequirements,
  createShopInventory,
  getShopItem,
  getShopUpgrade,
  SHOP_ITEMS,
  SHOP_UPGRADES,
} from '../constants/shop-inventory'
import type {
  PlayerInventory,
  PurchaseResult,
  ShopInventory,
  ShopItem,
  ShopUpgrade,
  ValidationResult,
} from '../types/level'
import { EconomyManager } from './economy'

/**
 * ShopManager - Manages shop inventory and purchases
 * T030: Shop System
 */
export class ShopManager {
  private static instance: ShopManager
  private shopInventory: ShopInventory
  private economyManager: EconomyManager

  private constructor() {
    this.shopInventory = createShopInventory()
    this.economyManager = EconomyManager.getInstance()
  }

  public static getInstance(): ShopManager {
    if (!ShopManager.instance) {
      ShopManager.instance = new ShopManager()
    }
    return ShopManager.instance
  }

  public initialize(): void {
    this.economyManager.initialize()
  }

  /**
   * Get full shop inventory
   */
  public getShopInventory(): ShopInventory {
    return this.shopInventory
  }

  /**
   * Get available items (requirements met)
   */
  public getAvailableItems(
    unlockedLevels: string[],
    ownedItems: string[],
    purchasedUpgrades: string[],
  ): ShopItem[] {
    return this.shopInventory.items.filter((item) => {
      // Check if already purchased
      if (item.isPurchased && ownedItems.includes(item.id)) {
        return false
      }

      // Check requirements
      return checkRequirements(
        item.requirements,
        unlockedLevels,
        ownedItems,
        purchasedUpgrades,
      )
    })
  }

  /**
   * Get available upgrades for an owned item
   */
  public getAvailableUpgrades(
    itemId: string,
    ownedItems: string[],
    purchasedUpgrades: string[],
  ): ShopUpgrade[] {
    // Check if item is owned
    if (!ownedItems.includes(itemId)) {
      return []
    }

    const itemUpgrades = this.shopInventory.upgrades.filter(
      (upgrade) => upgrade.targetItemId === itemId,
    )

    return itemUpgrades.filter((upgrade) => {
      // Check if already purchased
      if (purchasedUpgrades.includes(upgrade.id)) {
        return false
      }

      // Check requirements
      return checkRequirements(
        upgrade.requirements,
        [],
        ownedItems,
        purchasedUpgrades,
      )
    })
  }

  /**
   * Validate a purchase
   */
  public validatePurchase(
    itemId: string,
    isUpgrade: boolean = false,
  ): ValidationResult {
    const item = isUpgrade ? getShopUpgrade(itemId) : getShopItem(itemId)

    if (!item) {
      return {
        isValid: false,
        error: 'Item not found',
      }
    }

    // Check if already owned (for items)
    if (!isUpgrade && this.economyManager.hasItem(itemId)) {
      return {
        isValid: false,
        error: 'Item already owned',
      }
    }

    // Check if upgrade already purchased
    if (isUpgrade) {
      this.economyManager.getInventory()
      // Would need to track upgrade purchases separately
      // For now, assume we can check via some stored state
    }

    // Check funds
    const price = isUpgrade
      ? (item as ShopUpgrade).price
      : (item as ShopItem).basePrice

    if (!this.economyManager.canAfford(price)) {
      return {
        isValid: false,
        error: 'Insufficient funds',
        missingRequirements: [
          `Need ${price - this.economyManager.getCurrencyBalance()} more coins`,
        ],
      }
    }

    return { isValid: true }
  }

  /**
   * Purchase an item
   */
  public purchaseItem(itemId: string): PurchaseResult {
    // Validate
    const validation = this.validatePurchase(itemId)
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
      }
    }

    const item = getShopItem(itemId)
    if (!item) {
      return {
        success: false,
        error: 'Item not found',
      }
    }

    // Spend currency
    const success = this.economyManager.spendCurrency(item.basePrice)
    if (!success) {
      return {
        success: false,
        error: 'Transaction failed',
      }
    }

    // Add to inventory
    this.economyManager.addItem(itemId)

    return {
      success: true,
      transaction: {
        id: `txn_${Date.now()}`,
        type: 'purchase',
        amount: item.basePrice,
        itemId,
        timestamp: new Date(),
        balance: this.economyManager.getCurrencyBalance(),
      },
      updatedInventory: this.economyManager.getInventory(),
    }
  }

  /**
   * Purchase an upgrade
   */
  public purchaseUpgrade(upgradeId: string): PurchaseResult {
    const upgrade = getShopUpgrade(upgradeId)
    if (!upgrade) {
      return {
        success: false,
        error: 'Upgrade not found',
      }
    }

    // Check if can afford
    if (!this.economyManager.canAfford(upgrade.price)) {
      return {
        success: false,
        error: 'Insufficient funds',
      }
    }

    // Spend currency
    const success = this.economyManager.spendCurrency(upgrade.price)
    if (!success) {
      return {
        success: false,
        error: 'Transaction failed',
      }
    }

    // Apply upgrade
    this.economyManager.upgradeItem(upgrade.targetItemId, upgrade.level)

    return {
      success: true,
      transaction: {
        id: `txn_${Date.now()}`,
        type: 'purchase',
        amount: upgrade.price,
        itemId: upgradeId,
        timestamp: new Date(),
        balance: this.economyManager.getCurrencyBalance(),
      },
      updatedInventory: this.economyManager.getInventory(),
    }
  }

  /**
   * Get item details
   */
  public getItemDetails(itemId: string): ShopItem | null {
    return getShopItem(itemId) || null
  }

  /**
   * Get upgrade details
   */
  public getUpgradeDetails(upgradeId: string): ShopUpgrade | null {
    return getShopUpgrade(upgradeId) || null
  }

  /**
   * Get current currency balance
   */
  public getCurrency(): number {
    return this.economyManager.getCurrencyBalance()
  }

  /**
   * Get player inventory
   */
  public getPlayerInventory(): PlayerInventory {
    return this.economyManager.getInventory()
  }

  /**
   * Check if player owns an item
   */
  public hasItem(itemId: string): boolean {
    return this.economyManager.hasItem(itemId)
  }

  /**
   * Get total shop value (for stats)
   */
  public getTotalShopValue(): number {
    const itemsValue = SHOP_ITEMS.reduce((sum, item) => sum + item.basePrice, 0)
    const upgradesValue = SHOP_UPGRADES.reduce(
      (sum, upgrade) => sum + upgrade.price,
      0,
    )
    return itemsValue + upgradesValue
  }
}

// Global instance
export const shopManager = ShopManager.getInstance()

// Convenience functions
export function getShopManager(): ShopManager {
  return ShopManager.getInstance()
}

export function initializeShop(): void {
  shopManager.initialize()
}
