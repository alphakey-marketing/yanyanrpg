import Phaser from 'phaser'
import { SCENE_PRELOAD } from '../core/constants'

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload(): void {
    // Attempt to lock landscape orientation on mobile; silently ignore failures
    if (this.sys.game.device.os.android || this.sys.game.device.os.iOS) {
      try {
        const screen = window.screen as Screen & {
          orientation?: { lock: (o: string) => Promise<void> }
        }
        screen.orientation?.lock('landscape')?.catch(() => {
          // Orientation lock may be denied; continue without it
        })
      } catch {
        // Browser does not support orientation lock; continue
      }
    }
  }

  create(): void {
    this.scale.setGameSize(800, 450)
    this.scene.start(SCENE_PRELOAD)
  }
}
