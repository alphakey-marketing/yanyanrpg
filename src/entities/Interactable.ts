import Phaser from 'phaser'
import type { MapNode } from '../types/game'
import { emit, Events } from '../core/eventBus'
import { hasFlag, setFlag } from '../systems/quest/flagSystem'
import { useGameStore } from '../ui/store/useGameStore'

export default class Interactable {
  sprite: Phaser.Physics.Arcade.Sprite
  node: MapNode
  private label: Phaser.GameObjects.Text
  private triggered = false

  constructor(scene: Phaser.Scene, node: MapNode) {
    this.node = node

    const textureKey = this.getTexture(node.type)
    this.sprite = scene.physics.add.sprite(node.x, node.y, textureKey)
    this.sprite.setImmovable(true)
    this.sprite.setDepth(8)

    this.label = scene.add
      .text(node.x, node.y - 24, this.getLabel(node.type), {
        fontSize: node.type === 'entrance' ? '14px' : '10px',
        color: node.type === 'entrance' ? '#ffe066' : '#f1c40f',
        fontFamily: 'serif',
        stroke: '#000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(9)

    // Pulse entrance labels so they're clearly visible
    if (node.type === 'entrance') {
      scene.tweens.add({
        targets: this.label,
        alpha: { from: 1, to: 0.4 },
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    }

    if (node.triggerFlag && hasFlag(node.triggerFlag)) {
      this.triggered = true
      this.sprite.setAlpha(0.4)
    }
  }

  private getTexture(type: MapNode['type']): string {
    switch (type) {
      case 'chest':
        return 'chest'
      default:
        return 'mechanism'
    }
  }

  private getLabel(type: MapNode['type']): string {
    switch (type) {
      case 'chest': return '箱'
      case 'mechanism': return '機'
      case 'entrance': return '【進入】'
      case 'platform': return '台'
      case 'secret': return '？'
      case 'encounter': return '！'
      default: return '◆'
    }
  }

  canInteract(): boolean {
    if (this.triggered && this.node.type !== 'entrance') return false
    const { node } = this
    if (node.requiresFlag && !hasFlag(node.requiresFlag)) return false
    if (node.requiresMysticArt) {
      const store = useGameStore.getState()
      if (!store.player.learnedMysticArts.includes(node.requiresMysticArt)) return false
    }
    return true
  }

  interact(scene: Phaser.Scene): void {
    if (!this.canInteract()) {
      const { node } = this
      let hint = ''
      if (node.requiresFlag && !hasFlag(node.requiresFlag)) {
        hint = '條件未達成'
      } else if (node.requiresMysticArt) {
        hint = `需要奇術`
      }
      if (hint) {
        const text = scene.add.text(this.sprite.x, this.sprite.y - 40, hint, {
          fontSize: '11px', color: '#ff8888', fontFamily: 'serif',
          stroke: '#000', strokeThickness: 2,
        }).setDepth(200).setOrigin(0.5)
        scene.time.delayedCall(1500, () => text.destroy())
      }
      return
    }

    if (this.node.type === 'entrance' && this.node.linkedSceneId) {
      // FIX Bug #1: emit SCENE_NAVIGATE (navigation request) not SCENE_CHANGED.
      // SCENE_NAVIGATE is handled only by BaseScene's navigation listener.
      // SCENE_CHANGED / SCENE_READY is for HUD label updates only.
      emit(Events.SCENE_NAVIGATE, this.node.linkedSceneId)
      return
    }

    if (!this.triggered) {
      this.triggered = true
      this.sprite.setAlpha(0.4)
      if (this.node.triggerFlag) {
        setFlag(this.node.triggerFlag)
      }
      emit(Events.NODE_TRIGGERED, this.node)
      import('../systems/quest/questSystem').then(({ checkQuestCompletion }) => {
        checkQuestCompletion('interact', this.node.id)
      })
    }
  }

  destroy(): void {
    this.sprite.destroy()
    this.label.destroy()
  }
}
