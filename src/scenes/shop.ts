import { GAME_CONFIG } from '../constants/game-config'
import { Scene } from '../constants/scene'
import { getLevelManager } from '../systems/levelmanager'
import { getShopManager } from '../systems/shop'
import type { ShopItem } from '../types/level'

/**
 * Shop Scene
 * T031: Shop interface between levels
 */
export function createShopScene() {
  scene(Scene.Shop, (params: { fromLevel?: boolean } = {}) => {
    const shopManager = getShopManager()
    const levelManager = getLevelManager()
    const currency = shopManager.getCurrency()
    const playerInventory = shopManager.getPlayerInventory()

    // Background
    add([
      rect(width(), height()),
      pos(0, 0),
      color(GAME_CONFIG.COLORS.BACKGROUND),
      z(-100),
    ])

    // Title
    add([
      text('Spa Shop', { size: 48, font: 'bold' }),
      pos(center().x, 40),
      anchor('center'),
      color(GAME_CONFIG.COLORS.UI_TEXT),
      z(100),
    ])

    // Currency display
    add([
      text(`Coins: ${currency}`, { size: 32, font: 'bold' }),
      pos(width() - 20, 20),
      anchor('topright'),
      color(255, 215, 0), // Gold
      z(100),
    ])

    // Get available items
    const unlockedLevels = levelManager.getLevelProgress().unlockedLevels
    const ownedItems = playerInventory.ownedItems.map(
      (item: { itemId: string }) => item.itemId,
    )
    const availableItems = shopManager.getAvailableItems(
      unlockedLevels,
      ownedItems,
      [],
    )

    // Create item buttons
    createItemList(availableItems, shopManager)

    // Continue button
    const continueButton = add([
      rect(200, 50),
      pos(center().x, height() - 80),
      anchor('center'),
      color(Color.fromHex(GAME_CONFIG.COLORS.UI_BUTTON)),
      area(),
      z(100),
    ])

    add([
      text(params.fromLevel ? 'Next Level' : 'Continue', { size: 24 }),
      pos(center().x, height() - 80),
      anchor('center'),
      color(Color.WHITE),
      z(101),
    ])

    continueButton.onClick(() => {
      if (params.fromLevel) {
        // Go to next level
        const nextLevel = levelManager.getNextLevel()
        if (nextLevel) {
          go(Scene.SpaGame, { levelId: nextLevel.id })
        } else {
          go(Scene.LevelSelect)
        }
      } else {
        go(Scene.LevelSelect)
      }
    })

    // Back button
    const backButton = add([
      rect(120, 40),
      pos(20, height() - 60),
      color(Color.fromHex(GAME_CONFIG.COLORS.UI_BUTTON)),
      area(),
      z(100),
    ])

    add([
      text('Back', { size: 20 }),
      pos(80, height() - 40),
      anchor('center'),
      color(Color.WHITE),
      z(101),
    ])

    backButton.onClick(() => {
      go(Scene.LevelSelect)
    })
  })
}

function createItemList(
  items: ShopItem[],
  shopManager: ReturnType<typeof getShopManager>,
) {
  const startY = 120
  const itemHeight = 70
  const spacing = 10

  items.slice(0, 6).forEach((item, index) => {
    const y = startY + index * (itemHeight + spacing)
    const x = center().x

    // Item background
    add([
      rect(500, itemHeight),
      pos(x, y),
      anchor('center'),
      color(Color.fromHex(GAME_CONFIG.COLORS.UI_PANEL)),
      z(10),
    ])

    // Item name
    add([
      text(item.name, { size: 20, font: 'bold' }),
      pos(x - 230, y - 20),
      color(GAME_CONFIG.COLORS.UI_TEXT),
      z(11),
    ])

    // Item description
    add([
      text(item.description, { size: 14, width: 300 }),
      pos(x - 230, y + 5),
      color(Color.fromHex('#666666')),
      z(11),
    ])

    // Price
    const canAfford = shopManager.getCurrency() >= item.basePrice
    add([
      text(`${item.basePrice} coins`, { size: 18 }),
      pos(x + 180, y - 10),
      anchor('center'),
      color(canAfford ? rgb(0, 150, 0) : rgb(200, 0, 0)),
      z(11),
    ])

    // Buy button
    const buyButton = add([
      rect(100, 35),
      pos(x + 180, y + 15),
      anchor('center'),
      color(
        canAfford
          ? Color.fromHex(GAME_CONFIG.COLORS.UI_BUTTON)
          : rgb(128, 128, 128),
      ),
      area(),
      z(11),
    ])

    add([
      text('Buy', { size: 16 }),
      pos(x + 180, y + 15),
      anchor('center'),
      color(Color.WHITE),
      z(12),
    ])

    if (canAfford) {
      buyButton.onClick(() => {
        const result = shopManager.purchaseItem(item.id)
        if (result.success) {
          // Refresh scene to show updated state
          go(Scene.Shop)
        }
      })
    }
  })
}

/**
 * Navigate to shop scene
 */
export function goToShop(fromLevel: boolean = false): void {
  go(Scene.Shop, { fromLevel })
}
