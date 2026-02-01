import type { Economy, PlayerInventory, Transaction } from '../types/level'
import { storageManager } from './storage'

/**
 * EconomyManager - Manages currency and player inventory
 * T028: Economy System
 */
export class EconomyManager {
  private static instance: EconomyManager
  private inventory: PlayerInventory
  private economy: Economy
  private transactions: Transaction[]

  private constructor() {
    this.inventory = this.getDefaultInventory()
    this.economy = this.getDefaultEconomy()
    this.transactions = []
  }

  public static getInstance(): EconomyManager {
    if (!EconomyManager.instance) {
      EconomyManager.instance = new EconomyManager()
    }
    return EconomyManager.instance
  }

  private getDefaultInventory(): PlayerInventory {
    return {
      ownedItems: [],
      currency: 0,
      lastUpdated: new Date(),
    }
  }

  private getDefaultEconomy(): Economy {
    return {
      conversionRate: 1, // 1:1 score to currency
      priceMultiplier: 1.0,
      upgradeCostBase: 100,
      dailyBonusAvailable: true,
    }
  }

  public initialize(): void {
    this.loadInventory()
  }

  /**
   * Convert score to currency and add to balance
   */
  public convertScoreToCurrency(score: number): number {
    const currencyEarned = Math.floor(score * this.economy.conversionRate)
    this.addCurrency(currencyEarned)
    return currencyEarned
  }

  /**
   * Add currency to balance
   */
  public addCurrency(amount: number): void {
    if (amount <= 0) return
    this.inventory.currency += amount
    this.recordTransaction('earn', amount)
    this.saveInventory()
  }

  /**
   * Spend currency (returns true if successful)
   */
  public spendCurrency(amount: number): boolean {
    if (amount <= 0) return false
    if (this.inventory.currency < amount) return false

    this.inventory.currency -= amount
    this.recordTransaction('purchase', amount)
    this.saveInventory()
    return true
  }

  /**
   * Get current currency balance
   */
  public getCurrencyBalance(): number {
    return this.inventory.currency
  }

  /**
   * Check if player can afford an item
   */
  public canAfford(price: number): boolean {
    return this.inventory.currency >= price
  }

  /**
   * Add item to inventory
   */
  public addItem(itemId: string): void {
    const existingItem = this.inventory.ownedItems.find(
      (item) => item.itemId === itemId,
    )

    if (existingItem) {
      // Item already owned - could be an upgrade or consumable
      existingItem.upgradeLevel = Math.max(1, existingItem.upgradeLevel)
    } else {
      // New item
      this.inventory.ownedItems.push({
        itemId,
        purchaseDate: new Date(),
        upgradeLevel: 1,
      })
    }

    this.saveInventory()
  }

  /**
   * Check if player owns an item
   */
  public hasItem(itemId: string): boolean {
    return this.inventory.ownedItems.some((item) => item.itemId === itemId)
  }

  /**
   * Get item upgrade level
   */
  public getItemUpgradeLevel(itemId: string): number {
    const item = this.inventory.ownedItems.find((i) => i.itemId === itemId)
    return item?.upgradeLevel || 0
  }

  /**
   * Upgrade an item
   */
  public upgradeItem(itemId: string, newLevel: number): void {
    const item = this.inventory.ownedItems.find((i) => i.itemId === itemId)
    if (item) {
      item.upgradeLevel = newLevel
      this.saveInventory()
    }
  }

  /**
   * Get all owned items
   */
  public getOwnedItems(): string[] {
    return this.inventory.ownedItems.map((item) => item.itemId)
  }

  /**
   * Get player inventory
   */
  public getInventory(): PlayerInventory {
    return { ...this.inventory }
  }

  /**
   * Record a transaction
   */
  private recordTransaction(
    type: 'purchase' | 'earn' | 'refund',
    amount: number,
    itemId?: string,
  ): void {
    const transaction: Transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      amount,
      itemId,
      timestamp: new Date(),
      balance: this.inventory.currency,
    }

    this.transactions.push(transaction)

    // Keep only last 100 transactions
    if (this.transactions.length > 100) {
      this.transactions = this.transactions.slice(-100)
    }
  }

  /**
   * Get transaction history
   */
  public getTransactions(): Transaction[] {
    return [...this.transactions]
  }

  /**
   * Save inventory to storage
   */
  private saveInventory(): void {
    this.inventory.lastUpdated = new Date()
    storageManager.savePlayerInventory(this.inventory)
  }

  /**
   * Load inventory from storage
   */
  private loadInventory(): void {
    const saved = storageManager.loadPlayerInventory()
    if (saved) {
      this.inventory = saved
    }
  }

  /**
   * Reset inventory (for testing)
   */
  public resetInventory(): void {
    this.inventory = this.getDefaultInventory()
    this.transactions = []
    storageManager.savePlayerInventory(this.inventory)
  }

  /**
   * Get economy settings
   */
  public getEconomy(): Economy {
    return { ...this.economy }
  }
}

// Global instance
export const economyManager = EconomyManager.getInstance()

// Convenience functions
export function getEconomyManager(): EconomyManager {
  return EconomyManager.getInstance()
}

export function initializeEconomy(): void {
  economyManager.initialize()
}
