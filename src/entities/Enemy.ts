import Phaser from 'phaser'
import type { EnemyData } from '../types/game'
import type { EnemyAIState } from '../types/combat'
import { emit, Events } from '../core/eventBus'

export default class Enemy {
  sprite: Phaser.Physics.Arcade.Sprite
  data: EnemyData
  hp: number
  aiState: EnemyAIState = 'patrol'
  patrolOriginX: number
  patrolOriginY: number
  patrolDir = 1
  attackTimer = 0

  constructor(scene: Phaser.Scene, data: EnemyData & { x?: number; y?: number }) {
    this.data = data
    this.hp = data.hp

    const textureKey =
      data.type === 'boss'
        ? 'enemy_boss'
        : data.type === 'elite'
        ? 'enemy_elite'
        : 'enemy_normal'

    const spawnX = (data as EnemyData & { x?: number }).x ?? 400
    const spawnY = (data as EnemyData & { y?: number }).y ?? 200

    this.sprite = scene.physics.add.sprite(spawnX, spawnY, textureKey)
    this.sprite.setCollideWorldBounds(true)
    this.sprite.setDepth(10)

    this.patrolOriginX = this.sprite.x
    this.patrolOriginY = this.sprite.y

    // Name label
    scene.add
      .text(spawnX, spawnY - 20, data.name, {
        fontSize: '10px',
        color: '#ff8888',
        fontFamily: 'serif',
        stroke: '#000',
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(11)

    this.sprite.setData('maxHp', data.hp)
    this.sprite.setData('enemyId', data.id)
  }

  isAlive(): boolean {
    return this.hp > 0 && this.sprite.active
  }

  takeDamage(damage: number): boolean {
    this.hp -= damage
    if (this.hp <= 0) {
      this.die()
      return true
    }
    this.sprite.setTint(0xff0000)
    this.sprite.scene.time.delayedCall(150, () => {
      if (this.sprite?.active) this.sprite.clearTint()
    })
    return false
  }

  die(): void {
    this.aiState = 'dead'
    this.sprite.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this.sprite.destroy()
      },
    })
    emit(Events.ENEMY_KILLED, this.data.id)
  }

  destroy(): void {
    if (this.sprite.active) this.sprite.destroy()
  }
}
