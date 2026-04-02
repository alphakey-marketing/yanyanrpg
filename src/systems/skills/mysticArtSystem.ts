import mysticArtsData from '../../data/mysticArts.json'
import type { MysticArtData } from '../../types/game'
import { emit, Events } from '../../core/eventBus'
import { consumeEnergy } from '../combat/staminaSystem'
import Enemy from '../../entities/Enemy'
import Phaser from 'phaser'

const arts: MysticArtData[] = mysticArtsData as MysticArtData[]
const cooldownMap: Record<string, number> = {}

export function getMysticArtById(id: string): MysticArtData | undefined {
  return arts.find(a => a.id === id)
}

export function isOnCooldown(artId: string): boolean {
  const cd = cooldownMap[artId]
  if (!cd) return false
  return Date.now() < cd
}

export function getRemainingCooldown(artId: string): number {
  const cd = cooldownMap[artId]
  if (!cd) return 0
  return Math.max(0, cd - Date.now())
}

export function useMysticArt(
  artId: string,
  player: Phaser.Physics.Arcade.Sprite,
  target: Enemy | null,
  scene: Phaser.Scene,
  context: 'exploration' | 'combat'
): boolean {
  const art = getMysticArtById(artId)
  if (!art) return false
  if (!art.uses.includes(context)) return false
  if (isOnCooldown(artId)) {
    emit(Events.SHOW_TOAST, `奇術冷卻中`)
    return false
  }
  if (!consumeEnergy(art.cost)) {
    emit(Events.SHOW_TOAST, `內力不足`)
    return false
  }

  cooldownMap[artId] = Date.now() + art.cooldown

  if (artId === 'art_qinxing') {
    applyQinXing(player, target, scene)
  } else if (artId === 'art_lingyun') {
    applyLingYun(player, scene)
  }

  emit(Events.SHOW_TOAST, `施展：${art.name}`)
  return true
}

function applyQinXing(
  player: Phaser.Physics.Arcade.Sprite,
  target: Enemy | null,
  scene: Phaser.Scene
): void {
  if (target && target.isAlive()) {
    const dx = player.x - target.sprite.x
    const dy = player.y - target.sprite.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist > 0) {
      target.sprite.setPosition(
        target.sprite.x + (dx / dist) * 80,
        target.sprite.y + (dy / dist) * 80
      )
    }
    target.sprite.setTint(0x9b59b6)
    scene.time.delayedCall(300, () => target.sprite.clearTint())
  }
  const gfx = scene.add.graphics()
  gfx.lineStyle(3, 0x9b59b6, 1)
  gfx.lineBetween(
    player.x, player.y,
    target ? target.sprite.x : player.x + 100,
    target ? target.sprite.y : player.y
  )
  scene.tweens.add({ targets: gfx, alpha: 0, duration: 400, onComplete: () => gfx.destroy() })
}

function applyLingYun(
  player: Phaser.Physics.Arcade.Sprite,
  scene: Phaser.Scene
): void {
  const body = player.body as Phaser.Physics.Arcade.Body
  const vx = body.velocity.x
  const vy = body.velocity.y
  const angle = Math.atan2(vy || -1, vx)
  player.setVelocity(Math.cos(angle) * 350, Math.sin(angle) * 350)
  player.setTint(0xe8c97e)

  for (let i = 0; i < 3; i++) {
    scene.time.delayedCall(i * 50, () => {
      const ghost = scene.add.image(player.x, player.y, 'player').setAlpha(0.4).setDepth(50)
      scene.tweens.add({ targets: ghost, alpha: 0, duration: 300, onComplete: () => ghost.destroy() })
    })
  }

  scene.time.delayedCall(200, () => {
    player.clearTint()
    player.setVelocity(0, 0)
  })
}
