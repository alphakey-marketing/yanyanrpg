import React from 'react'
import { useGameStore } from '../store/useGameStore'

const BOTTOM_SHEET_STYLE: React.CSSProperties = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'rgba(15, 10, 8, 0.95)',
  border: '1px solid rgba(232,201,126,0.4)',
  borderRadius: '16px 16px 0 0',
  padding: '16px',
  maxHeight: '55%',
  overflowY: 'auto',
  zIndex: 30,
  fontFamily: 'serif',
  color: '#e8c97e',
  pointerEvents: 'auto',
}

const CLOSE_BTN: React.CSSProperties = {
  position: 'absolute',
  top: 12,
  right: 16,
  background: 'none',
  border: 'none',
  color: '#aaa',
  fontSize: 18,
  cursor: 'pointer',
}

// ─── Dialogue Sheet ───────────────────────────────────────────────────────────
export function DialogueSheet(): React.ReactElement | null {
  const { isDialogueOpen, dialogueData, closeDialogue, activeQuests } = useGameStore()
  const [lineIdx, setLineIdx] = React.useState(0)

  React.useEffect(() => {
    if (isDialogueOpen) setLineIdx(0)
  }, [isDialogueOpen, dialogueData])

  if (!isDialogueOpen || !dialogueData) return null

  const isLastLine = lineIdx >= dialogueData.lines.length - 1
  const currentLine = dialogueData.lines[lineIdx] ?? ''

  const handleNext = () => {
    if (!isLastLine) {
      setLineIdx(i => i + 1)
    } else {
      closeDialogue()
    }
  }

  const handleOption = (action: string) => {
    if (action.startsWith('accept_quest_') && dialogueData.questId) {
      const questId = dialogueData.questId
      const alreadyActive = activeQuests.some(q => q.questId === questId)
      if (!alreadyActive) {
        import('../../systems/quest/questSystem').then(({ startQuest }) => startQuest(questId))
      }
    }
    closeDialogue()
  }

  return (
    <div style={{ ...BOTTOM_SHEET_STYLE, minHeight: 160 }}>
      <div style={{ fontSize: 14, color: '#e8c97e', marginBottom: 6, fontWeight: 'bold' }}>
        {dialogueData.name}
      </div>
      <div style={{ fontSize: 13, color: '#ddd', lineHeight: 1.6, minHeight: 48, marginBottom: 12 }}>
        {currentLine}
      </div>

      {isLastLine && dialogueData.options ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {dialogueData.options.map(opt => (
            <button key={opt.action} onClick={() => handleOption(opt.action)} style={optionBtnStyle}>
              {opt.label}
            </button>
          ))}
        </div>
      ) : (
        <button onClick={handleNext} style={optionBtnStyle}>
          {isLastLine ? '關閉' : '繼續 ▶'}
        </button>
      )}
    </div>
  )
}

// ─── Quest Sheet ──────────────────────────────────────────────────────────────
const QUEST_TYPE_LABELS: Record<string, string> = {
  main: '主線',
  side: '支線',
  encounter: '奇遇',
  exploration: '探索',
}

interface QuestDataItem {
  id: string
  type: string
  title: string
  stages: { id: string; objective: string }[]
  rewards: { id: string }[]
}

export function QuestSheet(): React.ReactElement | null {
  const { isQuestOpen, activeQuests, setQuestOpen } = useGameStore()
  const [selectedType, setSelectedType] = React.useState<string>('main')
  const [questsData, setQuestsData] = React.useState<QuestDataItem[]>([])

  React.useEffect(() => {
    import('../../data/quests.json').then(m => setQuestsData(m.default as QuestDataItem[]))
  }, [])

  if (!isQuestOpen) return null

  const types = ['main', 'side', 'encounter', 'exploration']

  const filtered = activeQuests
    .map(aq => {
      const qd = questsData.find(q => q.id === aq.questId)
      return qd ? { aq, qd } : null
    })
    .filter((item): item is { aq: typeof activeQuests[0]; qd: QuestDataItem } => item !== null)
    .filter(item => item.qd.type === selectedType)

  return (
    <div style={BOTTOM_SHEET_STYLE}>
      <button style={CLOSE_BTN} onClick={() => setQuestOpen(false)}>✕</button>
      <div style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 10 }}>任務誌</div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {types.map(t => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            style={{
              ...tabBtnStyle,
              borderColor: selectedType === t ? '#e8c97e' : 'rgba(255,255,255,0.2)',
              color: selectedType === t ? '#e8c97e' : '#aaa',
            }}
          >
            {QUEST_TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ color: '#666', fontSize: 12 }}>（無進行中任務）</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(({ aq, qd }) => {
            const stage = qd.stages[aq.currentStageIndex]
            return (
              <div
                key={aq.questId}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  borderLeft: `3px solid ${aq.status === 'completed' ? '#4caf50' : '#e8c97e'}`,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 4 }}>
                  {qd.title}
                  {aq.status === 'completed' && (
                    <span style={{ color: '#4caf50', marginLeft: 6, fontSize: 11 }}>✓ 完成</span>
                  )}
                </div>
                {stage && aq.status === 'active' && (
                  <div style={{ fontSize: 11, color: '#bbb' }}>▸ {stage.objective}</div>
                )}
                {qd.rewards.length > 0 && (
                  <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>
                    獎勵：{qd.rewards.map(r => r.id).join('、')}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Inventory Sheet ──────────────────────────────────────────────────────────
export function InventorySheet(): React.ReactElement | null {
  const { isInventoryOpen, setInventoryOpen, player, currency } = useGameStore()

  if (!isInventoryOpen) return null

  return (
    <div style={BOTTOM_SHEET_STYLE}>
      <button style={CLOSE_BTN} onClick={() => setInventoryOpen(false)}>✕</button>
      <div style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 10 }}>
        背包
        <span style={{ fontSize: 11, color: '#aaa', marginLeft: 12 }}>銅錢：{currency}</span>
      </div>

      {player.inventory.length === 0 ? (
        <div style={{ color: '#666', fontSize: 12 }}>（背包空空如也）</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {player.inventory.map(item => (
            <div
              key={item.id}
              style={{
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 8,
                padding: '8px 6px',
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <div style={{ fontSize: 11, color: '#e8c97e' }}>{item.name}</div>
              <div style={{ fontSize: 16, color: '#fff' }}>×{item.quantity}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Skill Sheet ──────────────────────────────────────────────────────────────
const WEAPON_INFO: Record<string, { name: string; light: string; heavy: string; special: string; role: string }> = {
  sword_qingfeng: { name: '青鋒單劍', light: '三連斬', heavy: '突刺', special: '旋風斬', role: '平衡' },
  fan_youfeng: { name: '游風折扇', light: '扇擊連點', heavy: '扇風颶', special: '封穴扇', role: '控場' },
}

const ART_INFO: Record<string, { name: string; desc: string }> = {
  art_qinxing: { name: '擒星拿月', desc: '隔空取物、奪械、拉近目標' },
  art_lingyun: { name: '凌雲踏', desc: '短距位移、跳至高台、瞬移閃避' },
}

export function SkillSheet(): React.ReactElement | null {
  const { isSkillOpen, setSkillOpen, player, setEquippedMysticArt } = useGameStore()

  if (!isSkillOpen) return null

  const wA = WEAPON_INFO[player.equippedWeapons[0]] ?? null
  const wB = WEAPON_INFO[player.equippedWeapons[1]] ?? null

  return (
    <div style={BOTTOM_SHEET_STYLE}>
      <button style={CLOSE_BTN} onClick={() => setSkillOpen(false)}>✕</button>
      <div style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 10 }}>武學</div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        {[wA, wB].map((w, i) =>
          w ? (
            <div
              key={i}
              style={{
                flex: 1,
                background: player.activeWeaponSlot === i ? 'rgba(232,201,126,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${player.activeWeaponSlot === i ? '#e8c97e' : 'rgba(255,255,255,0.15)'}`,
                borderRadius: 8,
                padding: '8px 10px',
              }}
            >
              <div style={{ fontSize: 12, color: '#e8c97e', marginBottom: 4 }}>
                武器{i === 0 ? 'A' : 'B'}：{w.name}
                {player.activeWeaponSlot === i && (
                  <span style={{ color: '#4caf50', marginLeft: 4, fontSize: 10 }}>（使用中）</span>
                )}
              </div>
              <div style={{ fontSize: 10, color: '#bbb', lineHeight: 1.6 }}>
                輕擊：{w.light}<br />
                重擊：{w.heavy}<br />
                特技：{w.special}<br />
                標籤：{w.role}
              </div>
            </div>
          ) : null
        )}
      </div>

      <div style={{ fontSize: 13, color: '#e8c97e', marginBottom: 8 }}>已學奇術</div>
      {player.learnedMysticArts.length === 0 ? (
        <div style={{ color: '#666', fontSize: 11 }}>尚未習得任何奇術</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {player.learnedMysticArts.map(artId => {
            const info = ART_INFO[artId]
            const isEquipped = player.equippedMysticArt === artId
            return (
              <button
                key={artId}
                onClick={() => setEquippedMysticArt(artId)}
                style={{
                  background: isEquipped ? 'rgba(155,89,182,0.25)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isEquipped ? '#9b59b6' : 'rgba(255,255,255,0.15)'}`,
                  borderRadius: 8,
                  padding: '8px 12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: '#ddd',
                }}
              >
                <div style={{ fontSize: 12, color: isEquipped ? '#b067e8' : '#e8c97e' }}>
                  {isEquipped ? '★ ' : '☆ '}{info?.name ?? artId}
                </div>
                <div style={{ fontSize: 10, color: '#999' }}>{info?.desc}</div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Pause Sheet ──────────────────────────────────────────────────────────────
export function PauseSheet(): React.ReactElement | null {
  const { isPaused, setPaused } = useGameStore()

  if (!isPaused) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 40,
        fontFamily: 'serif',
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          background: 'rgba(15,10,8,0.98)',
          border: '1px solid rgba(232,201,126,0.4)',
          borderRadius: 16,
          padding: '32px 48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div style={{ fontSize: 20, color: '#e8c97e', marginBottom: 8 }}>暫停</div>
        <button
          onClick={() => setPaused(false)}
          style={{ ...pauseBtnStyle, background: 'rgba(76,175,80,0.3)', borderColor: '#4caf50' }}
        >
          繼續
        </button>
        <button
          onClick={() => {
            if (confirm('確定要重新開始嗎？')) window.location.reload()
          }}
          style={{ ...pauseBtnStyle, background: 'rgba(244,67,54,0.2)', borderColor: '#f44336' }}
        >
          重新開始
        </button>
      </div>
    </div>
  )
}

// ─── Toast Layer ──────────────────────────────────────────────────────────────
export function ToastLayer(): React.ReactElement {
  const { toasts } = useGameStore()

  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        pointerEvents: 'none',
        zIndex: 50,
        fontFamily: 'serif',
      }}
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          style={{
            background: 'rgba(0,0,0,0.8)',
            border: '1px solid rgba(232,201,126,0.5)',
            borderRadius: 20,
            padding: '6px 16px',
            color: '#e8c97e',
            fontSize: 12,
            whiteSpace: 'nowrap',
            animation: 'fadeInOut 2.5s ease',
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const optionBtnStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '10px 16px',
  background: 'rgba(232,201,126,0.1)',
  border: '1px solid rgba(232,201,126,0.4)',
  borderRadius: 8,
  color: '#e8c97e',
  fontSize: 13,
  cursor: 'pointer',
  fontFamily: 'serif',
  textAlign: 'left',
}

const tabBtnStyle: React.CSSProperties = {
  padding: '4px 12px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid',
  borderRadius: 16,
  fontSize: 11,
  cursor: 'pointer',
  fontFamily: 'serif',
}

const pauseBtnStyle: React.CSSProperties = {
  width: 160,
  padding: '12px 0',
  border: '1px solid',
  borderRadius: 8,
  fontSize: 14,
  cursor: 'pointer',
  fontFamily: 'serif',
  color: '#fff',
}
