// Budget Douala - Hook Settings Management
// I1.4 - Settings Management

import { useState, useEffect, useCallback } from 'react'
import { db } from '../data/db'
import type { Settings } from '../types'
import { DEFAULT_SETTINGS } from '../types'

interface UseSettingsReturn {
  settings: Settings | null
  isLoading: boolean
  error: string | null
  updateSettings: (updates: Partial<Omit<Settings, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>
  resetToDefaults: () => Promise<void>
  refreshSettings: () => Promise<void>
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger les settings
  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const currentSettings = await db.settings.get('singleton')
      
      if (currentSettings) {
        setSettings(currentSettings)
      } else {
        // Si pas de settings, créer avec les valeurs par défaut
        const defaultSettings: Settings = {
          id: 'singleton',
          ...DEFAULT_SETTINGS,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        await db.settings.put(defaultSettings)
        setSettings(defaultSettings)
        
        console.log('⚙️ Settings par défaut créés')
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Mettre à jour les settings
  const updateSettings = useCallback(async (
    updates: Partial<Omit<Settings, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> => {
    try {
      setError(null)
      
      if (!settings) {
        throw new Error('Aucun settings à mettre à jour')
      }
      
      const updatedSettings: Settings = {
        ...settings,
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      await db.settings.put(updatedSettings)
      setSettings(updatedSettings)
      
      console.log('✅ Settings mis à jour:', updates)
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur de mise à jour'
      setError(errorMsg)
      throw new Error(errorMsg)
    }
  }, [settings])

  // Reset aux valeurs par défaut
  const resetToDefaults = useCallback(async (): Promise<void> => {
    try {
      setError(null)
      
      const defaultSettings: Settings = {
        id: 'singleton',
        ...DEFAULT_SETTINGS,
        createdAt: settings?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await db.settings.put(defaultSettings)
      setSettings(defaultSettings)
      
      console.log('🔄 Settings réinitialisés aux valeurs par défaut')
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur de réinitialisation'
      setError(errorMsg)
      throw new Error(errorMsg)
    }
  }, [settings?.createdAt])

  // Rafraîchir manuellement
  const refreshSettings = useCallback(async (): Promise<void> => {
    await loadSettings()
  }, [loadSettings])

  // Charger au montage
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    resetToDefaults,
    refreshSettings
  }
}

// Fonctions utilitaires pour calculs basés sur les settings
export function calculateRentFund(settings: Settings): number {
  return Math.round(settings.rentMonthly * (1 + settings.rentMarginPct / 100))
}

export function calculateEmergencyFund(settings: Settings): number {
  return Math.round(settings.salary * settings.salarySavePct / 100)
}

export function calculateTransportBudget(settings: Settings): number {
  return Math.round(settings.transportDaily * 21.7) // 21.7 jours ouvrés moyens
}
