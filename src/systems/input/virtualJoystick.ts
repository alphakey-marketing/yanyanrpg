import Phaser from 'phaser'
import { PLAYER_SPEED, JOYSTICK_RADIUS, GAME_WIDTH } from '../../core/constants'

export interface JoystickOutput {
  dx: number
  dy: number
  active: boolean
}

export default class VirtualJoystick {
  private scene: Phaser.Scene
  private base: Phaser.GameObjects.Image
  private thumb: Phaser.GameObjects.Image
  private pointer: Phaser.Input.Pointer | null = null
  private startX = 0
  private startY = 0
  private output: JoystickOutput = { dx: 0, dy: 0, active: false }

  constructor(scene: Phaser.Scene) {
    this.scene = scene

    this.base = scene.add
      .image(0, 0, 'joystick_base')
      .setAlpha(0)
      .setScrollFactor(0)
      .setDepth(100)

    this.thumb = scene.add
      .image(0, 0, 'joystick_thumb')
      .setAlpha(0)
      .setScrollFactor(0)
      .setDepth(101)

    scene.input.on('pointerdown', this.onPointerDown, this)
    scene.input.on('pointermove', this.onPointerMove, this)
    scene.input.on('pointerup', this.onPointerUp, this)
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.pointer) return
    if (pointer.x > GAME_WIDTH / 2) return

    this.pointer = pointer
    this.startX = pointer.x
    this.startY = pointer.y
    this.base.setPosition(pointer.x, pointer.y).setAlpha(0.6)
    this.thumb.setPosition(pointer.x, pointer.y).setAlpha(0.9)
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.pointer || pointer.id !== this.pointer.id) return

    const dx = pointer.x - this.startX
    const dy = pointer.y - this.startY
    const dist = Math.sqrt(dx * dx + dy * dy)
    const clamped = Math.min(dist, JOYSTICK_RADIUS)
    const angle = Math.atan2(dy, dx)

    this.thumb.setPosition(
      this.startX + Math.cos(angle) * clamped,
      this.startY + Math.sin(angle) * clamped
    )

    this.output.dx = dx / JOYSTICK_RADIUS
    this.output.dy = dy / JOYSTICK_RADIUS
    this.output.active = dist > 10
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    if (!this.pointer || pointer.id !== this.pointer.id) return
    this.pointer = null
    this.base.setAlpha(0)
    this.thumb.setAlpha(0)
    this.output = { dx: 0, dy: 0, active: false }
  }

  getOutput(): JoystickOutput {
    return { ...this.output }
  }

  applyToSprite(sprite: Phaser.Physics.Arcade.Sprite): void {
    const { dx, dy, active } = this.output
    if (!active) {
      sprite.setVelocity(0, 0)
      return
    }
    sprite.setVelocity(dx * PLAYER_SPEED, dy * PLAYER_SPEED)
  }

  destroy(): void {
    this.scene.input.off('pointerdown', this.onPointerDown, this)
    this.scene.input.off('pointermove', this.onPointerMove, this)
    this.scene.input.off('pointerup', this.onPointerUp, this)
    this.base.destroy()
    this.thumb.destroy()
  }
}
