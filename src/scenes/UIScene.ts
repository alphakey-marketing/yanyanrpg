import Phaser from 'phaser'
import { GAME_WIDTH } from '../core/constants'
import { on, off, Events } from '../core/eventBus'
import { useGameStore } from '../ui/store/useGameStore'

export default class UIScene extends Phaser.Scene {
  private regionLabel!: Phaser.GameObjects.Text
  private questLabel!: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'UIScene' })
  }

  create(): void {
    this.regionLabel = this.add
      .text(GAME_WIDTH - 10, 10, '', {
        fontSize: '13px',
        color: '#e8c97e',
        fontFamily: 'serif',
        stroke: '#000',
        strokeThickness: 2,
        align: 'right',
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(200)

    this.questLabel = this.add
      .text(GAME_WIDTH - 10, 30, '', {
        fontSize: '11px',
        color: '#ffffff',
        fontFamily: 'serif',
        stroke: '#000',
        strokeThickness: 2,
        align: 'right',
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(200)

    const handleSceneChange = (...args: unknown[]) => {
      const sceneId = args[0] as string
      const labels: Record<string, string> = {
        VillageScene: '清河村',
        BambooFieldScene: '竹林道',
        RuinCaveScene: '破廟地宮',
      }
      this.regionLabel.setText(`區域：${labels[sceneId] ?? ''}`)
    }

    const handleQuestUpdate = () => {
      this.updateQuestTracker()
    }

    // FIX: use SCENE_READY (scene announcement for HUD) not SCENE_CHANGED.
    // SCENE_NAVIGATE is for BaseScene navigation only and must not be used here.
    on(Events.SCENE_READY, handleSceneChange)
    on(Events.QUEST_UPDATE, handleQuestUpdate)

    this.events.on('shutdown', () => {
      off(Events.SCENE_READY, handleSceneChange)
      off(Events.QUEST_UPDATE, handleQuestUpdate)
    })
  }

  private updateQuestTracker(): void {
    const { activeQuests } = useGameStore.getState()
    const active = activeQuests.find(q => q.status === 'active')
    this.questLabel.setText(active ? '任務進行中' : '')
  }
}