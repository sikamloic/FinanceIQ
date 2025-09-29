import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/theme.css'
import App from './App.tsx'
import { setupResetUtils } from './utils/resetDatabase'

// Configurer les utilitaires de reset pour la console
setupResetUtils()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
