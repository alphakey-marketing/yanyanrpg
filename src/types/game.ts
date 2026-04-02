export type InventoryItem = {
  id: string
  name: string
  type: 'consumable' | 'material' | 'key'
  description: string
  quantity: number
}

export type PlayerState = {
  id: string
  name: string
  hp: number
  maxHp: number
  stamina: number
  maxStamina: number
  internalEnergy: number
  maxInternalEnergy: number
  sceneId: string
  x: number
  y: number
  equippedWeapons: [string, string]
  activeWeaponSlot: 0 | 1
  learnedMysticArts: string[]
  equippedMysticArt: string | null
  inventory: InventoryItem[]
  stats: {
    attack: number
    defense: number
    agility: number
    breakPower: number
  }
  progression: {
    level: number
    weaponMastery: Record<string, number>
    explorationScore: number
  }
  flags: string[]
}

export type WeaponData = {
  id: string
  name: string
  type: 'sword' | 'fan' | 'spear' | 'fist'
  role: 'balanced' | 'fast' | 'breaker' | 'control'
  stats: {
    attack: number
    breakPower: number
    speed: number
  }
  moveset: {
    lightAttack: string
    heavyAttack: string
    special: string
    switchSkill: string
  }
  mobileLayoutHint?: 'tap-combo' | 'hold-heavy'
}

export type MysticArtData = {
  id: string
  name: string
  category: 'exploration' | 'combat' | 'hybrid'
  cost: number
  cooldown: number
  uses: Array<'exploration' | 'combat'>
  effects: string[]
  unlockCondition: {
    type: 'questComplete' | 'npcTeach' | 'hiddenEvent'
    targetId: string
  }
}

export type NPCData = {
  id: string
  name: string
  role: string
  sceneId: string
  x: number
  y: number
  dialogueIds: string[]
  questIds?: string[]
  shopItems?: string[]
}

export type EnemyData = {
  id: string
  name: string
  type: 'normal' | 'elite' | 'boss'
  hp: number
  attack: number
  defense: number
  speed: number
  aggroRange: number
  patrolRadius: number
  dropTableId: string
  sceneId: string
}

export type MapNode = {
  id: string
  sceneId: string
  type: 'entrance' | 'chest' | 'mechanism' | 'platform' | 'secret' | 'encounter'
  x: number
  y: number
  requiresFlag?: string
  requiresMysticArt?: string
  triggerFlag?: string
  linkedSceneId?: string
}

export type DropEntry = {
  itemId: string
  chance: number
  minCount: number
  maxCount: number
}

export type DropTable = {
  id: string
  entries: DropEntry[]
}
