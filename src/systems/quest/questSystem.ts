import questsData from '../../data/quests.json'
import type { QuestData, ActiveQuest } from '../../types/quest'
import { useGameStore } from '../../ui/store/useGameStore'
import { emit, Events } from '../../core/eventBus'
import { setFlag, hasFlag } from './flagSystem'

const quests: QuestData[] = questsData as QuestData[]

export function getQuestData(questId: string): QuestData | undefined {
  return quests.find(q => q.id === questId)
}

export function getAvailableQuests(): QuestData[] {
  const { activeQuests, player } = useGameStore.getState()
  const activeIds = new Set(activeQuests.map(q => q.questId))
  return quests.filter(q => {
    if (activeIds.has(q.id)) return false
    if (!q.prerequisiteFlags || q.prerequisiteFlags.length === 0) return true
    return q.prerequisiteFlags.every(f => player.flags.includes(f))
  })
}

export function startQuest(questId: string): void {
  const quest = getQuestData(questId)
  if (!quest) return

  const newActive: ActiveQuest = {
    questId,
    status: 'active',
    currentStageIndex: 0,
    stageProgress: {},
  }
  useGameStore.getState().addActiveQuest(newActive)
  emit(Events.QUEST_UPDATE, questId, 'started')
  emit(Events.SHOW_TOAST, `任務開始：${quest.title}`)
}

export function advanceQuestProgress(
  completionType: string,
  targetId: string,
  count = 1
): void {
  const store = useGameStore.getState()
  const { activeQuests } = store

  activeQuests.forEach(aq => {
    if (aq.status !== 'active') return
    const quest = getQuestData(aq.questId)
    if (!quest) return

    const stage = quest.stages[aq.currentStageIndex]
    if (!stage) return
    if (
      stage.completion.type === completionType &&
      stage.completion.targetId === targetId
    ) {
      const required = stage.completion.count ?? 1
      const current = (aq.stageProgress[stage.id] ?? 0) + count

      if (current >= required) {
        const nextIndex = aq.currentStageIndex + 1
        if (nextIndex >= quest.stages.length) {
          completeQuest(aq.questId)
        } else {
          store.updateQuestStage(aq.questId, nextIndex, {})
          emit(Events.QUEST_UPDATE, aq.questId, 'stage_advance')
          emit(Events.SHOW_TOAST, `任務進度：${quest.stages[nextIndex]?.objective ?? ''}`)
        }
      } else {
        store.updateQuestProgress(aq.questId, stage.id, current)
        emit(Events.QUEST_UPDATE, aq.questId, 'progress')
      }
    }
  })
}

function completeQuest(questId: string): void {
  const quest = getQuestData(questId)
  if (!quest) return

  useGameStore.getState().completeQuest(questId)
  quest.flagsOnComplete.forEach(flag => setFlag(flag))

  quest.rewards.forEach(reward => {
    const store = useGameStore.getState()
    if (reward.type === 'item') {
      store.addInventoryItem(reward.id, reward.amount ?? 1)
    } else if (reward.type === 'weapon') {
      store.unlockWeapon(reward.id)
    } else if (reward.type === 'unlockMysticArt') {
      store.learnMysticArt(reward.id)
      emit(Events.MYSTIC_ART_UNLOCKED, reward.id)
    } else if (reward.type === 'currency') {
      store.addCurrency(reward.amount ?? 0)
    }
  })

  emit(Events.QUEST_UPDATE, questId, 'completed')
  emit(Events.SHOW_TOAST, `任務完成：${quest.title}`)
}

export function checkQuestCompletion(
  type: 'dialogue' | 'interact' | 'kill' | 'enterScene' | 'collect',
  targetId: string,
  count = 1
): void {
  advanceQuestProgress(type, targetId, count)
}

export function isQuestActive(questId: string): boolean {
  return useGameStore.getState().activeQuests.some(q => q.questId === questId && q.status === 'active')
}

export function isQuestComplete(questId: string): boolean {
  return useGameStore.getState().activeQuests.some(q => q.questId === questId && q.status === 'completed')
}

export function initQuests(): void {
  const available = getAvailableQuests()
  available.forEach(q => {
    if (!hasFlag(`quest_seen_${q.id}`)) {
      setFlag(`quest_seen_${q.id}`)
    }
  })
}
