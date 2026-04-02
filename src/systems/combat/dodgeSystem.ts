import Phaser from 'phaser'
import { DODGE_DURATION, DODGE_INVINCIBLE_DURATION, STAMINA_COST_DODGE } from '../../core/constants'
import { consumeStamina } from './staminaSystem'

interface DodgeState {
  dodging: boolean
  invincible: boolean
  dodgeTimer: number
}

const state: DodgeState = {
  dodging: false,
  invincible: false,
  dodgeTimer: 0,
}

export function attemptDodge(
  player: Phaser.Physics.Arcade.Sprite,
  dirX: number,
  dirY: number,
  scene: Phaser.Scene
): boolean {
  if (state.dodging) return false
  if (!consumeStamina(STAMINA_COST_DODGE)) return false

  state.dodging = true
  state.invincible = true
  state.dodgeTimer = 0

  const angle = Math.atan2(dirY, dirX)
  const speed = 300
  player.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed)
  player.setTint(0xaaffaa)

  scene.time.delayedCall(DODGE_INVINCIBLE_DURATION, () => {
    state.invincible = false
    player.clearTint()
  })

  scene.time.delayedCall(DODGE_DURATION, () => {
    state.dodging = false
    player.setVelocity(0, 0)
  })

  return true
}

export function isDodging(): boolean {
  return state.dodging
}

export function isInvincible(): boolean {
  return state.invincible
}
