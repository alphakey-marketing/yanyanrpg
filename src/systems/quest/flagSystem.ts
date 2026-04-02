import { useGameStore } from '../../ui/store/useGameStore'

export function setFlag(flag: string): void {
  useGameStore.getState().addFlag(flag)
}

export function hasFlag(flag: string): boolean {
  return useGameStore.getState().player.flags.includes(flag)
}

export function clearFlag(flag: string): void {
  useGameStore.getState().removeFlag(flag)
}
