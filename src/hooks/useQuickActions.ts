// Budget Douala - Hook Quick Actions
// I3.1 - Bouton Quick Add Simple

import { useState, useCallback } from 'react'
import { useTransactions } from './useTransactions'
import { useCategories } from './useCategories'

interface QuickAction {
  id: string
  categoryId: string
  categoryName: string
  amount: number
  icon: string
  note: string
  color: 'primary' | 'success' | 'danger'
}

interface UseQuickActionsReturn {
  quickActions: QuickAction[]
  isLoading: boolean
  error: string | null
  executeQuickAction: (actionId: string) => Promise<string>
  getActionById: (actionId: string) => QuickAction | undefined
  refreshActions: () => Promise<void>
}

export function useQuickActions(): UseQuickActionsReturn {
  const { addTransaction } = useTransactions()
  const { categories } = useCategories()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Actions rapides prédéfinies pour Douala
  const quickActions: QuickAction[] = [
    {
      id: 'transport_1500',
      categoryId: 'cat_transport',
      categoryName: 'Transport',
      amount: 1500,
      icon: '🚌',
      note: 'Trajet quotidien',
      color: 'primary'
    },
    {
      id: 'food_5000',
      categoryId: 'cat_alimentation',
      categoryName: 'Alimentation',
      amount: 5000,
      icon: '🍽️',
      note: 'Repas/courses',
      color: 'success'
    },
    {
      id: 'data_2500',
      categoryId: 'cat_data',
      categoryName: 'Data',
      amount: 2500,
      icon: '📱',
      note: 'Internet mobile',
      color: 'danger'
    }
  ]

  // Exécuter une action rapide
  const executeQuickAction = useCallback(async (actionId: string): Promise<string> => {
    try {
      setIsLoading(true)
      setError(null)

      const action = quickActions.find(a => a.id === actionId)
      if (!action) {
        throw new Error(`Action rapide '${actionId}' introuvable`)
      }

      // Vérifier que la catégorie existe
      const category = categories.find(c => c.id === action.categoryId)
      if (!category) {
        throw new Error(`Catégorie '${action.categoryId}' introuvable`)
      }

      // Créer la transaction
      const transaction = {
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        amount: action.amount,
        categoryId: action.categoryId,
        note: action.note,
        type: 'expense' as const
      }

      // Ajouter via le hook transactions
      const transactionId = await addTransaction(transaction)

      console.log(`⚡ Quick Action: ${action.categoryName} ${action.amount} XAF`)
      return transactionId

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur action rapide'
      setError(errorMsg)
      throw new Error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }, [addTransaction, categories, quickActions])

  // Récupérer une action par ID
  const getActionById = useCallback((actionId: string): QuickAction | undefined => {
    return quickActions.find(a => a.id === actionId)
  }, [quickActions])

  // Rafraîchir (pour compatibilité future)
  const refreshActions = useCallback(async (): Promise<void> => {
    // Pour l'instant, les actions sont statiques
    // En I4, on pourrait les charger depuis les settings utilisateur
  }, [])

  return {
    quickActions,
    isLoading,
    error,
    executeQuickAction,
    getActionById,
    refreshActions
  }
}
