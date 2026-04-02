import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './ui/App'
import { createGame } from './core/game'

// Mount React UI
const uiRoot = document.getElementById('ui-root')!
ReactDOM.createRoot(uiRoot).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Launch Phaser after a short tick to ensure DOM is ready
setTimeout(() => {
  createGame()
}, 0)
