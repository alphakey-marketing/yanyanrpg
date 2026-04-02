import React from 'react'
import { useGameStore } from '../store/useGameStore'

export default function MobileHUD(): React.ReactElement {
  const { player, isQuestOpen, isInventoryOpen, isSkillOpen, isPaused } = useGameStore()
  const setQuestOpen = useGameStore(s => s.setQuestOpen)
  const setInventoryOpen = useGameStore(s => s.setInventoryOpen)
  const setSkillOpen = useGameStore(s => s.setSkillOpen)
  const setPaused = useGameStore(s => s.setPaused)

  const hpPct = (player.hp / player.maxHp) * 100
  const hpColor = hpPct > 60 ? '#4caf50' : hpPct > 30 ? '#ff9800' : '#f44336'

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        pointerEvents: 'none',
        zIndex: 10,
        fontFamily: 'serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: '6px 10px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <StatBar label="HP" value={player.hp} max={player.maxHp} color={hpColor} />
          <StatBar label="內力" value={player.internalEnergy} max={player.maxInternalEnergy} color="#9b59b6" />
          <StatBar label="體力" value={player.stamina} max={player.maxStamina} color="#2980b9" />
        </div>

        <div style={{ display: 'flex', gap: 6, pointerEvents: 'auto' }}>
          <HUDIconBtn label="任務" active={isQuestOpen} onClick={() => setQuestOpen(!isQuestOpen)} />
          <HUDIconBtn label="背包" active={isInventoryOpen} onClick={() => setInventoryOpen(!isInventoryOpen)} />
          <HUDIconBtn label="武學" active={isSkillOpen} onClick={() => setSkillOpen(!isSkillOpen)} />
          <HUDIconBtn label="⏸" active={isPaused} onClick={() => setPaused(!isPaused)} />
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 140,
          left: 10,
          background: 'rgba(0,0,0,0.5)',
          borderRadius: 6,
          padding: '4px 8px',
          color: '#e8c97e',
          fontSize: 11,
          pointerEvents: 'none',
        }}
      >
        <div>
          {player.activeWeaponSlot === 0 ? '▶ ' : '  '}
          {WEAPON_LABELS[player.equippedWeapons[0]] ?? player.equippedWeapons[0]}
        </div>
        <div>
          {player.activeWeaponSlot === 1 ? '▶ ' : '  '}
          {WEAPON_LABELS[player.equippedWeapons[1]] ?? player.equippedWeapons[1]}
        </div>
        {player.equippedMysticArt && (
          <div style={{ color: '#9b59b6', marginTop: 2 }}>
            ★ {ART_LABELS[player.equippedMysticArt] ?? player.equippedMysticArt}
          </div>
        )}
      </div>
    </div>
  )
}

function StatBar({
  label,
  value,
  max,
  color,
}: {
  label: string
  value: number
  max: number
  color: string
}): React.ReactElement {
  const pct = Math.max(0, (value / max) * 100)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ color: '#ccc', fontSize: 10, width: 22, textAlign: 'right' }}>{label}</span>
      <div style={{ width: 80, height: 7, background: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.2s', borderRadius: 4 }} />
      </div>
      <span style={{ color: '#aaa', fontSize: 9 }}>{Math.ceil(value)}/{max}</span>
    </div>
  )
}

function HUDIconBtn({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}): React.ReactElement {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'rgba(232,201,126,0.3)' : 'rgba(0,0,0,0.5)',
        border: `1px solid ${active ? '#e8c97e' : 'rgba(255,255,255,0.3)'}`,
        borderRadius: 4,
        color: active ? '#e8c97e' : '#ccc',
        fontSize: 11,
        padding: '2px 6px',
        cursor: 'pointer',
        fontFamily: 'serif',
      }}
    >
      {label}
    </button>
  )
}

const WEAPON_LABELS: Record<string, string> = {
  sword_qingfeng: '青鋒單劍',
  fan_youfeng: '游風折扇',
}

const ART_LABELS: Record<string, string> = {
  art_qinxing: '擒星拿月',
  art_lingyun: '凌雲踏',
}
