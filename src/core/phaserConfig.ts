import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from './constants'
import BootScene from '../scenes/BootScene'
import PreloadScene from '../scenes/PreloadScene'
import VillageScene from '../scenes/VillageScene'
import BambooFieldScene from '../scenes/BambooFieldScene'
import RuinCaveScene from '../scenes/RuinCaveScene'
import UIScene from '../scenes/UIScene'

const phaserConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1a1a2e',
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  input: {
    activePointers: 4,
  },
  scene: [BootScene, PreloadScene, VillageScene, BambooFieldScene, RuinCaveScene, UIScene],
}

export default phaserConfig
