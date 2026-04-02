import Phaser from 'phaser'
import type { EnemyData } from '../types/game'
import type { EnemyAIState } from '../types/combat'

const HP_BAR_WIDTH = 30
const HP_BAR_HEIGHT = 4
const HP_BAR_OFFSET_Y = -28

export default class Enemy {
  sprite: Phaser.Physics.Arcade.Sprite
  data: EnemyData
  hp: number
  aiState: EnemyAIState = 'patrol'
  patrolOriginX: number
  patrolOriginY: number
  patrolDir = 1
  attackTimer = 0
  private hpBarBg: Phaser.GameObjects.Rectangle | null = null
  private hpBarFill: Phaser.GameObjects.Rectangle | null = null

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

    // HP bar
    this.hpBarBg = scene.add
      .rectangle(spawnX, spawnY + HP_BAR_OFFSET_Y, HP_BAR_WIDTH, HP_BAR_HEIGHT, 0x333333)
      .setDepth(12)
      .setOrigin(0.5)
    this.hpBarFill = scene.add
      .rectangle(spawnX - HP_BAR_WIDTH / 2, spawnY + HP_BAR_OFFSET_Y, HP_BAR_WIDTH, HP_BAR_HEIGHT, 0x44ff44)
      .setDepth(13)
      .setOrigin(0, 0.5)
    this.sprite.setData('maxHp', data.hp)
    this.sprite.setData('enemyId', data.id)
  }

  isAlive(): boolean {
    return this.hp > 0 && this.sprite.active
  }

  update(): void {
    if (!this.sprite.active) return
    const x = this.sprite.x
    const y = this.sprite.y + HP_BAR_OFFSET_Y
    this.hpBarBg?.setPosition(x, y)
    this.hpBarFill?.setPosition(x - HP_BAR_WIDTH / 2, y)
  }

  private refreshHpBar(): void {
    const pct = Math.max(0, this.hp / this.data.hp)
    this.hpBarFill?.setSize(HP_BAR_WIDTH * pct, HP_BAR_HEIGHT)
    const color = pct > 0.5 ? 0x44ff44 : pct > 0.25 ? 0xffaa00 : 0xff4444
    this.hpBarFill?.setFillStyle(color)
  }

  takeDamage(damage: number): boolean {
    this.hp -= damage
    this.refreshHpBar()
    if (this.hp <= 0) {
      this.die()
      return true
    }
    // White flash for cleaner visual feedback
    this.sprite.setTint(0xffffff)
    this.sprite.scene.time.delayedCall(120, () => {
      if (this.sprite?.active) this.sprite.clearTint()
    })
    return false
  }

  die(): void {
    this.aiState = 'dead'
    this.hpBarBg?.destroy()
    this.hpBarFill?.destroy()
    this.hpBarBg = null
    this.hpBarFill = null
    this.sprite.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this.sprite.destroy()
      },
    })
    // ENEMY_KILLED is emitted by combatSystem.onEnemyKilled to avoid double-firing
  }

  destroy(): void {
    if (this.sprite.active) this.sprite.destroy()
    this.hpBarBg?.destroy()
    this.hpBarFill?.destroy()
    this.hpBarBg = null
    this.hpBarFill = null
  }
}
