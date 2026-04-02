import Phaser from 'phaser'
import { SCENE_UI } from '../core/constants'
import { emit, on, off, Events } from '../core/eventBus'
import type { DialogueData } from '../ui/store/useGameStore'
import { useGameStore } from '../ui/store/useGameStore'
import Player from '../entities/Player'
import NPC from '../entities/NPC'
import Interactable from '../entities/Interactable'
import Enemy from '../entities/Enemy'
import npcsData from '../data/npcs.json'
import mapNodesData from '../data/mapNodes.json'
import mysticArtsData from '../data/mysticArts.json'
import type { NPCData, MapNode, MysticArtData } from '../types/game'
import { updatePatrol } from '../systems/ai/patrolSystem'
import { updateAggro } from '../systems/ai/aggroSystem'
import { checkQuestCompletion } from '../systems/quest/questSystem'

const MYSTIC_ART_NAMES: Record<string, string> = Object.fromEntries(
  (mysticArtsData as MysticArtData[]).map(a => [a.id, a.name])
)

const NPC_DIALOGUES: Record<string, DialogueData> = {
  npc_village_chief: {
    npcId: 'npc_village_chief',
    name: '村長',
    lines: ['山賊近日在竹林出沒，祠印恐怕已被奪走。', '請你去竹林道查看，若能尋回祠印，村中上下感激不盡。'],
    options: [
      { label: '我去看看', action: 'accept_quest_main' },
      { label: '先去酒館打聽', action: 'close' },
    ],
    questId: 'quest_main_01',
  },
  npc_storyteller: {
    npcId: 'npc_storyteller',
    name: '說書人',
    lines: ['老夫聽聞，破廟地宮深處藏有一件古物，不知真假。', '有興趣的話，不妨去瞧瞧。'],
    options: [
      { label: '多謝提示', action: 'accept_quest_side_02' },
      { label: '先不了', action: 'close' },
    ],
    questId: 'quest_side_02',
  },
  npc_healer: {
    npcId: 'npc_healer',
    name: '郎中',
    lines: ['竹林中有山草藥，若你能幫我採幾株，我用藥丹答謝。'],
    options: [
      { label: '我去採', action: 'accept_quest_side_01' },
      { label: '改天再說', action: 'close' },
    ],
    questId: 'quest_side_01',
  },
  npc_trainer: {
    npcId: 'npc_trainer',
    name: '練武師傅',
    lines: [
      '武者需懂雙武器之道。按「換武」鍵可切換主副武器。',
      '奇術是武者的秘藏，習得後按「奇術」鍵施放。記得裝備奇術才能使用。',
    ],
    options: [{ label: '多謝指教', action: 'close' }],
  },
  npc_villager: {
    npcId: 'npc_villager',
    name: '村民',
    lines: ['昨夜竹林傳來怪聲，嚇得我一夜未眠。不知是何邪物作怪……'],
    options: [
      { label: '我去調查', action: 'accept_quest_side_03' },
      { label: '無妨', action: 'close' },
    ],
    questId: 'quest_side_03',
  },
  npc_hermit: {
    npcId: 'npc_hermit',
    name: '隱士',
    lines: ['你能到達此地，說明你有幾分本事。', '老夫有一試煉，通過者可得真傳。'],
    options: [
      { label: '接受試煉', action: 'accept_quest_encounter_02' },
      { label: '先不了', action: 'close' },
    ],
    questId: 'quest_encounter_02',
  },
}

export default abstract class BaseScene extends Phaser.Scene {
  protected player!: Player
  protected npcs: NPC[] = []
  protected enemies: Enemy[] = []
  protected interactables: Interactable[] = []
  protected sceneId: string
  private nearbyNPC: NPC | null = null
  private fKey: Phaser.Input.Keyboard.Key | null = null

  constructor(key: string) {
    super({ key })
    this.sceneId = key
  }

  create(): void {
    this.setupWorld()
    this.setupPlayer()
    this.setupNPCs()
    this.setupInteractables()
    this.setupEnemies()
    this.setupCollisions()
    this.setupEventListeners()
    this.fKey = this.input.keyboard?.addKey('F') ?? null
    this.scene.launch(SCENE_UI)
    emit(Events.SCENE_CHANGED, this.sceneId)
    useGameStore.getState().setScene(this.sceneId, this.player.sprite.x, this.player.sprite.y)
    checkQuestCompletion('enterScene', this.sceneId)
  }

  protected abstract setupWorld(): void
  protected abstract setupEnemies(): void

  protected setupPlayer(): void {
    this.player = new Player(this, this.getPlayerSpawnX(), this.getPlayerSpawnY())
  }

  protected getPlayerSpawnX(): number { return 100 }
  protected getPlayerSpawnY(): number { return 225 }

  protected setupNPCs(): void {
    const sceneNPCs = (npcsData as NPCData[]).filter(n => n.sceneId === this.sceneId)
    sceneNPCs.forEach(data => {
      const npc = new NPC(this, data)
      this.npcs.push(npc)
    })
  }

  protected setupInteractables(): void {
    const sceneNodes = (mapNodesData as MapNode[]).filter(n => n.sceneId === this.sceneId)
    sceneNodes.forEach(node => {
      const item = new Interactable(this, node)
      this.interactables.push(item)
    })
  }

  protected setupCollisions(): void {
    // Collisions reserved for future use (walls, platforms)
  }

  protected setupEventListeners(): void {
    const handleToast = (...args: unknown[]) => {
      useGameStore.getState().addToast(args[0] as string)
    }
    on(Events.SHOW_TOAST, handleToast)

    const handleSceneChange = (...args: unknown[]) => {
      const sceneId = args[0] as string
      if (sceneId !== this.sceneId) {
        this.scene.start(sceneId)
      }
    }
    on(Events.SCENE_CHANGED, handleSceneChange)

    const handleNodeTriggered = (...args: unknown[]) => {
      const node = args[0] as MapNode
      if (node.unlocksArt) {
        const store = useGameStore.getState()
        if (!store.player.learnedMysticArts.includes(node.unlocksArt)) {
          store.learnMysticArt(node.unlocksArt)
          emit(Events.MYSTIC_ART_UNLOCKED, node.unlocksArt)
          emit(Events.SHOW_TOAST, `習得奇術：${MYSTIC_ART_NAMES[node.unlocksArt] ?? node.unlocksArt}`)
        }
      }
    }
    on(Events.NODE_TRIGGERED, handleNodeTriggered)

    this.events.on('shutdown', () => {
      off(Events.SHOW_TOAST, handleToast)
      off(Events.SCENE_CHANGED, handleSceneChange)
      off(Events.NODE_TRIGGERED, handleNodeTriggered)
    })
  }

  private openNPCDialogue(npc: NPC): void {
    const dialogue = NPC_DIALOGUES[npc.data.id]
    if (!dialogue || useGameStore.getState().isDialogueOpen) return
    useGameStore.getState().openDialogue(dialogue)
    // Advance any active quest that expects dialogue with this NPC
    checkQuestCompletion('dialogue', npc.data.id)
  }

  update(_time: number, delta: number): void {
    if (useGameStore.getState().isPaused) return

    this.player.update(delta)
    this.player.setEnemies(this.enemies)

    // NPC proximity: show tappable interact prompt
    this.nearbyNPC = null
    let minDist = Infinity
    this.npcs.forEach(npc => {
      npc.update()
      const dist = Phaser.Math.Distance.Between(
        this.player.sprite.x, this.player.sprite.y,
        npc.sprite.x, npc.sprite.y
      )
      if (dist < 60) {
        const dialogue = NPC_DIALOGUES[npc.data.id]
        const onInteract = dialogue ? () => this.openNPCDialogue(npc) : undefined
        npc.showInteractPrompt(this, onInteract)
        if (dist < minDist) {
          minDist = dist
          this.nearbyNPC = npc
        }
      } else {
        npc.hideInteractPrompt()
      }
    })

    // F key to interact with nearest NPC
    if (
      this.fKey &&
      Phaser.Input.Keyboard.JustDown(this.fKey) &&
      this.nearbyNPC &&
      !useGameStore.getState().isDialogueOpen
    ) {
      this.openNPCDialogue(this.nearbyNPC)
    }

    this.enemies.forEach(enemy => {
      enemy.update()
      updatePatrol(enemy, delta)
      updateAggro(enemy, this.player.sprite, delta)
    })

    // Critical: trigger scene transitions and interactable nodes
    this.player.checkInteractableInteraction(this.interactables)

    this.enemies = this.enemies.filter(e => e.isAlive())
  }

  shutdown(): void {
    if (this.player) this.player.destroy()
    this.npcs.forEach(n => n.destroy())
    this.enemies.forEach(e => e.destroy())
    this.interactables.forEach(i => i.destroy())
    this.npcs = []
    this.enemies = []
    this.interactables = []
  }
}
