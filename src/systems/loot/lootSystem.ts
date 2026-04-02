import { useGameStore } from '../../ui/store/useGameStore'
import { emit, Events } from '../../core/eventBus'

interface DropEntry {
  itemId: string
  chance: number
  minCount: number
  maxCount: number
}

interface DropTable {
  id: string
  entries: DropEntry[]
}

const dropTables: DropTable[] = [
  {
    id: 'drop_bandit',
    entries: [
      { itemId: 'item_herb', chance: 0.4, minCount: 1, maxCount: 2 },
      { itemId: 'item_coin', chance: 0.9, minCount: 5, maxCount: 15 },
    ],
  },
  {
    id: 'drop_shadow',
    entries: [
      { itemId: 'item_spirit_charm', chance: 0.3, minCount: 1, maxCount: 1 },
      { itemId: 'item_coin', chance: 0.8, minCount: 3, maxCount: 10 },
    ],
  },
  {
    id: 'drop_brute',
    entries: [
      { itemId: 'item_herb', chance: 0.2, minCount: 1, maxCount: 1 },
      { itemId: 'item_coin', chance: 0.9, minCount: 8, maxCount: 20 },
    ],
  },
  {
    id: 'drop_elite',
    entries: [
      { itemId: 'item_healing_potion', chance: 0.6, minCount: 1, maxCount: 2 },
      { itemId: 'item_coin', chance: 1.0, minCount: 20, maxCount: 40 },
    ],
  },
  {
    id: 'drop_boss',
    entries: [
      { itemId: 'item_healing_potion', chance: 1.0, minCount: 2, maxCount: 3 },
      { itemId: 'item_coin', chance: 1.0, minCount: 80, maxCount: 120 },
      { itemId: 'item_shrine_seal', chance: 1.0, minCount: 1, maxCount: 1 },
    ],
  },
]

export function rollLoot(dropTableId: string): void {
  const table = dropTables.find(t => t.id === dropTableId)
  if (!table) return

  table.entries.forEach(entry => {
    if (Math.random() <= entry.chance) {
      const count =
        entry.minCount +
        Math.floor(Math.random() * (entry.maxCount - entry.minCount + 1))
      useGameStore.getState().addInventoryItem(entry.itemId, count)
      emit(Events.ITEM_COLLECTED, entry.itemId, count)
      emit(Events.SHOW_TOAST, `獲得：${entry.itemId} ×${count}`)
    }
  })
}
