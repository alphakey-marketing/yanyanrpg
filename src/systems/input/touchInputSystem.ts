import Phaser from 'phaser'

type ButtonConfig = {
  key: string
  label: string
  texture: string
  x: number
  y: number
  onTap: () => void
}

export default class TouchInputSystem {
  private scene: Phaser.Scene
  private buttons: Phaser.GameObjects.Container[] = []

  constructor(scene: Phaser.Scene, configs: ButtonConfig[]) {
    this.scene = scene
    configs.forEach(cfg => this.createButton(cfg))
  }

  private createButton(cfg: ButtonConfig): void {
    const img = this.scene.add.image(0, 0, cfg.texture).setDisplaySize(56, 56)

    const label = this.scene.add
      .text(0, 22, cfg.label, {
        fontSize: '10px',
        color: '#ffffff',
        fontFamily: 'serif',
      })
      .setOrigin(0.5)

    const container = this.scene.add
      .container(cfg.x, cfg.y, [img, label])
      .setScrollFactor(0)
      .setDepth(100)
      .setSize(56, 56)
      .setInteractive()

    container.on('pointerdown', () => {
      img.setTint(0xaaaaaa)
      cfg.onTap()
    })

    container.on('pointerup', () => img.clearTint())
    container.on('pointerout', () => img.clearTint())

    this.buttons.push(container)
  }

  destroy(): void {
    this.buttons.forEach(b => b.destroy())
    this.buttons = []
  }
}
