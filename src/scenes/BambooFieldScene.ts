import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../core/constants'
import BaseScene from './BaseScene'
import Enemy from '../entities/Enemy'
import enemiesData from '../data/enemies.json'
import type { EnemyData } from '../types/game'

const allEnemies: EnemyData[] = enemiesData as EnemyData[]

export default class BambooFieldScene extends BaseScene {
  constructor() {
    super('BambooFieldScene')
  }

  protected setupWorld(): void {
    this.drawBambooBackground()
  }

  private drawBambooBackground(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x2d5a3d, 0.5).setScrollFactor(0)

    for (let x = 0; x < GAME_WIDTH; x += TILE_SIZE) {
      for (let y = GAME_HEIGHT - 60; y < GAME_HEIGHT; y += TILE_SIZE) {
        this.add.image(x + 16, y + 16, 'tile_bamboo_ground').setDepth(0)
      }
    }

    for (let x = 0; x < GAME_WIDTH; x += TILE_SIZE) {
      if (Math.random() > 0.4) {
        this.add.image(x + 16, GAME_HEIGHT - 60, 'tile_bamboo_grass').setDepth(1)
      }
    }

    for (let i = 0; i < 20; i++) {
      const bx = 60 + i * 36
      const by = 80 + Math.random() * 80
      this.add.rectangle(bx, by, 8, 120 + Math.random() * 80, 0x3a7a3a, 0.8).setDepth(2)
      this.add.rectangle(bx, by - 60, 30, 6, 0x4a8a4a, 0.7).setDepth(2)
    }

    const platforms = [
      { x: 400, y: 160, w: 100, h: 16 },
      { x: 580, y: 120, w: 80, h: 16 },
      { x: 650, y: 180, w: 60, h: 16 },
    ]
    platforms.forEach(p => {
      this.add.rectangle(p.x, p.y, p.w, p.h, 0x5c4a3a, 1).setDepth(3)
    })

    this.add.text(GAME_WIDTH / 2, 20, '竹林道', {
      fontSize: '18px', color: '#7fff7f', fontFamily: 'serif',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(50)

    this.add.text(20, GAME_HEIGHT / 2, '← 清河村', {
      fontSize: '12px', color: '#ffffff', fontFamily: 'serif',
      backgroundColor: '#00000088', padding: { x: 4, y: 2 },
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(50)

    this.add.text(GAME_WIDTH - 20, GAME_HEIGHT / 2, '→ 破廟地宮', {
      fontSize: '12px', color: '#ffffff', fontFamily: 'serif',
      backgroundColor: '#00000088', padding: { x: 4, y: 2 },
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(50)
  }

  protected setupEnemies(): void {
    const sceneEnemyData = allEnemies.filter(e => e.sceneId === 'BambooFieldScene')
    sceneEnemyData.forEach((data, i) => {
      const spawnX = 200 + i * 120 + Math.random() * 60
      const spawnY = 220 + Math.random() * 60
      const enemyWithPos = { ...data, x: spawnX, y: spawnY }
      const enemy = new Enemy(this, enemyWithPos)
      this.enemies.push(enemy)
    })
  }

  protected getPlayerSpawnX(): number { return 80 }
  protected getPlayerSpawnY(): number { return 220 }
}
