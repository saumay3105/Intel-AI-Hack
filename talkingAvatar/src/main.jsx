import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { SpeakingProvider } from './contexts/AvatarState'

ReactDOM.createRoot(document.getElementById('root')).render(
  <SpeakingProvider>
    <App />
  </SpeakingProvider>,
)
