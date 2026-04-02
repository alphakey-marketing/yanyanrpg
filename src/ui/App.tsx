import React, { useEffect } from 'react'
import { useGameStore } from './store/useGameStore'
import { on, off, Events } from '../core/eventBus'
import MobileHUD from './components/MobileHUD'
import {
  DialogueSheet,
  QuestSheet,
  InventorySheet,
  SkillSheet,
  PauseSheet,
  ToastLayer,
} from './components/Sheets'

export default function App(): React.ReactElement {
  const { openDialogue, addToast } = useGameStore()

  useEffect(() => {
    const handleDialogue = (...args: unknown[]) => {
      const data = args[0] as Parameters<typeof openDialogue>[0]
      openDialogue(data)
    }

    const handleToast = (...args: unknown[]) => {
      addToast(args[0] as string)
    }

    on(Events.OPEN_DIALOGUE, handleDialogue)
    on(Events.SHOW_TOAST, handleToast)

    return () => {
      off(Events.OPEN_DIALOGUE, handleDialogue)
      off(Events.SHOW_TOAST, handleToast)
    }
  }, [openDialogue, addToast])

  return (
    <div
      id="ui-overlay"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <MobileHUD />
      <DialogueSheet />
      <QuestSheet />
      <InventorySheet />
      <SkillSheet />
      <PauseSheet />
      <ToastLayer />

      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-8px); }
          15% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        * { box-sizing: border-box; }
        button { font-family: serif; }
      `}</style>
    </div>
  )
}
