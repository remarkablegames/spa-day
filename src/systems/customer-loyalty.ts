import { GAME_CONFIG } from '../constants/game-config'

export interface CustomerRecord {
  id: string
  name: string
  visitCount: number
  totalSatisfaction: number
  averageSatisfaction: number
  lastVisitScore: number
  lastVisitSatisfaction: number
  willReturn: boolean
  nextVisitPreference: string[]
  loyaltyLevel: 'new' | 'regular' | 'loyal' | 'vip'
}

export interface CustomerLoyaltyData {
  customers: CustomerRecord[]
  totalVisits: number
  averageSatisfaction: number
  returningCustomers: number
  loyaltyBonus: number
}

export class CustomerLoyaltySystem {
  private loyaltyData: CustomerLoyaltyData
  private storageKey = GAME_CONFIG.STORAGE_KEYS.CUSTOMER_LOYALTY

  constructor() {
    this.loyaltyData = this.loadLoyaltyData()
  }

  private loadLoyaltyData(): CustomerLoyaltyData {
    try {
      const stored = getData(this.storageKey)
      if (stored && typeof stored === 'string') {
        const parsed = JSON.parse(stored)
        if (parsed && typeof parsed === 'object' && 'customers' in parsed) {
          return parsed as CustomerLoyaltyData
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load loyalty data:', error)
    }

    // Default data
    return {
      customers: [],
      totalVisits: 0,
      averageSatisfaction: 0,
      returningCustomers: 0,
      loyaltyBonus: 0,
    }
  }

  private saveLoyaltyData(): void {
    try {
      setData(this.storageKey, this.loyaltyData)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to save loyalty data:', error)
    }
  }

  public recordCustomerVisit(
    customerId: string,
    customerName: string,
    satisfaction: number,
    score: number,
    preferredMaskTypes: string[],
  ): CustomerRecord {
    let customer = this.loyaltyData.customers.find((c) => c.id === customerId)

    if (!customer) {
      // New customer
      customer = {
        id: customerId,
        name: customerName,
        visitCount: 1,
        totalSatisfaction: satisfaction,
        averageSatisfaction: satisfaction,
        lastVisitScore: score,
        lastVisitSatisfaction: satisfaction,
        willReturn: this.calculateReturnProbability(satisfaction, score, 1),
        nextVisitPreference: [...preferredMaskTypes],
        loyaltyLevel: this.calculateLoyaltyLevel(1, satisfaction),
      }
      this.loyaltyData.customers.push(customer)
    } else {
      // Returning customer
      customer.visitCount++
      customer.totalSatisfaction += satisfaction
      customer.averageSatisfaction =
        customer.totalSatisfaction / customer.visitCount
      customer.lastVisitScore = score
      customer.lastVisitSatisfaction = satisfaction
      customer.willReturn = this.calculateReturnProbability(
        satisfaction,
        score,
        customer.visitCount,
      )
      customer.nextVisitPreference = this.updatePreferences(
        customer.nextVisitPreference,
        preferredMaskTypes,
        satisfaction,
      )
      customer.loyaltyLevel = this.calculateLoyaltyLevel(
        customer.visitCount,
        customer.averageSatisfaction,
      )
    }

    // Update overall stats
    this.loyaltyData.totalVisits++
    this.updateOverallStats()
    this.saveLoyaltyData()

    return customer
  }

  private calculateReturnProbability(
    satisfaction: number,
    score: number,
    visitCount: number,
  ): boolean {
    // Base probability from satisfaction
    let probability = 0

    if (satisfaction >= 90) {
      probability = 0.9 // Very likely to return
    } else if (satisfaction >= 80) {
      probability = 0.7 // Likely to return
    } else if (satisfaction >= 70) {
      probability = 0.5 // Might return
    } else if (satisfaction >= 60) {
      probability = 0.3 // Unlikely to return
    } else {
      probability = 0.1 // Very unlikely to return
    }

    // Boost based on score
    if (score >= GAME_CONFIG.PERFECT_TIMING_BONUS * 5) {
      probability += 0.1
    } else if (score >= GAME_CONFIG.PERFECT_TIMING_BONUS * 3) {
      probability += 0.05
    }

    // Boost for returning customers
    if (visitCount > 1) {
      probability += 0.1 * Math.min(visitCount - 1, 3) // Max boost of 0.3
    }

    return Math.random() < probability
  }

  private calculateLoyaltyLevel(
    visitCount: number,
    averageSatisfaction: number,
  ): 'new' | 'regular' | 'loyal' | 'vip' {
    if (visitCount === 1) return 'new'
    if (visitCount >= 10 && averageSatisfaction >= 85) return 'vip'
    if (visitCount >= 5 && averageSatisfaction >= 75) return 'loyal'
    if (visitCount >= 3 && averageSatisfaction >= 65) return 'regular'
    return 'new'
  }

  private updatePreferences(
    currentPreferences: string[],
    newPreferences: string[],
    satisfaction: number,
  ): string[] {
    // If satisfaction was high, strengthen preference for used masks
    if (satisfaction >= 80) {
      const updatedPreferences = [...currentPreferences]
      newPreferences.forEach((mask) => {
        if (!updatedPreferences.includes(mask)) {
          updatedPreferences.push(mask)
        }
      })
      return updatedPreferences.slice(-5) // Keep only last 5 preferences
    }
    return currentPreferences
  }

  private updateOverallStats(): void {
    if (this.loyaltyData.customers.length === 0) return

    const totalSatisfaction = this.loyaltyData.customers.reduce(
      (sum, customer) => sum + customer.averageSatisfaction,
      0,
    )
    this.loyaltyData.averageSatisfaction =
      totalSatisfaction / this.loyaltyData.customers.length

    this.loyaltyData.returningCustomers = this.loyaltyData.customers.filter(
      (customer) => customer.visitCount > 1,
    ).length

    // Calculate loyalty bonus
    const vipCount = this.loyaltyData.customers.filter(
      (customer) => customer.loyaltyLevel === 'vip',
    ).length
    const loyalCount = this.loyaltyData.customers.filter(
      (customer) => customer.loyaltyLevel === 'loyal',
    ).length

    this.loyaltyData.loyaltyBonus = vipCount * 50 + loyalCount * 20
  }

  public getLoyaltyData(): CustomerLoyaltyData {
    return { ...this.loyaltyData }
  }

  public getCustomerRecord(customerId: string): CustomerRecord | null {
    return this.loyaltyData.customers.find((c) => c.id === customerId) || null
  }

  public getReturningCustomers(): CustomerRecord[] {
    return this.loyaltyData.customers.filter((customer) => customer.willReturn)
  }

  public getLoyalCustomers(): CustomerRecord[] {
    return this.loyaltyData.customers.filter(
      (customer) =>
        customer.loyaltyLevel === 'loyal' || customer.loyaltyLevel === 'vip',
    )
  }

  public getLoyaltyBonus(): number {
    return this.loyaltyData.loyaltyBonus
  }

  public getCustomerCount(): number {
    return this.loyaltyData.customers.length
  }

  public getReturningCustomerRate(): number {
    if (this.loyaltyData.customers.length === 0) return 0
    return (
      this.loyaltyData.returningCustomers / this.loyaltyData.customers.length
    )
  }

  public resetLoyaltyData(): void {
    this.loyaltyData = {
      customers: [],
      totalVisits: 0,
      averageSatisfaction: 0,
      returningCustomers: 0,
      loyaltyBonus: 0,
    }
    this.saveLoyaltyData()
  }
}

// Global instance
let loyaltySystem: CustomerLoyaltySystem | null = null

export function getLoyaltySystem(): CustomerLoyaltySystem {
  if (!loyaltySystem) {
    loyaltySystem = new CustomerLoyaltySystem()
  }
  return loyaltySystem
}

export function initLoyaltySystem(): CustomerLoyaltySystem {
  loyaltySystem = new CustomerLoyaltySystem()
  return loyaltySystem
}
