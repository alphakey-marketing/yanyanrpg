import Phaser from 'phaser'
import Enemy from '../../entities/Enemy'
import { applyDamageToPlayer } from '../combat/combatSystem'

export function updateAggro(
  enemy: Enemy,
  player: Phaser.Physics.Arcade.Sprite,
  delta: number
): void {
  if (!enemy.isAlive()) return

  const dist = Phaser.Math.Distance.Between(
    enemy.sprite.x,
    enemy.sprite.y,
    player.x,
    player.y
  )

  const { data } = enemy

  if (dist < data.aggroRange) {
    enemy.aiState = 'aggro'
  } else if (enemy.aiState === 'aggro') {
    enemy.aiState = 'patrol'
  }

  if (enemy.aiState === 'aggro') {
    // Move toward player
    const angle = Math.atan2(player.y - enemy.sprite.y, player.x - enemy.sprite.x)
    enemy.sprite.setVelocity(
      Math.cos(angle) * data.speed,
      Math.sin(angle) * data.speed
    )

    // Attack if close
    if (dist < 40) {
      enemy.attackTimer = (enemy.attackTimer ?? 0) + delta
      const atkInterval = data.type === 'boss' ? 1000 : 1500
      if (enemy.attackTimer >= atkInterval) {
        enemy.attackTimer = 0
        applyDamageToPlayer(data.attack)
        enemy.sprite.setTint(0xff4444)
        // Clear tint after brief flash
        setTimeout(() => enemy.sprite?.clearTint(), 150)
      }
    }
  }
}
