import Phaser from 'phaser'
import {
  PLAYER_SPEED,
  LIGHT_ATTACK_COOLDOWN,
  HEAVY_ATTACK_COOLDOWN,
  DODGE_COOLDOWN,
  GAME_WIDTH,
} from '../core/constants'
import { emit, Events } from '../core/eventBus'
import VirtualJoystick from '../systems/input/virtualJoystick'
import TouchInputSystem from '../systems/input/touchInputSystem'
import { performLightAttack, performHeavyAttack } from '../systems/combat/combatSystem'
import { attemptDodge, isDodging } from '../systems/combat/dodgeSystem'
import { switchWeapon } from '../systems/skills/weaponSystem'
import { useMysticArt } from '../systems/skills/mysticArtSystem'
import { findNearestEnemy, updateLockIndicator } from '../systems/combat/lockOnSystem'
import { updateStamina, updateInternalEnergy } from '../systems/combat/staminaSystem'
import Enemy from './Enemy'
import Interactable from './Interactable'
import { useGameStore } from '../ui/store/useGameStore'

const GAME_HEIGHT = 450

export default class Player {
  sprite: Phaser.Physics.Arcade.Sprite
  private joystick: VirtualJoystick
  private touchInput: TouchInputSystem
  private lockedTarget: Enemy | null = null
  private lockIndicator: Phaser.GameObjects.Arc
  private lastLightAttack = 0
  private lastHeavyAttack = 0
  private lastDodge = 0
  private enemies: Enemy[] = []
  private scene: Phaser.Scene

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene
    this.sprite = scene.physics.add.sprite(x, y, 'player')
    this.sprite.setCollideWorldBounds(true)
    this.sprite.setDepth(15)
    this.sprite.setDisplaySize(28, 28)

    this.lockIndicator = scene.add
      .arc(0, 0, 16, 0, 360, false, 0xffff00, 0.6)
      .setVisible(false)
      .setDepth(14)
      .setScrollFactor(1)

    this.joystick = new VirtualJoystick(scene)
    this.touchInput = new TouchInputSystem(scene, this.buildButtonConfigs())

    scene.input.keyboard?.addKeys('W,A,S,D,Z,X,C,V,SPACE')
  }

  private buildButtonConfigs() {
    const BW = GAME_WIDTH
    const BH = GAME_HEIGHT
    return [
      {
        key: 'light',
        label: '輕擊',
        texture: 'btn_light',
        x: BW - 56,
        y: BH - 56,
        onTap: () => this.doLightAttack(),
      },
      {
        key: 'heavy',
        label: '重擊',
        texture: 'btn_heavy',
        x: BW - 120,
        y: BH - 80,
        onTap: () => this.doHeavyAttack(),
      },
      {
        key: 'dodge',
        label: '閃避',
        texture: 'btn_dodge',
        x: BW - 180,
        y: BH - 80,
        onTap: () => this.doDodge(),
      },
      {
        key: 'mystic',
        label: '奇術',
        texture: 'btn_mystic',
        x: BW - 60,
        y: BH - 130,
        onTap: () => this.doMysticArt(),
      },
      {
        key: 'switch',
        label: '換武',
        texture: 'btn_switch',
        x: BW - 120,
        y: BH - 140,
        onTap: () => switchWeapon(),
      },
    ]
  }

  setEnemies(enemies: Enemy[]): void {
    this.enemies = enemies
  }

  private doLightAttack(): void {
    const now = Date.now()
    if (now - this.lastLightAttack < LIGHT_ATTACK_COOLDOWN) return
    this.lastLightAttack = now
    this.updateLockOn()
    performLightAttack(this.sprite, this.lockedTarget, this.scene)
  }

  private doHeavyAttack(): void {
    const now = Date.now()
    if (now - this.lastHeavyAttack < HEAVY_ATTACK_COOLDOWN) return
    this.lastHeavyAttack = now
    this.updateLockOn()
    performHeavyAttack(this.sprite, this.lockedTarget, this.scene)
  }

  private doDodge(): void {
    const now = Date.now()
    if (now - this.lastDodge < DODGE_COOLDOWN) return
    this.lastDodge = now
    const joy = this.joystick.getOutput()
    const dx = joy.active ? joy.dx : 0
    const dy = joy.active ? joy.dy : -1
    attemptDodge(this.sprite, dx, dy, this.scene)
  }

  private doMysticArt(): void {
    const store = useGameStore.getState()
    const artId = store.player.equippedMysticArt
    if (!artId) {
      emit(Events.SHOW_TOAST, '未裝備奇術')
      return
    }
    this.updateLockOn()
    const hasEnemies = this.enemies.some(e => e.isAlive())
    const context = hasEnemies ? 'combat' : 'exploration'
    useMysticArt(artId, this.sprite, this.lockedTarget, this.scene, context)
  }

  private updateLockOn(): void {
    this.lockedTarget = findNearestEnemy(this.sprite, this.enemies)
    updateLockIndicator(this.scene, this.lockedTarget, this.lockIndicator)
  }

  update(delta: number): void {
    this.handleKeyboardInput()
    if (!isDodging()) {
      this.joystick.applyToSprite(this.sprite)
    }

    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    if (body.velocity.length() > PLAYER_SPEED && !isDodging()) {
      body.velocity.normalize().scale(PLAYER_SPEED)
    }

    updateStamina(delta)
    updateInternalEnergy(delta)

    emit(Events.PLAYER_POSITION_CHANGE, this.sprite.x, this.sprite.y)

    if (this.lockedTarget) {
      updateLockIndicator(this.scene, this.lockedTarget, this.lockIndicator)
    }
  }

  private handleKeyboardInput(): void {
    const kb = this.scene.input.keyboard
    if (!kb) return

    const keys = kb.addKeys('W,A,S,D,Z,X,C,V,SPACE') as Record<string, Phaser.Input.Keyboard.Key>
    if (isDodging()) return

    let vx = 0
    let vy = 0
    if (keys['A']?.isDown) vx -= PLAYER_SPEED
    if (keys['D']?.isDown) vx += PLAYER_SPEED
    if (keys['W']?.isDown) vy -= PLAYER_SPEED
    if (keys['S']?.isDown) vy += PLAYER_SPEED

    if (vx !== 0 || vy !== 0) {
      this.sprite.setVelocity(vx, vy)
    }

    if (Phaser.Input.Keyboard.JustDown(keys['Z']!)) this.doLightAttack()
    if (Phaser.Input.Keyboard.JustDown(keys['X']!)) this.doHeavyAttack()
    if (Phaser.Input.Keyboard.JustDown(keys['C']!)) this.doDodge()
    if (Phaser.Input.Keyboard.JustDown(keys['V']!)) this.doMysticArt()
    if (Phaser.Input.Keyboard.JustDown(keys['SPACE']!)) switchWeapon()
  }

  checkInteractableInteraction(interactables: Interactable[]): void {
    interactables.forEach(item => {
      const dist = Phaser.Math.Distance.Between(
        this.sprite.x,
        this.sprite.y,
        item.sprite.x,
        item.sprite.y
      )
      if (dist < 60 && item.canInteract()) {
        item.interact(this.scene)
      }
    })
  }

  destroy(): void {
    this.joystick.destroy()
    this.touchInput.destroy()
    this.sprite.destroy()
    this.lockIndicator.destroy()
  }
}
