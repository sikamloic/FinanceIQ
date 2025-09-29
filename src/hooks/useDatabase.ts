// Budget Douala - Hook Database Test
// I1.1 - IndexedDB Setup (Dexie)

import { useState, useEffect } from 'react'
import { initializeDB, getDatabaseInfo } from '../data/db'

interface DatabaseStatus {
  isInitialized: boolean
  isLoading: boolean
  error: string | null
  info: {
    name: string
    version: number
    tables: string[]
    transactionCount: number
    categoryCount: number
    settingsExists: boolean
  } | null
}

export function useDatabase(): DatabaseStatus {
  const [status, setStatus] = useState<DatabaseStatus>({
    isInitialized: false,
    isLoading: true,
    error: null,
    info: null
  })

  useEffect(() => {
    async function setupDatabase() {
      try {
        setStatus(prev => ({ ...prev, isLoading: true, error: null }))
        
        // Initialise la DB
        await initializeDB()
        
        // Récupère les infos
        const info = await getDatabaseInfo()
        
        setStatus({
          isInitialized: true,
          isLoading: false,
          error: null,
          info
        })
        
      } catch (error) {
        setStatus({
          isInitialized: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          info: null
        })
      }
    }

    setupDatabase()
  }, [])

  return status
}
