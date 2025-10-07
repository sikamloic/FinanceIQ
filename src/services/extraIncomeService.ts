// FinanceIQ - Service Revenus Extra
// Gestion complète du stockage et de l'analyse des revenus extra

import { db } from '../data/db'
import type { ExtraIncome } from '../types'
import { calculateExtraIncomeSplit, type ExtraIncomeType } from '../domain/extraIncome'
import { generateId } from '../utils/id'

/**
 * Service principal pour la gestion des revenus extra
 */
export class ExtraIncomeService {
  
  /**
   * Enregistre un nouveau revenu extra avec répartition automatique
   */
  async saveExtraIncome(
    amount: number,
    type: ExtraIncomeType,
    description?: string,
    date?: string
  ): Promise<ExtraIncome> {
    // Calculer la répartition 60/30/10
    const split = calculateExtraIncomeSplit(amount)
    
    // Créer l'enregistrement du revenu extra
    const extraIncome: ExtraIncome = {
      id: generateId(),
      date: date || new Date().toISOString().split('T')[0], // Utiliser date fournie ou aujourd'hui
      amount: split.totalAmount,
      type,
      description,
      savingsAmount: split.splits.savings,
      projectsAmount: split.splits.projects,
      leisureAmount: split.splits.leisure,
      isProcessed: false,
      transactionIds: [],
      createdAt: new Date().toISOString()
    }
    
    // Sauvegarder en base
    await db.extraIncomes.add(extraIncome)
    
    // Créer les transactions associées
    const transactionIds = await this.createAssociatedTransactions(extraIncome)
    
    // Marquer comme traité
    await db.extraIncomes.update(extraIncome.id, {
      isProcessed: true,
      transactionIds
    })
    
    return { ...extraIncome, isProcessed: true, transactionIds }
  }
  
  /**
   * Crée les transactions automatiques pour la répartition
   */
  private async createAssociatedTransactions(extraIncome: ExtraIncome): Promise<string[]> {
    const transactionIds: string[] = []
    const baseDescription = extraIncome.description || `Revenu extra (${extraIncome.type})`
    
    // Transaction d'entrée (revenu)
    const incomeTransaction = {
      id: generateId(),
      date: extraIncome.date,
      amount: extraIncome.amount,
      categoryId: 'extra_income',
      note: baseDescription,
      type: 'income' as const,
      createdAt: new Date().toISOString()
    }
    
    await db.transactions.add(incomeTransaction)
    transactionIds.push(incomeTransaction.id)
    
    // Répartition vers épargne (60%)
    if (extraIncome.savingsAmount > 0) {
      const savingsTransaction = {
        id: generateId(),
        date: extraIncome.date,
        amount: extraIncome.savingsAmount,
        categoryId: 'savings_emergency',
        note: `${baseDescription} - Épargne (60%)`,
        type: 'expense' as const,
        createdAt: new Date().toISOString()
      }
      
      await db.transactions.add(savingsTransaction)
      transactionIds.push(savingsTransaction.id)
    }
    
    // Répartition vers projets (30%)
    if (extraIncome.projectsAmount > 0) {
      const projectsTransaction = {
        id: generateId(),
        date: extraIncome.date,
        amount: extraIncome.projectsAmount,
        categoryId: 'savings_projects',
        note: `${baseDescription} - Projets (30%)`,
        type: 'expense' as const,
        createdAt: new Date().toISOString()
      }
      
      await db.transactions.add(projectsTransaction)
      transactionIds.push(projectsTransaction.id)
    }
    
    // Répartition vers loisirs (10%)
    if (extraIncome.leisureAmount > 0) {
      const leisureTransaction = {
        id: generateId(),
        date: extraIncome.date,
        amount: extraIncome.leisureAmount,
        categoryId: 'leisure',
        note: `${baseDescription} - Loisirs (10%)`,
        type: 'expense' as const,
        createdAt: new Date().toISOString()
      }
      
      await db.transactions.add(leisureTransaction)
      transactionIds.push(leisureTransaction.id)
    }
    
    return transactionIds
  }
  
  /**
   * Récupère tous les revenus extra d'une période
   */
  async getExtraIncomes(
    startDate?: string,
    endDate?: string
  ): Promise<ExtraIncome[]> {
    let query = db.extraIncomes.orderBy('date').reverse()
    
    if (startDate && endDate) {
      query = query.filter(income => 
        income.date >= startDate && income.date <= endDate
      )
    }
    
    return await query.toArray()
  }
  
  /**
   * Récupère les revenus extra du mois courant
   */
  async getCurrentMonthExtraIncomes(): Promise<ExtraIncome[]> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    const startDate = startOfMonth.toISOString().split('T')[0]
    const endDate = endOfMonth.toISOString().split('T')[0]
    
    return this.getExtraIncomes(startDate, endDate)
  }
  
  /**
   * Calcule les statistiques des revenus extra
   */
  async getExtraIncomeStats(months: number = 12): Promise<{
    totalAmount: number
    count: number
    averageAmount: number
    totalSavings: number
    totalProjects: number
    totalLeisure: number
    byType: Record<ExtraIncomeType, { count: number; amount: number }>
    monthlyAverage: number
  }> {
    const cutoffDate = new Date()
    cutoffDate.setMonth(cutoffDate.getMonth() - months)
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0]
    
    const extraIncomes = await db.extraIncomes
      .where('date')
      .above(cutoffDateStr)
      .toArray()
    
    if (extraIncomes.length === 0) {
      return {
        totalAmount: 0,
        count: 0,
        averageAmount: 0,
        totalSavings: 0,
        totalProjects: 0,
        totalLeisure: 0,
        byType: {} as any,
        monthlyAverage: 0
      }
    }
    
    const totalAmount = extraIncomes.reduce((sum, income) => sum + income.amount, 0)
    const totalSavings = extraIncomes.reduce((sum, income) => sum + income.savingsAmount, 0)
    const totalProjects = extraIncomes.reduce((sum, income) => sum + income.projectsAmount, 0)
    const totalLeisure = extraIncomes.reduce((sum, income) => sum + income.leisureAmount, 0)
    
    // Statistiques par type
    const byType: Record<string, { count: number; amount: number }> = {}
    extraIncomes.forEach(income => {
      if (!byType[income.type]) {
        byType[income.type] = { count: 0, amount: 0 }
      }
      byType[income.type].count++
      byType[income.type].amount += income.amount
    })
    
    return {
      totalAmount,
      count: extraIncomes.length,
      averageAmount: Math.round(totalAmount / extraIncomes.length),
      totalSavings,
      totalProjects,
      totalLeisure,
      byType: byType as any,
      monthlyAverage: Math.round(totalAmount / months)
    }
  }
  
  /**
   * Supprime un revenu extra et ses transactions associées
   */
  async deleteExtraIncome(id: string): Promise<void> {
    const extraIncome = await db.extraIncomes.get(id)
    if (!extraIncome) {
      throw new Error('Revenu extra introuvable')
    }
    
    // Supprimer les transactions associées
    if (extraIncome.transactionIds.length > 0) {
      await db.transactions.bulkDelete(extraIncome.transactionIds)
    }
    
    // Supprimer le revenu extra
    await db.extraIncomes.delete(id)
  }
  
  /**
   * Met à jour la description d'un revenu extra
   */
  async updateExtraIncomeDescription(id: string, description: string): Promise<void> {
    await db.extraIncomes.update(id, { description })
  }
}

// Instance singleton du service
export const extraIncomeService = new ExtraIncomeService()

/**
 * Hooks React pour utiliser le service
 */
export function useExtraIncomeService() {
  return {
    saveExtraIncome: (amount: number, type: ExtraIncomeType, description?: string, date?: string) =>
      extraIncomeService.saveExtraIncome(amount, type, description, date),
    
    getExtraIncomes: (startDate?: string, endDate?: string) =>
      extraIncomeService.getExtraIncomes(startDate, endDate),
    
    getCurrentMonthExtraIncomes: () =>
      extraIncomeService.getCurrentMonthExtraIncomes(),
    
    getExtraIncomeStats: (months?: number) =>
      extraIncomeService.getExtraIncomeStats(months),
    
    deleteExtraIncome: (id: string) =>
      extraIncomeService.deleteExtraIncome(id),
    
    updateDescription: (id: string, description: string) =>
      extraIncomeService.updateExtraIncomeDescription(id, description)
  }
}
