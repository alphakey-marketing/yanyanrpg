import Phaser from 'phaser'
import { SCENE_PRELOAD } from '../core/constants'

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload(): void {
    // Attempt Screen Orientation API lock (Android Chrome / some browsers).
    // CSS handles portrait→landscape rotation for all others (see index.html).
    try {
      const orientationObj = (window.screen as Screen & {
        orientation?: { lock: (o: string) => Promise<void> }
      }).orientation
      orientationObj?.lock('landscape-primary')?.catch(() => { /* denied — CSS handles it */ })
    } catch {
      // API not supported — CSS rotation covers this
    }
  }

  create(): void {
    this.scale.setGameSize(800, 450)
    this.scene.start(SCENE_PRELOAD)
  }
}
