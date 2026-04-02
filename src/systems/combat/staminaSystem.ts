import { STAMINA_REGEN_RATE, ENERGY_REGEN_RATE } from '../../core/constants'
import { useGameStore } from '../../ui/store/useGameStore'

export function updateStamina(deltaMs: number): void {
  const store = useGameStore.getState()
  const { stamina, maxStamina } = store.player
  if (stamina < maxStamina) {
    const next = Math.min(stamina + (STAMINA_REGEN_RATE * deltaMs) / 1000, maxStamina)
    store.setPlayerStamina(next)
  }
}

export function updateInternalEnergy(deltaMs: number): void {
  const store = useGameStore.getState()
  const { internalEnergy, maxInternalEnergy } = store.player
  if (internalEnergy < maxInternalEnergy) {
    const next = Math.min(internalEnergy + (ENERGY_REGEN_RATE * deltaMs) / 1000, maxInternalEnergy)
    store.setPlayerEnergy(next)
  }
}

export function consumeStamina(amount: number): boolean {
  const store = useGameStore.getState()
  if (store.player.stamina < amount) return false
  store.setPlayerStamina(store.player.stamina - amount)
  return true
}

export function consumeEnergy(amount: number): boolean {
  const store = useGameStore.getState()
  if (store.player.internalEnergy < amount) return false
  store.setPlayerEnergy(store.player.internalEnergy - amount)
  return true
}
