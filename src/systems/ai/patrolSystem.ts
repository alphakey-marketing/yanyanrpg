import Enemy from '../../entities/Enemy'

export function updatePatrol(enemy: Enemy, _delta: number): void {
  if (!enemy.isAlive()) return
  const sprite = enemy.sprite
  const { data } = enemy

  if (data.patrolRadius === 0) {
    sprite.setVelocity(0, 0)
    return
  }

  const dx = sprite.x - enemy.patrolOriginX
  if (Math.abs(dx) >= data.patrolRadius) {
    enemy.patrolDir *= -1
  }
  sprite.setVelocity(enemy.patrolDir * (data.speed * 0.4), 0)
}
