import Phaser from 'phaser'

type EventCallback = (...args: unknown[]) => void

// Simple typed event bus for Phaser ↔ React communication
class EventBus extends Phaser.Events.EventEmitter {
  private static _instance: EventBus

  static get instance(): EventBus {
    if (!EventBus._instance) {
      EventBus._instance = new EventBus()
    }
    return EventBus._instance
  }
}

export const eventBus = EventBus.instance

// Typed emit/on helpers
export const Events = {
  // Phaser → React
  PLAYER_HP_CHANGE: 'player:hp_change',
  PLAYER_STAMINA_CHANGE: 'player:stamina_change',
  PLAYER_ENERGY_CHANGE: 'player:energy_change',
  PLAYER_POSITION_CHANGE: 'player:position_change',
  OPEN_DIALOGUE: 'ui:open_dialogue',
  CLOSE_DIALOGUE: 'ui:close_dialogue',
  QUEST_UPDATE: 'quest:update',
  SCENE_CHANGED: 'scene:changed',
  SHOW_TOAST: 'ui:show_toast',
  ENEMY_KILLED: 'combat:enemy_killed',
  ITEM_COLLECTED: 'inventory:item_collected',
  MYSTIC_ART_UNLOCKED: 'skill:mystic_art_unlocked',
  COMBAT_START: 'combat:start',
  COMBAT_END: 'combat:end',
  NODE_TRIGGERED: 'map:node_triggered',

  // React → Phaser
  DIALOGUE_CHOICE: 'dialogue:choice',
  USE_MYSTIC_ART: 'skill:use_mystic_art',
  SWITCH_WEAPON: 'skill:switch_weapon',
  PAUSE_GAME: 'game:pause',
  RESUME_GAME: 'game:resume',
} as const

export type GameEvent = typeof Events[keyof typeof Events]

export function emit(event: GameEvent, ...args: unknown[]): void {
  eventBus.emit(event, ...args)
}

export function on(event: GameEvent, callback: EventCallback): void {
  eventBus.on(event, callback)
}

export function off(event: GameEvent, callback: EventCallback): void {
  eventBus.off(event, callback)
}
