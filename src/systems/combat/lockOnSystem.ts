import Phaser from 'phaser'
import { AUTO_LOCK_RANGE } from '../../core/constants'
import Enemy from '../../entities/Enemy'

export function findNearestEnemy(
  player: Phaser.Physics.Arcade.Sprite,
  enemies: Enemy[]
): Enemy | null {
  let nearest: Enemy | null = null
  let nearestDist = AUTO_LOCK_RANGE

  enemies.forEach(enemy => {
    if (!enemy.isAlive()) return
    const dist = Phaser.Math.Distance.Between(
      player.x, player.y,
      enemy.sprite.x, enemy.sprite.y
    )
    if (dist < nearestDist) {
      nearestDist = dist
      nearest = enemy
    }
  })

  return nearest
}

export function updateLockIndicator(
  _scene: Phaser.Scene,
  target: Enemy | null,
  indicator: Phaser.GameObjects.Arc
): void {
  if (target && target.isAlive()) {
    indicator.setPosition(target.sprite.x, target.sprite.y - 20).setVisible(true)
  } else {
    indicator.setVisible(false)
  }
}
