import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../core/constants'
import BaseScene from './BaseScene'
import { initQuests } from '../systems/quest/questSystem'

export default class VillageScene extends BaseScene {
  constructor() {
    super('VillageScene')
  }

  protected setupWorld(): void {
    this.drawVillageBackground()
    initQuests()
  }

  private drawVillageBackground(): void {
    const sky = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x87ceeb, 0.3)
    sky.setScrollFactor(0)

    for (let x = 0; x < GAME_WIDTH; x += TILE_SIZE) {
      for (let y = GAME_HEIGHT - 80; y < GAME_HEIGHT; y += TILE_SIZE) {
        this.add.image(x + 16, y + 16, 'tile_village_ground').setDepth(0)
      }
    }

    for (let x = 0; x < GAME_WIDTH; x += TILE_SIZE) {
      this.add.image(x + 16, GAME_HEIGHT / 2, 'tile_village_path').setDepth(1)
    }

    const buildings = [
      { x: 80, y: 160, w: 80, h: 80, color: 0x8b4513, label: '村長府' },
      { x: 300, y: 140, w: 80, h: 80, color: 0x6b3a2a, label: '酒館' },
      { x: 520, y: 160, w: 80, h: 80, color: 0x5c4a3a, label: '藥鋪' },
      { x: 680, y: 160, w: 80, h: 80, color: 0x4a3a2a, label: '練武場' },
    ]

    buildings.forEach(b => {
      this.add.rectangle(b.x, b.y, b.w, b.h, b.color, 0.9).setDepth(2)
      this.add.text(b.x, b.y + b.h / 2 + 8, b.label, {
        fontSize: '11px',
        color: '#e8c97e',
        fontFamily: 'serif',
        stroke: '#000',
        strokeThickness: 2,
      }).setOrigin(0.5).setDepth(3)
    })

    this.add.text(GAME_WIDTH / 2, 20, '清河村', {
      fontSize: '18px',
      color: '#e8c97e',
      fontFamily: 'serif',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(50)

    this.add.text(GAME_WIDTH - 30, GAME_HEIGHT / 2, '→ 竹林道', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'serif',
      backgroundColor: '#00000088',
      padding: { x: 4, y: 2 },
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(50)
  }

  protected setupEnemies(): void {
    // Safe zone — no enemies
  }

  protected getPlayerSpawnX(): number { return 120 }
  protected getPlayerSpawnY(): number { return 200 }
}
