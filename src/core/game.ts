import Phaser from 'phaser'
import phaserConfig from './phaserConfig'

let gameInstance: Phaser.Game | null = null

export function createGame(): Phaser.Game {
  if (gameInstance) return gameInstance
  gameInstance = new Phaser.Game(phaserConfig)
  return gameInstance
}

export function destroyGame(): void {
  if (gameInstance) {
    gameInstance.destroy(true)
    gameInstance = null
  }
}

export function getGame(): Phaser.Game | null {
  return gameInstance
}
