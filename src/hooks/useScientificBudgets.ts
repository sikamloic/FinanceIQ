// Hook pour les budgets scientifiques
// Utilise les budgets configurés dans Settings + transactions réelles

import { useState, useEffect, useMemo } from 'react'
import { useTransactions } from './useTransactions'
import { db } from '../data/db'
import { BUDGET_RULES } from '../types/budgetRules'
import { getCurrentMonthDouala } from '../utils/format'

export interface ScientificBudgetItem {
  categoryId: string
  categoryName: string
  budgeted: number
  spent: number
  remaining: number
  usage: number // Pourcentage utilisé (0-100+)
  status: 'ok' | 'warning' | 'danger'
  color: string
  isEssential: boolean
}

interface UseScientificBudgetsReturn {
  budgets: ScientificBudgetItem[]
  totalBudgeted: number
  totalSpent: number
  totalRemaining: number
  isLoading: boolean
  error: string | null
  currentMonth: string
}

export function useScientificBudgets(month?: string): UseScientificBudgetsReturn {
  const { transactions, isLoading: transactionsLoading } = useTransactions()
  const [scientificBudgets, setScientificBudgets] = useState<Record<string, number>>({})
  const [isLoadingBudgets, setIsLoadingBudgets] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentMonth = month || getCurrentMonthDouala()

  // Charger les budgets scientifiques depuis IndexedDB
  useEffect(() => {
    const loadScientificBudgets = async () => {
      try {
        setIsLoadingBudgets(true)
        const settings = await db.settings.get('singleton')
        
        if (settings?.scientificBudgets) {
          setScientificBudgets(settings.scientificBudgets)
        } else {
          // Pas de budgets configurés
          setScientificBudgets({})
        }
      } catch (err) {
        console.error('Erreur chargement budgets scientifiques:', err)
        setError('Erreur lors du chargement des budgets')
      } finally {
        setIsLoadingBudgets(false)
      }
    }

    loadScientificBudgets()
  }, [])

  // Calculer les budgets avec les dépenses réelles
  const budgets = useMemo((): ScientificBudgetItem[] => {
    if (Object.keys(scientificBudgets).length === 0) {
      return []
    }

    // Filtrer les transactions du mois courant
    const monthTransactions = transactions.filter(t => 
      t.date.startsWith(currentMonth) && t.type === 'expense'
    )

    // Calculer les dépenses par catégorie
    const spentByCategory = monthTransactions.reduce((acc, transaction) => {
      acc[transaction.categoryId] = (acc[transaction.categoryId] || 0) + transaction.amount
      return acc
    }, {} as Record<string, number>)

    // Créer les items de budget pour chaque catégorie scientifique
    return BUDGET_RULES.map(rule => {
      const budgeted = scientificBudgets[rule.id] || 0
      const spent = spentByCategory[rule.id] || 0
      const remaining = Math.max(0, budgeted - spent)
      const usage = budgeted > 0 ? (spent / budgeted) * 100 : 0

      let status: 'ok' | 'warning' | 'danger' = 'ok'
      if (usage > 100) {
        status = 'danger'
      } else if (usage > 80) {
        status = 'warning'
      }

      return {
        categoryId: rule.id,
        categoryName: rule.name,
        budgeted,
        spent,
        remaining,
        usage,
        status,
        color: rule.color,
        isEssential: rule.isEssential
      }
    }).filter(item => item.budgeted > 0) // Ne montrer que les catégories avec budget
  }, [scientificBudgets, transactions, currentMonth])

  // Calculer les totaux
  const totals = useMemo(() => {
    const totalBudgeted = budgets.reduce((sum, item) => sum + item.budgeted, 0)
    const totalSpent = budgets.reduce((sum, item) => sum + item.spent, 0)
    const totalRemaining = totalBudgeted - totalSpent

    return { totalBudgeted, totalSpent, totalRemaining }
  }, [budgets])

  return {
    budgets,
    ...totals,
    isLoading: transactionsLoading || isLoadingBudgets,
    error,
    currentMonth
  }
}
