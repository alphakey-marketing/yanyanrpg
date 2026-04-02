import Phaser from 'phaser'
import type { NPCData } from '../types/game'

export default class NPC {
  sprite: Phaser.Physics.Arcade.Sprite
  data: NPCData
  private label: Phaser.GameObjects.Text
  private interactPrompt: Phaser.GameObjects.Text | null = null

  constructor(scene: Phaser.Scene, data: NPCData) {
    this.data = data
    this.sprite = scene.physics.add.sprite(data.x, data.y, 'npc')
    this.sprite.setImmovable(true)
    this.sprite.setDepth(10)

    this.label = scene.add
      .text(data.x, data.y - 20, data.name, {
        fontSize: '11px',
        color: '#2ecc71',
        fontFamily: 'serif',
        stroke: '#000',
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(11)
  }

  showInteractPrompt(scene: Phaser.Scene, onInteract?: () => void): void {
    if (this.interactPrompt) return
    this.interactPrompt = scene.add
      .text(this.sprite.x, this.sprite.y - 40, '[ 互動 ]', {
        fontSize: '12px',
        color: '#ffe066',
        fontFamily: 'serif',
        backgroundColor: '#00000099',
        padding: { x: 6, y: 3 },
        stroke: '#000',
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(20)

    if (onInteract) {
      this.interactPrompt
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', onInteract)
    }
  }

  hideInteractPrompt(): void {
    this.interactPrompt?.destroy()
    this.interactPrompt = null
  }

  update(): void {
    this.label.setPosition(this.sprite.x, this.sprite.y - 20)
    this.interactPrompt?.setPosition(this.sprite.x, this.sprite.y - 40)
  }

  destroy(): void {
    this.sprite.destroy()
    this.label.destroy()
    this.interactPrompt?.destroy()
  }
}
