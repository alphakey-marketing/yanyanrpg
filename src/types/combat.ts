export type AttackType = 'light' | 'heavy' | 'special' | 'switchSkill' | 'mysticArt'

export type DamageEvent = {
  attackerId: string
  targetId: string
  attackType: AttackType
  baseDamage: number
  breakDamage: number
  isCritical: boolean
  timestamp: number
}

export type CombatState = {
  inCombat: boolean
  lockedTargetId: string | null
  lastAttackTime: number
  comboCount: number
  isInvincible: boolean
  dodgeCooldown: number
  mysticArtCooldowns: Record<string, number>
}

export type HitResult = {
  damage: number
  breakDamage: number
  staggered: boolean
  killed: boolean
}

export type EnemyAIState = 'idle' | 'patrol' | 'aggro' | 'attack' | 'stagger' | 'dead'
