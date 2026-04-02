import { create } from 'zustand'
import type { PlayerState, InventoryItem } from '../../types/game'
import type { ActiveQuest } from '../../types/quest'
import {
  PLAYER_MAX_HP,
  PLAYER_MAX_STAMINA,
  PLAYER_MAX_INTERNAL_ENERGY,
  INITIAL_PLAYER_ID,
  INITIAL_PLAYER_NAME,
  SCENE_VILLAGE,
} from '../../core/constants'

export interface DialogueData {
  npcId: string
  name: string
  lines: string[]
  options?: { label: string; action: string }[]
  questId?: string
}

interface GameStore {
  player: PlayerState
  setPlayerHp: (hp: number) => void
  setPlayerStamina: (stamina: number) => void
  setPlayerEnergy: (energy: number) => void
  setActiveWeaponSlot: (slot: 0 | 1) => void
  setEquippedMysticArt: (artId: string | null) => void
  addFlag: (flag: string) => void
  removeFlag: (flag: string) => void
  addInventoryItem: (itemId: string, count: number) => void
  unlockWeapon: (weaponId: string) => void
  learnMysticArt: (artId: string) => void
  addCurrency: (amount: number) => void
  setScene: (sceneId: string, x: number, y: number) => void

  activeQuests: ActiveQuest[]
  addActiveQuest: (quest: ActiveQuest) => void
  updateQuestStage: (questId: string, stageIndex: number, progress: Record<string, number>) => void
  updateQuestProgress: (questId: string, stageId: string, count: number) => void
  completeQuest: (questId: string) => void

  isDialogueOpen: boolean
  dialogueData: DialogueData | null
  isQuestOpen: boolean
  isInventoryOpen: boolean
  isSkillOpen: boolean
  isPaused: boolean
  toasts: { id: number; message: string }[]
  openDialogue: (data: DialogueData) => void
  closeDialogue: () => void
  setQuestOpen: (open: boolean) => void
  setInventoryOpen: (open: boolean) => void
  setSkillOpen: (open: boolean) => void
  setPaused: (paused: boolean) => void
  addToast: (message: string) => void
  removeToast: (id: number) => void
  currency: number
}

const initialPlayer: PlayerState = {
  id: INITIAL_PLAYER_ID,
  name: INITIAL_PLAYER_NAME,
  hp: PLAYER_MAX_HP,
  maxHp: PLAYER_MAX_HP,
  stamina: PLAYER_MAX_STAMINA,
  maxStamina: PLAYER_MAX_STAMINA,
  internalEnergy: PLAYER_MAX_INTERNAL_ENERGY,
  maxInternalEnergy: PLAYER_MAX_INTERNAL_ENERGY,
  sceneId: SCENE_VILLAGE,
  x: 200,
  y: 200,
  equippedWeapons: ['sword_qingfeng', 'fan_youfeng'],
  activeWeaponSlot: 0,
  learnedMysticArts: [],
  equippedMysticArt: null,
  inventory: [],
  stats: {
    attack: 5,
    defense: 3,
    agility: 8,
    breakPower: 4,
  },
  progression: {
    level: 1,
    weaponMastery: {},
    explorationScore: 0,
  },
  flags: [],
}

let toastIdCounter = 0

export const useGameStore = create<GameStore>(set => ({
  player: initialPlayer,
  currency: 0,

  setPlayerHp: (hp) =>
    set(s => ({ player: { ...s.player, hp: Math.max(0, Math.min(hp, s.player.maxHp)) } })),

  setPlayerStamina: (stamina) =>
    set(s => ({ player: { ...s.player, stamina: Math.max(0, Math.min(stamina, s.player.maxStamina)) } })),

  setPlayerEnergy: (internalEnergy) =>
    set(s => ({
      player: {
        ...s.player,
        internalEnergy: Math.max(0, Math.min(internalEnergy, s.player.maxInternalEnergy)),
      },
    })),

  setActiveWeaponSlot: (slot) =>
    set(s => ({ player: { ...s.player, activeWeaponSlot: slot } })),

  setEquippedMysticArt: (artId) =>
    set(s => ({ player: { ...s.player, equippedMysticArt: artId } })),

  addFlag: (flag) =>
    set(s => {
      if (s.player.flags.includes(flag)) return s
      return { player: { ...s.player, flags: [...s.player.flags, flag] } }
    }),

  removeFlag: (flag) =>
    set(s => ({ player: { ...s.player, flags: s.player.flags.filter(f => f !== flag) } })),

  addInventoryItem: (itemId, count) =>
    set(s => {
      const existing = s.player.inventory.find(i => i.id === itemId)
      if (existing) {
        return {
          player: {
            ...s.player,
            inventory: s.player.inventory.map(i =>
              i.id === itemId ? { ...i, quantity: i.quantity + count } : i
            ),
          },
        }
      }
      const newItem: InventoryItem = {
        id: itemId,
        name: itemId,
        type: 'material',
        description: '',
        quantity: count,
      }
      return { player: { ...s.player, inventory: [...s.player.inventory, newItem] } }
    }),

  unlockWeapon: (weaponId) =>
    set(s => {
      const weapons = [...s.player.equippedWeapons] as [string, string]
      if (!weapons[0]) weapons[0] = weaponId
      else weapons[1] = weaponId
      return { player: { ...s.player, equippedWeapons: weapons } }
    }),

  learnMysticArt: (artId) =>
    set(s => {
      if (s.player.learnedMysticArts.includes(artId)) return s
      return {
        player: {
          ...s.player,
          learnedMysticArts: [...s.player.learnedMysticArts, artId],
          equippedMysticArt: s.player.equippedMysticArt ?? artId,
        },
      }
    }),

  addCurrency: (amount) => set(s => ({ currency: s.currency + amount })),

  setScene: (sceneId, x, y) =>
    set(s => ({ player: { ...s.player, sceneId, x, y } })),

  activeQuests: [],

  addActiveQuest: (quest) =>
    set(s => ({
      activeQuests: [...s.activeQuests.filter(q => q.questId !== quest.questId), quest],
    })),

  updateQuestStage: (questId, stageIndex, progress) =>
    set(s => ({
      activeQuests: s.activeQuests.map(q =>
        q.questId === questId ? { ...q, currentStageIndex: stageIndex, stageProgress: progress } : q
      ),
    })),

  updateQuestProgress: (questId, stageId, count) =>
    set(s => ({
      activeQuests: s.activeQuests.map(q =>
        q.questId === questId
          ? { ...q, stageProgress: { ...q.stageProgress, [stageId]: count } }
          : q
      ),
    })),

  completeQuest: (questId) =>
    set(s => ({
      activeQuests: s.activeQuests.map(q =>
        q.questId === questId ? { ...q, status: 'completed' } : q
      ),
    })),

  isDialogueOpen: false,
  dialogueData: null,
  isQuestOpen: false,
  isInventoryOpen: false,
  isSkillOpen: false,
  isPaused: false,
  toasts: [],

  openDialogue: (data) => set({ isDialogueOpen: true, dialogueData: data }),
  closeDialogue: () => set({ isDialogueOpen: false, dialogueData: null }),
  setQuestOpen: (open) => set({ isQuestOpen: open }),
  setInventoryOpen: (open) => set({ isInventoryOpen: open }),
  setSkillOpen: (open) => set({ isSkillOpen: open }),
  setPaused: (paused) => set({ isPaused: paused }),

  addToast: (message) => {
    const id = ++toastIdCounter
    set(s => ({ toasts: [...s.toasts, { id, message }] }))
    setTimeout(() => {
      set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }))
    }, 2500)
  },

  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}))
