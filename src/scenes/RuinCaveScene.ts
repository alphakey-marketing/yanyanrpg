import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../core/constants'
import BaseScene from './BaseScene'
import Enemy from '../entities/Enemy'
import enemiesData from '../data/enemies.json'
import type { EnemyData } from '../types/game'

const allEnemies: EnemyData[] = enemiesData as EnemyData[]

export default class RuinCaveScene extends BaseScene {
  constructor() {
    super('RuinCaveScene')
  }

  protected setupWorld(): void {
    this.drawCaveBackground()
  }

  private drawCaveBackground(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a1010, 0.9)
      .setScrollFactor(0)

    for (let x = 0; x < GAME_WIDTH; x += TILE_SIZE) {
      for (let y = GAME_HEIGHT - 80; y < GAME_HEIGHT; y += TILE_SIZE) {
        this.add.image(x + 16, y + 16, 'tile_cave_floor').setDepth(0)
      }
    }

    for (let x = 0; x < GAME_WIDTH; x += TILE_SIZE) {
      for (let y = 0; y < 64; y += TILE_SIZE) {
        this.add.image(x + 16, y + 16, 'tile_cave_wall').setDepth(0)
      }
    }

    for (let i = 0; i < 15; i++) {
      const sx = 30 + i * 52 + Math.random() * 20
      const sh = 30 + Math.random() * 50
      this.add.triangle(sx, 64, 0, 0, sh / 2, sh, -sh / 2, sh, 0x2d2828, 1).setDepth(2)
    }

    for (let i = 0; i < 8; i++) {
      const sx = 80 + i * 90 + Math.random() * 30
      const sh = 20 + Math.random() * 30
      this.add.triangle(sx, GAME_HEIGHT - 80, 0, sh, sh / 3, 0, -sh / 3, 0, 0x3a3030, 1).setDepth(2)
    }

    this.add.rectangle(180, 280, 60, 60, 0x4a4040, 1).setDepth(3).setStrokeStyle(2, 0x888888)
    this.add.text(180, 280, '解謎\n①', {
      fontSize: '11px', color: '#aaaaaa', fontFamily: 'serif', align: 'center',
    }).setOrigin(0.5).setDepth(4)

    this.add.rectangle(480, 180, 60, 60, 0x4a4040, 1).setDepth(3).setStrokeStyle(2, 0x888888)
    this.add.text(480, 180, '解謎\n②', {
      fontSize: '11px', color: '#aaaaaa', fontFamily: 'serif', align: 'center',
    }).setOrigin(0.5).setDepth(4)

    this.add.rectangle(680, 250, 120, 100, 0x3a2020, 0.8).setDepth(3).setStrokeStyle(2, 0xff4444)
    this.add.text(680, 250, 'BOSS\n祠印守護者', {
      fontSize: '11px', color: '#ff8888', fontFamily: 'serif', align: 'center',
    }).setOrigin(0.5).setDepth(4)

    const torchPositions = [120, 300, 500, 670]
    torchPositions.forEach(x => {
      const torch = this.add.arc(x, 90, 8, 0, 360, false, 0xff6600, 0.9).setDepth(5)
      this.tweens.add({
        targets: torch,
        alpha: { from: 0.6, to: 1 },
        duration: 400 + Math.random() * 400,
        yoyo: true,
        repeat: -1,
      })
    })

    this.add.text(GAME_WIDTH / 2, 20, '破廟地宮', {
      fontSize: '18px', color: '#ff8888', fontFamily: 'serif',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(50)

    this.add.text(20, GAME_HEIGHT / 2, '← 竹林道', {
      fontSize: '12px', color: '#ffffff', fontFamily: 'serif',
      backgroundColor: '#00000088', padding: { x: 4, y: 2 },
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(50)
  }

  protected setupEnemies(): void {
    const sceneEnemyData = allEnemies.filter(e => e.sceneId === 'RuinCaveScene')
    const spawnPositions = [
      { x: 300, y: 300 },
      { x: 450, y: 250 },
      { x: 680, y: 250 },
    ]
    sceneEnemyData.forEach((data, i) => {
      const pos = spawnPositions[i] ?? { x: 200 + i * 100, y: 250 }
      const enemyWithPos = { ...data, x: pos.x, y: pos.y }
      const enemy = new Enemy(this, enemyWithPos)
      this.enemies.push(enemy)
    })
  }

  protected getPlayerSpawnX(): number { return 60 }
  protected getPlayerSpawnY(): number { return 280 }
}
