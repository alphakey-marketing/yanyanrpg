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
  // FIX Bug #5: store key references once; never call addKeys() per frame.
  private keys: Record<string, Phaser.Input.Keyboard.Key> = {}
  // FIX Q1: guard against entrance firing scene:navigate every frame.
  private transitioning = false
  // Grace period after scene load — prevents spawning too close to an entrance
  // from immediately triggering a back-transition on the first update frame.
  private spawnGraceElapsed = 0
  private static readonly SPAWN_GRACE_MS = 500

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

    // FIX Bug #5: register keyboard keys once in the constructor.
    if (scene.input.keyboard) {
      this.keys = scene.input.keyboard.addKeys('W,A,S,D,Z,X,C,V,SPACE') as Record<string, Phaser.Input.Keyboard.Key>
    }
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
    this.spawnGraceElapsed += delta
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
    // FIX Bug #5: use this.keys set in constructor; never call addKeys() here.
    const keys = this.keys
    if (!keys || Object.keys(keys).length === 0) return
    if (isDodging()) return

    let vx = 0
    let vy = 0
    if (keys['A']?.isDown) vx -= PLAYER_SPEED
    if (keys['D']?.isDown) vx += PLAYER_SPEED
    if (keys['W']?.isDown) vy -= PLAYER_SPEED
    if (keys['S']?.isDown) vy += PLAYER_SPEED

    // FIX Bug #2: always call setVelocity (even 0,0) so the sprite
    // stops immediately when no key is held instead of sliding forever.
    this.sprite.setVelocity(vx, vy)

    if (Phaser.Input.Keyboard.JustDown(keys['Z']!)) this.doLightAttack()
    if (Phaser.Input.Keyboard.JustDown(keys['X']!)) this.doHeavyAttack()
    if (Phaser.Input.Keyboard.JustDown(keys['C']!)) this.doDodge()
    if (Phaser.Input.Keyboard.JustDown(keys['V']!)) this.doMysticArt()
    if (Phaser.Input.Keyboard.JustDown(keys['SPACE']!)) switchWeapon()
  }

  checkInteractableInteraction(interactables: Interactable[], sceneWidth: number): void {
    // FIX Q1: if a transition is already in flight, skip all further checks
    // so entrance nodes do not spam scene:navigate every frame.
    if (this.transitioning) return

    // Grace period after spawn — prevents an entrance that is close to the
    // spawn point from immediately firing a back-transition on the first frame.
    if (this.spawnGraceElapsed < Player.SPAWN_GRACE_MS) return

    interactables.forEach(item => {
      if (this.transitioning) return
      const dist = Phaser.Math.Distance.Between(
        this.sprite.x,
        this.sprite.y,
        item.sprite.x,
        item.sprite.y
      )
      // Increased radius to 80px; for right-side entrances also auto-trigger
      // when the player reaches the right screen edge (within 30px).
      const isRightEdge =
        item.node.type === 'entrance' &&
        item.sprite.x > sceneWidth - 80 &&
        this.sprite.x > sceneWidth - 30
      const isLeftEdge =
        item.node.type === 'entrance' &&
        item.sprite.x < 80 &&
        this.sprite.x < 30

      if ((dist < 80 || isRightEdge || isLeftEdge) && item.canInteract()) {
        if (item.node.type === 'entrance') {
          this.transitioning = true
        }
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
