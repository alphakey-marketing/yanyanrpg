import Phaser from 'phaser'
import Enemy from '../../entities/Enemy'
import { useGameStore } from '../../ui/store/useGameStore'
import weaponsData from '../../data/weapons.json'
import type { WeaponData } from '../../types/game'
import { emit, Events } from '../../core/eventBus'
import { STAMINA_COST_HEAVY } from '../../core/constants'
import { consumeStamina } from './staminaSystem'
import { checkQuestCompletion } from '../quest/questSystem'
import { setFlag } from '../quest/flagSystem'
import { isInvincible } from './dodgeSystem'

const weapons: WeaponData[] = weaponsData as WeaponData[]

function getActiveWeapon(): WeaponData | null {
  const store = useGameStore.getState()
  const slot = store.player.activeWeaponSlot
  const weaponId = store.player.equippedWeapons[slot]
  return weapons.find(w => w.id === weaponId) ?? null
}

export function performLightAttack(
  player: Phaser.Physics.Arcade.Sprite,
  target: Enemy | null,
  scene: Phaser.Scene
): void {
  const weapon = getActiveWeapon()
  if (!weapon || !target || !target.isAlive()) return

  const dist = Phaser.Math.Distance.Between(player.x, player.y, target.sprite.x, target.sprite.y)
  if (dist > 80) return

  const damage = weapon.stats.attack + useGameStore.getState().player.stats.attack
  const killed = target.takeDamage(damage)

  spawnDamageText(scene, target.sprite.x, target.sprite.y - 20, damage, false)
  scene.cameras.main.shake(60, 0.002)

  if (killed) onEnemyKilled(target)
}

export function performHeavyAttack(
  player: Phaser.Physics.Arcade.Sprite,
  target: Enemy | null,
  scene: Phaser.Scene
): void {
  const weapon = getActiveWeapon()
  if (!weapon || !target || !target.isAlive()) return
  if (!consumeStamina(STAMINA_COST_HEAVY)) return

  const dist = Phaser.Math.Distance.Between(player.x, player.y, target.sprite.x, target.sprite.y)
  if (dist > 100) return

  const damage = Math.floor((weapon.stats.attack + useGameStore.getState().player.stats.attack) * 1.8)
  const killed = target.takeDamage(damage)

  spawnDamageText(scene, target.sprite.x, target.sprite.y - 20, damage, true)
  scene.cameras.main.shake(100, 0.005)

  if (killed) onEnemyKilled(target)
}

export function applyDamageToPlayer(damage: number): void {
  if (isInvincible()) return
  const store = useGameStore.getState()
  const reduced = Math.max(1, damage - store.player.stats.defense)
  const newHp = Math.max(0, store.player.hp - reduced)
  store.setPlayerHp(newHp)
  emit(Events.PLAYER_HP_CHANGE, newHp, store.player.maxHp)
}

function onEnemyKilled(enemy: Enemy): void {
  emit(Events.ENEMY_KILLED, enemy.data.id)
  checkQuestCompletion('kill', enemy.data.id, 1)
  if (enemy.data.killFlag) {
    setFlag(enemy.data.killFlag)
  }
  import('../loot/lootSystem').then(({ rollLoot }) => rollLoot(enemy.data.dropTableId))
}

function spawnDamageText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  damage: number,
  heavy: boolean
): void {
  const color = heavy ? '#ff6b6b' : '#ffffff'
  const text = scene.add.text(x, y, `-${damage}`, {
    fontSize: heavy ? '18px' : '14px',
    color,
    fontFamily: 'serif',
    stroke: '#000000',
    strokeThickness: 3,
  }).setDepth(200)

  scene.tweens.add({
    targets: text,
    y: y - 40,
    alpha: 0,
    duration: 800,
    onComplete: () => text.destroy(),
  })
}
