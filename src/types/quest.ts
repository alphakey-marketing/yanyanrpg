export type QuestType = 'main' | 'side' | 'encounter' | 'exploration'
export type QuestStatus = 'locked' | 'available' | 'active' | 'completed'

export type QuestStage = {
  id: string
  objective: string
  completion: {
    type: 'dialogue' | 'interact' | 'kill' | 'enterScene' | 'collect'
    targetId: string
    count?: number
  }
}

export type QuestReward = {
  type: 'item' | 'weapon' | 'unlockMysticArt' | 'currency'
  id: string
  amount?: number
}

export type QuestData = {
  id: string
  type: QuestType
  title: string
  description: string
  giverNpcId?: string
  stages: QuestStage[]
  rewards: QuestReward[]
  flagsOnComplete: string[]
  prerequisiteFlags?: string[]
}

export type ActiveQuest = {
  questId: string
  status: QuestStatus
  currentStageIndex: number
  stageProgress: Record<string, number>
}
