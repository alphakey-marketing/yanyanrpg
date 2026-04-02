import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, SCENE_VILLAGE } from '../core/constants'

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
  }

  preload(): void {
    const barBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 400, 20, 0x333333)
    barBg.setOrigin(0.5)

    const bar = this.add.rectangle(GAME_WIDTH / 2 - 200, GAME_HEIGHT / 2, 0, 16, 0xe8c97e)
    bar.setOrigin(0, 0.5)

    const label = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, '載入中…', {
      fontSize: '20px',
      color: '#e8c97e',
      fontFamily: 'serif',
    }).setOrigin(0.5)

    this.load.on('progress', (value: number) => {
      bar.width = 400 * value
    })

    this.load.on('complete', () => {
      label.setText('完成')
    })

    this.generatePlaceholderTextures()
  }

  private generatePlaceholderTextures(): void {
    const textureConfigs = [
      { key: 'player', color: 0x4a90d9, size: 24 },
      { key: 'enemy_normal', color: 0xe74c3c, size: 20 },
      { key: 'enemy_elite', color: 0xe67e22, size: 24 },
      { key: 'enemy_boss', color: 0x8e44ad, size: 36 },
      { key: 'npc', color: 0x2ecc71, size: 20 },
      { key: 'chest', color: 0xf1c40f, size: 24 },
      { key: 'mechanism', color: 0x95a5a6, size: 20 },
    ]

    textureConfigs.forEach(({ key, color, size }) => {
      if (!this.textures.exists(key)) {
        const g = this.make.graphics({ x: 0, y: 0 })
        g.fillStyle(color, 1)
        g.fillRect(0, 0, size, size)
        g.generateTexture(key, size, size)
        g.destroy()
      }
    })

    const tileColors: Record<string, number> = {
      tile_village_ground: 0x8b7355,
      tile_village_path: 0xc4a882,
      tile_bamboo_ground: 0x3d6b3f,
      tile_bamboo_grass: 0x5a8c3c,
      tile_cave_floor: 0x4a4040,
      tile_cave_wall: 0x2d2828,
    }

    Object.entries(tileColors).forEach(([key, color]) => {
      if (!this.textures.exists(key)) {
        const g = this.make.graphics({ x: 0, y: 0 })
        g.fillStyle(color, 1)
        g.fillRect(0, 0, 32, 32)
        g.lineStyle(1, 0x000000, 0.2)
        g.strokeRect(0, 0, 32, 32)
        g.generateTexture(key, 32, 32)
        g.destroy()
      }
    })

    const buttonColors: Record<string, number> = {
      btn_light: 0x4a90d9,
      btn_heavy: 0xe74c3c,
      btn_dodge: 0x27ae60,
      btn_mystic: 0x9b59b6,
      btn_switch: 0xe67e22,
    }

    Object.entries(buttonColors).forEach(([key, color]) => {
      if (!this.textures.exists(key)) {
        const g = this.make.graphics({ x: 0, y: 0 })
        g.fillStyle(color, 0.85)
        g.fillCircle(32, 32, 28)
        g.lineStyle(2, 0xffffff, 0.5)
        g.strokeCircle(32, 32, 28)
        g.generateTexture(key, 64, 64)
        g.destroy()
      }
    })

    if (!this.textures.exists('joystick_base')) {
      const g = this.make.graphics({ x: 0, y: 0 })
      g.fillStyle(0xffffff, 0.15)
      g.fillCircle(55, 55, 50)
      g.lineStyle(2, 0xffffff, 0.3)
      g.strokeCircle(55, 55, 50)
      g.generateTexture('joystick_base', 110, 110)
      g.destroy()
    }

    if (!this.textures.exists('joystick_thumb')) {
      const g = this.make.graphics({ x: 0, y: 0 })
      g.fillStyle(0xffffff, 0.5)
      g.fillCircle(25, 25, 22)
      g.generateTexture('joystick_thumb', 50, 50)
      g.destroy()
    }
  }

  create(): void {
    // FIX Bug #4: only start VillageScene here.
    // UIScene is launched by BaseScene.create() via scene.launch() already.
    // Starting it here too caused all HUD event listeners to register twice.
    this.scene.start(SCENE_VILLAGE)
  }
}
