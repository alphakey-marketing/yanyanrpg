import weaponsData from '../../data/weapons.json'
import type { WeaponData } from '../../types/game'
import { useGameStore } from '../../ui/store/useGameStore'
import { emit, Events } from '../../core/eventBus'

const weapons: WeaponData[] = weaponsData as WeaponData[]

export function getWeaponById(id: string): WeaponData | undefined {
  return weapons.find(w => w.id === id)
}

export function switchWeapon(): void {
  const store = useGameStore.getState()
  const next: 0 | 1 = store.player.activeWeaponSlot === 0 ? 1 : 0
  store.setActiveWeaponSlot(next)
  emit(Events.SWITCH_WEAPON, next)
  const name = getWeaponById(store.player.equippedWeapons[next])?.name ?? ''
  emit(Events.SHOW_TOAST, `切換至：${name}`)
}

export function getActiveWeaponData(): WeaponData | null {
  const store = useGameStore.getState()
  const id = store.player.equippedWeapons[store.player.activeWeaponSlot]
  return weapons.find(w => w.id === id) ?? null
}
