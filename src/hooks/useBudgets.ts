// Budget Douala - Hook useBudgets
// I4.2 - Hook pour calculer budgets vs réel du mois courant

import { useMemo } from 'react'
import { useTransactions } from './useTransactions'
import { useSettings } from './useSettings'
import {
  calculateRentFund,
  calculateTransportBudget,
  calculateFoodBudget,
  calculateDataBudget,
  getMonthlySpendingByCategory,
  calculateBudgetUsage,
  getBudgetStatus
} from '../utils/calculations'

export interface BudgetItem {
  category: string
  categoryId: string
  icon: string
  budgeted: number
  spent: number
  remaining: number
  usage: number
  status: 'ok' | 'warning' | 'danger'
}

interface UseBudgetsReturn {
  budgets: BudgetItem[]
  totalBudgeted: number
  totalSpent: number
  totalRemaining: number
  isLoading: boolean
  error: string | null
  currentMonth: string
}

export function useBudgets(month?: string): UseBudgetsReturn {
  const { transactions, isLoading: transactionsLoading, error: transactionsError } = useTransactions()
  const { settings, isLoading: settingsLoading } = useSettings()

  // Mois cible (par défaut: mois courant)
  const currentMonth = month || new Date().toISOString().slice(0, 7) // YYYY-MM

  // Calculer les budgets
  const budgets = useMemo((): BudgetItem[] => {
    if (!transactions.length || !settings || !Array.isArray(settings)) {
      return []
    }

    // Récupérer les paramètres utilisateur depuis le singleton (avec valeurs par défaut Douala)
    const settingsData = Array.isArray(settings) && settings.length > 0 ? settings[0] : null
    const rentMonthly = settingsData?.rentMonthly || 150000
    const rentMargin = settingsData?.rentMarginPct || 10
    const transportDaily = settingsData?.transportDaily || 1500
    // Valeurs par défaut pour les champs non présents dans Settings
    const foodDaily = 4000
    const dataMonthly = 20000
    const dataExtra = 5000

    // Calculer les budgets théoriques
    const rentBudget = calculateRentFund(rentMonthly, rentMargin)
    const transportBudget = calculateTransportBudget(transportDaily)
    const foodBudget = calculateFoodBudget(foodDaily)
    const dataBudget = calculateDataBudget(dataMonthly, dataExtra)

    // Calculer les dépenses réelles du mois
    const monthlySpending = getMonthlySpendingByCategory(transactions, currentMonth)

    // Créer les items de budget
    const budgetItems: BudgetItem[] = [
      {
        category: 'Transport',
        categoryId: 'cat_transport',
        icon: '🚌',
        budgeted: transportBudget,
        spent: monthlySpending['cat_transport'] || 0,
        remaining: Math.max(0, transportBudget - (monthlySpending['cat_transport'] || 0)),
        usage: calculateBudgetUsage(monthlySpending['cat_transport'] || 0, transportBudget),
        status: getBudgetStatus(monthlySpending['cat_transport'] || 0, transportBudget)
      },
      {
        category: 'Alimentation',
        categoryId: 'cat_alimentation',
        icon: '🍽️',
        budgeted: foodBudget,
        spent: monthlySpending['cat_alimentation'] || 0,
        remaining: Math.max(0, foodBudget - (monthlySpending['cat_alimentation'] || 0)),
        usage: calculateBudgetUsage(monthlySpending['cat_alimentation'] || 0, foodBudget),
        status: getBudgetStatus(monthlySpending['cat_alimentation'] || 0, foodBudget)
      },
      {
        category: 'Data',
        categoryId: 'cat_data',
        icon: '📱',
        budgeted: dataBudget,
        spent: monthlySpending['cat_data'] || 0,
        remaining: Math.max(0, dataBudget - (monthlySpending['cat_data'] || 0)),
        usage: calculateBudgetUsage(monthlySpending['cat_data'] || 0, dataBudget),
        status: getBudgetStatus(monthlySpending['cat_data'] || 0, dataBudget)
      },
      {
        category: 'Loyer',
        categoryId: 'cat_loyer',
        icon: '🏠',
        budgeted: rentBudget,
        spent: monthlySpending['cat_loyer'] || 0,
        remaining: Math.max(0, rentBudget - (monthlySpending['cat_loyer'] || 0)),
        usage: calculateBudgetUsage(monthlySpending['cat_loyer'] || 0, rentBudget),
        status: getBudgetStatus(monthlySpending['cat_loyer'] || 0, rentBudget)
      },
      {
        category: 'Autres',
        categoryId: 'cat_autres',
        icon: '💼',
        budgeted: 50000, // Budget fixe pour autres dépenses
        spent: Object.entries(monthlySpending)
          .filter(([catId]) => !['cat_transport', 'cat_alimentation', 'cat_data', 'cat_loyer'].includes(catId))
          .reduce((sum, [, amount]) => sum + amount, 0),
        remaining: Math.max(0, 50000 - Object.entries(monthlySpending)
          .filter(([catId]) => !['cat_transport', 'cat_alimentation', 'cat_data', 'cat_loyer'].includes(catId))
          .reduce((sum, [, amount]) => sum + amount, 0)),
        usage: calculateBudgetUsage(
          Object.entries(monthlySpending)
            .filter(([catId]) => !['cat_transport', 'cat_alimentation', 'cat_data', 'cat_loyer'].includes(catId))
            .reduce((sum, [, amount]) => sum + amount, 0),
          50000
        ),
        status: getBudgetStatus(
          Object.entries(monthlySpending)
            .filter(([catId]) => !['cat_transport', 'cat_alimentation', 'cat_data', 'cat_loyer'].includes(catId))
            .reduce((sum, [, amount]) => sum + amount, 0),
          50000
        )
      }
    ]

    return budgetItems
  }, [transactions, settings, currentMonth])

  // Calculer les totaux
  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.budgeted, 0)
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0)
  const totalRemaining = budgets.reduce((sum, budget) => sum + budget.remaining, 0)

  return {
    budgets,
    totalBudgeted,
    totalSpent,
    totalRemaining,
    isLoading: transactionsLoading || settingsLoading,
    error: transactionsError,
    currentMonth
  }
}
