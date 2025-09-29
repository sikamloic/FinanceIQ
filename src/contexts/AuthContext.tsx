// Budget Douala - Context Authentification PIN
// I5.4 - Protection Routes avec système auth

import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  hasPinSetup: boolean
  login: () => void
  logout: () => void
  setPinSetup: (hasPin: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hasPinSetup, setHasPinSetup] = useState(false)

  // Vérifier si un PIN est configuré au démarrage
  useEffect(() => {
    checkPinSetup()
  }, [])

  // Vérifier la présence d'un PIN en settings
  const checkPinSetup = async () => {
    try {
      // Vérifier dans les settings via IndexedDB
      const { db } = await import('../data/db')
      const settings = await db.settings.get('singleton')
      const hasPin = !!(settings?.pinHash)
      setHasPinSetup(hasPin)
      
      // Fallback localStorage pour compatibilité
      if (!hasPin) {
        const legacyPin = localStorage.getItem('budget_douala_pin_setup') === 'true'
        setHasPinSetup(legacyPin)
      }
    } catch (error) {
      console.error('Erreur vérification PIN setup:', error)
      // Fallback localStorage
      const hasPin = localStorage.getItem('budget_douala_pin_setup') === 'true'
      setHasPinSetup(hasPin)
    }
  }

  // Connexion réussie (PIN validé)
  const login = () => {
    setIsAuthenticated(true)
    // Session temporaire - expire au refresh
    sessionStorage.setItem('budget_douala_authenticated', 'true')
  }

  // Déconnexion
  const logout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('budget_douala_authenticated')
  }

  // Marquer PIN comme configuré
  const setPinSetup = async (hasPin: boolean) => {
    setHasPinSetup(hasPin)
    
    // Synchroniser avec localStorage pour compatibilité
    if (hasPin) {
      localStorage.setItem('budget_douala_pin_setup', 'true')
    } else {
      localStorage.removeItem('budget_douala_pin_setup')
      localStorage.removeItem('budget_douala_pin_hash')
      
      // Nettoyer aussi les settings IndexedDB
      try {
        const { db } = await import('../data/db')
        const settings = await db.settings.get('singleton')
        if (settings) {
          await db.settings.put({
            ...settings,
            pinHash: undefined
          })
        }
      } catch (error) {
        console.error('Erreur nettoyage PIN settings:', error)
      }
    }
  }

  // Vérifier session existante au démarrage
  useEffect(() => {
    const isSessionActive = sessionStorage.getItem('budget_douala_authenticated') === 'true'
    if (isSessionActive && hasPinSetup) {
      setIsAuthenticated(true)
    }
  }, [hasPinSetup])

  const value = {
    isAuthenticated,
    hasPinSetup,
    login,
    logout,
    setPinSetup
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook pour utiliser le context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
