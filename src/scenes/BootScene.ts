import Phaser from 'phaser'
import { SCENE_PRELOAD } from '../core/constants'

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload(): void {
    // Force landscape on mobile
    if (this.sys.game.device.os.android || this.sys.game.device.os.iOS) {
      const screen = window.screen as Screen & {
        orientation?: { lock: (o: string) => void }
      }
      screen.orientation?.lock('landscape')
    }
  }

  create(): void {
    this.scale.setGameSize(800, 450)
    this.scene.start(SCENE_PRELOAD)
  }
}
