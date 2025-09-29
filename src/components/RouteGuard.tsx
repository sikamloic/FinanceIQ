// Budget Douala - Protection des Routes
// I5.4 - Guard pour protéger l'accès aux pages

import type { ReactNode } from 'react'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import PinSetup from '../pages/PinSetup'
import PinUnlock from '../pages/PinUnlock'

interface RouteGuardProps {
  children: ReactNode
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const { isAuthenticated, hasPinSetup, login, setPinSetup } = useAuth()
  const [storedPinHash, setStoredPinHash] = useState<string>('')

  // Récupérer le hash PIN depuis les settings
  useEffect(() => {
    if (hasPinSetup) {
      getStoredPinHash().then(setStoredPinHash)
    }
  }, [hasPinSetup])

  // Si pas de PIN configuré → Setup
  if (!hasPinSetup) {
    return (
      <PinSetup
        onComplete={(pinHash: string) => {
          console.log('PIN configuré:', pinHash)
          setPinSetup(true)
          login() // Auto-login après setup
        }}
      />
    )
  }

  // Si PIN configuré mais pas authentifié → Unlock
  if (!isAuthenticated) {
    return (
      <PinUnlock
        storedPinHash={storedPinHash}
        onUnlock={login}
        onForgotPin={() => {
          // Reset PIN - retour au setup
          setPinSetup(false)
        }}
      />
    )
  }

  // Authentifié → Accès à l'app
  return <>{children}</>
}

// Récupérer le hash PIN stocké depuis IndexedDB
async function getStoredPinHash(): Promise<string> {
  try {
    const { db } = await import('../data/db')
    const settings = await db.settings.get('singleton')
    return settings?.pinHash || ''
  } catch (error) {
    console.error('Erreur récupération PIN hash:', error)
    // Fallback localStorage
    return localStorage.getItem('budget_douala_pin_hash') || ''
  }
}
