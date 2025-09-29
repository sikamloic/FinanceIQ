// Budget Douala - Calculs Budgets (Domain Logic)
// I4.1 - Calculs Budgets avec formules métier Douala

import type { Transaction } from '../types'

/**
 * Calcule le fonds de loyer avec marge de sécurité
 * @param rentMonthly - Loyer mensuel en XAF
 * @param marginPct - Marge de sécurité en pourcentage (ex: 10 pour 10%)
 * @returns Montant à économiser mensuellement
 */
export function calculateRentFund(rentMonthly: number, marginPct: number = 10): number {
  if (rentMonthly <= 0) return 0
  if (marginPct < 0) marginPct = 0
  
  return Math.round(rentMonthly * (1 + marginPct / 100))
}

/**
 * Calcule le budget transport mensuel basé sur le coût quotidien
 * @param dailyAmount - Coût quotidien transport en XAF
 * @param workingDaysPerMonth - Jours ouvrés par mois (défaut: 21.7 pour Douala)
 * @returns Budget transport mensuel
 */
export function calculateTransportBudget(dailyAmount: number, workingDaysPerMonth: number = 21.7): number {
  if (dailyAmount <= 0) return 0
  if (workingDaysPerMonth <= 0) return 0
  
  return Math.round(dailyAmount * workingDaysPerMonth)
}

/**
 * Calcule le budget alimentation basé sur le coût quotidien
 * @param dailyAmount - Coût quotidien alimentation en XAF
 * @param daysPerMonth - Jours par mois (défaut: 30)
 * @returns Budget alimentation mensuel
 */
export function calculateFoodBudget(dailyAmount: number, daysPerMonth: number = 30): number {
  if (dailyAmount <= 0) return 0
  if (daysPerMonth <= 0) return 0
  
  return Math.round(dailyAmount * daysPerMonth)
}

/**
 * Calcule le budget data/communication mensuel
 * @param monthlyData - Forfait data mensuel en XAF
 * @param extraCommunication - Coûts supplémentaires (appels, SMS) en XAF
 * @returns Budget data total mensuel
 */
export function calculateDataBudget(monthlyData: number, extraCommunication: number = 0): number {
  if (monthlyData < 0) monthlyData = 0
  if (extraCommunication < 0) extraCommunication = 0
  
  return Math.round(monthlyData + extraCommunication)
}

/**
 * Somme les transactions par catégorie pour une période donnée
 * @param transactions - Liste des transactions
 * @param categoryId - ID de la catégorie à sommer
 * @param startDate - Date de début (YYYY-MM-DD) optionnelle
 * @param endDate - Date de fin (YYYY-MM-DD) optionnelle
 * @returns Somme des montants pour la catégorie
 */
export function sumByCategory(
  transactions: Transaction[], 
  categoryId: string,
  startDate?: string,
  endDate?: string
): number {
  return transactions
    .filter(t => {
      // Filtrer par catégorie
      if (t.categoryId !== categoryId) return false
      
      // Filtrer par date si spécifiée
      if (startDate && t.date < startDate) return false
      if (endDate && t.date > endDate) return false
      
      return true
    })
    .reduce((sum, t) => sum + t.amount, 0)
}

/**
 * Calcule les dépenses par catégorie pour le mois en cours
 * @param transactions - Liste des transactions
 * @param month - Mois au format YYYY-MM (optionnel, défaut: mois actuel)
 * @returns Objet avec les sommes par catégorie
 */
export function getMonthlySpendingByCategory(
  transactions: Transaction[],
  month?: string
): Record<string, number> {
  // Utiliser le mois actuel si non spécifié
  const targetMonth = month || new Date().toISOString().slice(0, 7) // YYYY-MM
  
  // Filtrer les transactions du mois
  const monthTransactions = transactions.filter(t => 
    t.date.startsWith(targetMonth)
  )
  
  // Grouper par catégorie
  const spending: Record<string, number> = {}
  
  monthTransactions.forEach(t => {
    if (!spending[t.categoryId]) {
      spending[t.categoryId] = 0
    }
    spending[t.categoryId] += t.amount
  })
  
  return spending
}

/**
 * Calcule le pourcentage d'utilisation d'un budget
 * @param spent - Montant dépensé
 * @param budget - Budget total
 * @returns Pourcentage d'utilisation (0-100)
 */
export function calculateBudgetUsage(spent: number, budget: number): number {
  if (budget <= 0) return 0
  if (spent < 0) spent = 0
  
  const percentage = (spent / budget) * 100
  return Math.min(percentage, 100) // Cap à 100%
}

/**
 * Détermine le statut d'un budget (OK, Warning, Danger)
 * @param spent - Montant dépensé
 * @param budget - Budget total
 * @param warningThreshold - Seuil d'alerte en % (défaut: 80%)
 * @param dangerThreshold - Seuil de danger en % (défaut: 100%)
 * @returns Statut du budget
 */
export function getBudgetStatus(
  spent: number, 
  budget: number,
  warningThreshold: number = 80,
  dangerThreshold: number = 100
): 'ok' | 'warning' | 'danger' {
  const usage = calculateBudgetUsage(spent, budget)
  
  if (usage >= dangerThreshold) return 'danger'
  if (usage >= warningThreshold) return 'warning'
  return 'ok'
}

/**
 * Calcule les budgets recommandés basés sur l'historique des transactions
 * @param transactions - Historique des transactions
 * @param months - Nombre de mois à analyser (défaut: 3)
 * @returns Budgets recommandés par catégorie
 */
export function calculateRecommendedBudgets(
  transactions: Transaction[],
  months: number = 3
): Record<string, number> {
  // Calculer la date de début (il y a X mois)
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months)
  
  const startDateStr = startDate.toISOString().slice(0, 10) // YYYY-MM-DD
  const endDateStr = endDate.toISOString().slice(0, 10)
  
  // Filtrer les transactions de la période
  const periodTransactions = transactions.filter(t => 
    t.date >= startDateStr && t.date <= endDateStr
  )
  
  // Grouper par catégorie et calculer la moyenne mensuelle
  const categoryTotals: Record<string, number> = {}
  
  periodTransactions.forEach(t => {
    if (!categoryTotals[t.categoryId]) {
      categoryTotals[t.categoryId] = 0
    }
    categoryTotals[t.categoryId] += t.amount
  })
  
  // Calculer la moyenne mensuelle avec marge de sécurité de 20%
  const recommendedBudgets: Record<string, number> = {}
  
  Object.entries(categoryTotals).forEach(([categoryId, total]) => {
    const monthlyAverage = total / months
    const withMargin = monthlyAverage * 1.2 // +20% de marge
    recommendedBudgets[categoryId] = Math.round(withMargin)
  })
  
  return recommendedBudgets
}

/**
 * Calcule les statistiques financières globales
 * @param transactions - Liste des transactions
 * @param month - Mois à analyser (optionnel)
 * @returns Statistiques financières
 */
export function calculateFinancialStats(
  transactions: Transaction[],
  month?: string
): {
  totalSpent: number
  transactionCount: number
  averageTransaction: number
  topCategory: { categoryId: string; amount: number } | null
  dailyAverage: number
} {
  // Filtrer par mois si spécifié
  let filteredTransactions = transactions
  if (month) {
    filteredTransactions = transactions.filter(t => t.date.startsWith(month))
  }
  
  const totalSpent = filteredTransactions.reduce((sum, t) => sum + t.amount, 0)
  const transactionCount = filteredTransactions.length
  const averageTransaction = transactionCount > 0 ? totalSpent / transactionCount : 0
  
  // Trouver la catégorie avec le plus de dépenses
  const categorySpending = getMonthlySpendingByCategory(filteredTransactions)
  const topCategory = Object.entries(categorySpending).length > 0
    ? Object.entries(categorySpending).reduce((max, [categoryId, amount]) => 
        amount > max.amount ? { categoryId, amount } : max
      , { categoryId: '', amount: 0 })
    : null
  
  // Calculer la moyenne quotidienne (sur 30 jours)
  const dailyAverage = totalSpent / 30
  
  return {
    totalSpent: Math.round(totalSpent),
    transactionCount,
    averageTransaction: Math.round(averageTransaction),
    topCategory,
    dailyAverage: Math.round(dailyAverage)
  }
}
