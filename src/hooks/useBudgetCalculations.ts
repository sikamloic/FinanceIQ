// Budget Douala - Hook Budget Calculations
// I4.1 - Hook pour intégrer les calculs avec les données

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
  getBudgetStatus,
  calculateFinancialStats
} from '../utils/calculations'

export interface BudgetItem {
  categoryId: string
  categoryName: string
  categoryIcon: string
  budgetAmount: number
  spentAmount: number
  usage: number
  status: 'ok' | 'warning' | 'danger'
  remaining: number
}

export interface BudgetSummary {
  totalBudget: number
  totalSpent: number
  totalUsage: number
  status: 'ok' | 'warning' | 'danger'
  budgets: BudgetItem[]
  stats: {
    totalSpent: number
    transactionCount: number
    averageTransaction: number
    topCategory: { categoryId: string; amount: number } | null
    dailyAverage: number
  }
}

interface UseBudgetCalculationsReturn {
  currentMonth: BudgetSummary
  isLoading: boolean
  error: string | null
  refreshBudgets: () => void
}

export function useBudgetCalculations(month?: string): UseBudgetCalculationsReturn {
  const { transactions, isLoading: transactionsLoading, error: transactionsError } = useTransactions()
  const { settings, isLoading: settingsLoading } = useSettings()

  // Calculer les budgets pour le mois en cours
  const currentMonth = useMemo((): BudgetSummary => {
    if (!transactions.length || !settings || !Array.isArray(settings) || settings.length === 0) {
      return {
        totalBudget: 0,
        totalSpent: 0,
        totalUsage: 0,
        status: 'ok',
        budgets: [],
        stats: {
          totalSpent: 0,
          transactionCount: 0,
          averageTransaction: 0,
          topCategory: null,
          dailyAverage: 0
        }
      }
    }

    // Récupérer les paramètres utilisateur (avec valeurs par défaut)
    const rentMonthly = settings.find((s: any) => s.key === 'rent_monthly')?.value || '150000'
    const rentMargin = settings.find((s: any) => s.key === 'rent_margin')?.value || '15'
    const transportDaily = settings.find((s: any) => s.key === 'transport_daily')?.value || '1500'
    const foodDaily = settings.find((s: any) => s.key === 'food_daily')?.value || '4000'
    const dataMonthly = settings.find((s: any) => s.key === 'data_monthly')?.value || '20000'
    const dataExtra = settings.find((s: any) => s.key === 'data_extra')?.value || '5000'

    // Calculer les budgets théoriques
    const rentBudget = calculateRentFund(parseInt(rentMonthly), parseInt(rentMargin))
    const transportBudget = calculateTransportBudget(parseInt(transportDaily))
    const foodBudget = calculateFoodBudget(parseInt(foodDaily))
    const dataBudget = calculateDataBudget(parseInt(dataMonthly), parseInt(dataExtra))

    // Calculer les dépenses réelles du mois
    const targetMonth = month || new Date().toISOString().slice(0, 7) // YYYY-MM
    const monthlySpending = getMonthlySpendingByCategory(transactions, targetMonth)

    // Créer les items de budget
    const budgetItems: BudgetItem[] = [
      {
        categoryId: 'cat_transport',
        categoryName: 'Transport',
        categoryIcon: '🚌',
        budgetAmount: transportBudget,
        spentAmount: monthlySpending['cat_transport'] || 0,
        usage: calculateBudgetUsage(monthlySpending['cat_transport'] || 0, transportBudget),
        status: getBudgetStatus(monthlySpending['cat_transport'] || 0, transportBudget),
        remaining: Math.max(0, transportBudget - (monthlySpending['cat_transport'] || 0))
      },
      {
        categoryId: 'cat_alimentation',
        categoryName: 'Alimentation',
        categoryIcon: '🍽️',
        budgetAmount: foodBudget,
        spentAmount: monthlySpending['cat_alimentation'] || 0,
        usage: calculateBudgetUsage(monthlySpending['cat_alimentation'] || 0, foodBudget),
        status: getBudgetStatus(monthlySpending['cat_alimentation'] || 0, foodBudget),
        remaining: Math.max(0, foodBudget - (monthlySpending['cat_alimentation'] || 0))
      },
      {
        categoryId: 'cat_data',
        categoryName: 'Data',
        categoryIcon: '📱',
        budgetAmount: dataBudget,
        spentAmount: monthlySpending['cat_data'] || 0,
        usage: calculateBudgetUsage(monthlySpending['cat_data'] || 0, dataBudget),
        status: getBudgetStatus(monthlySpending['cat_data'] || 0, dataBudget),
        remaining: Math.max(0, dataBudget - (monthlySpending['cat_data'] || 0))
      },
      {
        categoryId: 'cat_loyer',
        categoryName: 'Loyer',
        categoryIcon: '🏠',
        budgetAmount: rentBudget,
        spentAmount: monthlySpending['cat_loyer'] || 0,
        usage: calculateBudgetUsage(monthlySpending['cat_loyer'] || 0, rentBudget),
        status: getBudgetStatus(monthlySpending['cat_loyer'] || 0, rentBudget),
        remaining: Math.max(0, rentBudget - (monthlySpending['cat_loyer'] || 0))
      }
    ]

    // Calculer les totaux
    const totalBudget = budgetItems.reduce((sum, item) => sum + item.budgetAmount, 0)
    const totalSpent = budgetItems.reduce((sum, item) => sum + item.spentAmount, 0)
    const totalUsage = calculateBudgetUsage(totalSpent, totalBudget)
    const totalStatus = getBudgetStatus(totalSpent, totalBudget)

    // Calculer les statistiques
    const stats = calculateFinancialStats(transactions, targetMonth)

    return {
      totalBudget,
      totalSpent,
      totalUsage,
      status: totalStatus,
      budgets: budgetItems,
      stats
    }
  }, [transactions, settings, month])

  const refreshBudgets = () => {
    // Les hooks se rafraîchissent automatiquement
    // Cette fonction est là pour la compatibilité future
  }

  return {
    currentMonth,
    isLoading: transactionsLoading || settingsLoading,
    error: transactionsError,
    refreshBudgets
  }
}
