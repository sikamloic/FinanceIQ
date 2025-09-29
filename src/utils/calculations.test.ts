// Budget Douala - Tests Unitaires Calculs
// I4.1 - Tests pour calculations.ts
import { describe, it, expect } from 'vitest'
import {
  calculateRentFund,
  calculateTransportBudget,
  calculateFoodBudget,
  calculateDataBudget,
  sumByCategory,
  getMonthlySpendingByCategory,
  calculateBudgetUsage,
  getBudgetStatus,
  calculateRecommendedBudgets,
  calculateFinancialStats
} from './calculations'
import type { Transaction } from '../types'

// Données de test
const mockTransactions: Transaction[] = [
  {
    id: 'tx1',
    date: '2025-09-01',
    amount: 1500,
    categoryId: 'cat_transport',
    note: 'Transport test',
    type: 'expense',
    createdAt: '2025-09-01T10:00:00Z'
  },
  {
    id: 'tx2',
    date: '2025-09-02',
    amount: 5000,
    categoryId: 'cat_alimentation',
    note: 'Food test',
    type: 'expense',
    createdAt: '2025-09-02T12:00:00Z'
  },
  {
    id: 'tx3',
    date: '2025-09-03',
    amount: 2500,
    categoryId: 'cat_data',
    note: 'Data test',
    type: 'expense',
    createdAt: '2025-09-03T14:00:00Z'
  },
  {
    id: 'tx4',
    date: '2025-09-04',
    amount: 1500,
    categoryId: 'cat_transport',
    note: 'Transport test 2',
    type: 'expense',
    createdAt: '2025-09-04T16:00:00Z'
  }
]

describe('calculateRentFund', () => {
  it('calcule correctement avec marge par défaut (10%)', () => {
    expect(calculateRentFund(100000)).toBe(110000)
  })

  it('calcule correctement avec marge personnalisée', () => {
    expect(calculateRentFund(100000, 20)).toBe(120000)
  })

  it('gère les valeurs nulles et négatives', () => {
    expect(calculateRentFund(0)).toBe(0)
    expect(calculateRentFund(-1000)).toBe(0)
    expect(calculateRentFund(100000, -5)).toBe(100000) // Marge négative = 0%
  })

  it('arrondit correctement', () => {
    expect(calculateRentFund(33333, 10)).toBe(36666) // 33333 * 1.1 = 36666.3
  })
})

describe('calculateTransportBudget', () => {
  it('calcule correctement avec jours ouvrés par défaut (21.7)', () => {
    expect(calculateTransportBudget(1500)).toBe(32550) // 1500 * 21.7
  })

  it('calcule correctement avec jours personnalisés', () => {
    expect(calculateTransportBudget(1500, 22)).toBe(33000)
  })

  it('gère les valeurs nulles et négatives', () => {
    expect(calculateTransportBudget(0)).toBe(0)
    expect(calculateTransportBudget(-1000)).toBe(0)
    expect(calculateTransportBudget(1500, 0)).toBe(0)
    expect(calculateTransportBudget(1500, -5)).toBe(0)
  })
})

describe('calculateFoodBudget', () => {
  it('calcule correctement avec 30 jours par défaut', () => {
    expect(calculateFoodBudget(5000)).toBe(150000)
  })

  it('calcule correctement avec jours personnalisés', () => {
    expect(calculateFoodBudget(5000, 31)).toBe(155000)
  })

  it('gère les valeurs nulles et négatives', () => {
    expect(calculateFoodBudget(0)).toBe(0)
    expect(calculateFoodBudget(-1000)).toBe(0)
  })
})

describe('calculateDataBudget', () => {
  it('calcule correctement sans frais supplémentaires', () => {
    expect(calculateDataBudget(15000)).toBe(15000)
  })

  it('calcule correctement avec frais supplémentaires', () => {
    expect(calculateDataBudget(15000, 5000)).toBe(20000)
  })

  it('gère les valeurs négatives', () => {
    expect(calculateDataBudget(-1000)).toBe(0)
    expect(calculateDataBudget(15000, -2000)).toBe(15000)
  })
})

describe('sumByCategory', () => {
  it('somme correctement par catégorie', () => {
    expect(sumByCategory(mockTransactions, 'cat_transport')).toBe(3000) // 1500 + 1500
    expect(sumByCategory(mockTransactions, 'cat_alimentation')).toBe(5000)
    expect(sumByCategory(mockTransactions, 'cat_data')).toBe(2500)
  })

  it('retourne 0 pour catégorie inexistante', () => {
    expect(sumByCategory(mockTransactions, 'cat_inexistante')).toBe(0)
  })

  it('filtre correctement par date', () => {
    expect(sumByCategory(mockTransactions, 'cat_transport', '2025-09-02')).toBe(1500) // Seulement tx4
    expect(sumByCategory(mockTransactions, 'cat_transport', '2025-09-01', '2025-09-03')).toBe(1500) // Seulement tx1
  })

  it('gère les listes vides', () => {
    expect(sumByCategory([], 'cat_transport')).toBe(0)
  })
})

describe('getMonthlySpendingByCategory', () => {
  it('groupe correctement par catégorie pour le mois', () => {
    const result = getMonthlySpendingByCategory(mockTransactions, '2025-09')
    
    expect(result).toEqual({
      'cat_transport': 3000,
      'cat_alimentation': 5000,
      'cat_data': 2500
    })
  })

  it('retourne objet vide pour mois sans transactions', () => {
    const result = getMonthlySpendingByCategory(mockTransactions, '2025-10')
    expect(result).toEqual({})
  })

  it('gère les listes vides', () => {
    const result = getMonthlySpendingByCategory([], '2025-09')
    expect(result).toEqual({})
  })
})

describe('calculateBudgetUsage', () => {
  it('calcule correctement le pourcentage', () => {
    expect(calculateBudgetUsage(50, 100)).toBe(50)
    expect(calculateBudgetUsage(75, 100)).toBe(75)
    expect(calculateBudgetUsage(100, 100)).toBe(100)
  })

  it('plafonne à 100%', () => {
    expect(calculateBudgetUsage(150, 100)).toBe(100)
  })

  it('gère les budgets nuls', () => {
    expect(calculateBudgetUsage(50, 0)).toBe(0)
  })

  it('gère les dépenses négatives', () => {
    expect(calculateBudgetUsage(-50, 100)).toBe(0)
  })
})

describe('getBudgetStatus', () => {
  it('retourne "ok" pour usage normal', () => {
    expect(getBudgetStatus(50, 100)).toBe('ok') // 50%
    expect(getBudgetStatus(79, 100)).toBe('ok') // 79%
  })

  it('retourne "warning" pour usage élevé', () => {
    expect(getBudgetStatus(80, 100)).toBe('warning') // 80%
    expect(getBudgetStatus(95, 100)).toBe('warning') // 95%
  })

  it('retourne "danger" pour dépassement', () => {
    expect(getBudgetStatus(100, 100)).toBe('danger') // 100%
    expect(getBudgetStatus(120, 100)).toBe('danger') // 120%
  })

  it('respecte les seuils personnalisés', () => {
    expect(getBudgetStatus(60, 100, 50, 90)).toBe('warning') // 60% avec seuil warning à 50%
    expect(getBudgetStatus(90, 100, 50, 90)).toBe('danger') // 90% avec seuil danger à 90%
  })
})

describe('calculateFinancialStats', () => {
  it('calcule correctement les statistiques globales', () => {
    const stats = calculateFinancialStats(mockTransactions)
    
    expect(stats.totalSpent).toBe(10500) // 1500 + 5000 + 2500 + 1500
    expect(stats.transactionCount).toBe(4)
    expect(stats.averageTransaction).toBe(2625) // 10500 / 4
    expect(stats.topCategory).toEqual({
      categoryId: 'cat_alimentation',
      amount: 5000
    })
    expect(stats.dailyAverage).toBe(350) // 10500 / 30
  })

  it('filtre correctement par mois', () => {
    const stats = calculateFinancialStats(mockTransactions, '2025-09')
    
    expect(stats.totalSpent).toBe(10500)
    expect(stats.transactionCount).toBe(4)
  })

  it('gère les listes vides', () => {
    const stats = calculateFinancialStats([])
    
    expect(stats.totalSpent).toBe(0)
    expect(stats.transactionCount).toBe(0)
    expect(stats.averageTransaction).toBe(0)
    expect(stats.topCategory).toBe(null)
    expect(stats.dailyAverage).toBe(0)
  })
})

describe('calculateRecommendedBudgets', () => {
  it('calcule des budgets recommandés avec marge', () => {
    // Pour 3 mois, chaque catégorie aura sa moyenne * 1.2
    const budgets = calculateRecommendedBudgets(mockTransactions, 1) // 1 mois pour simplifier
    
    expect(budgets['cat_transport']).toBe(3600) // 3000 * 1.2
    expect(budgets['cat_alimentation']).toBe(6000) // 5000 * 1.2
    expect(budgets['cat_data']).toBe(3000) // 2500 * 1.2
  })

  it('gère les listes vides', () => {
    const budgets = calculateRecommendedBudgets([])
    expect(budgets).toEqual({})
  })
})

// Test d'intégration : scénario complet
describe('Scénario d\'intégration Douala', () => {
  it('calcule un budget mensuel réaliste pour un utilisateur type', () => {
    // Utilisateur avec loyer 150000 XAF, transport quotidien 1500 XAF
    const rentFund = calculateRentFund(150000, 15) // +15% de marge
    const transportBudget = calculateTransportBudget(1500) // 21.7 jours ouvrés
    const foodBudget = calculateFoodBudget(4000) // 4000 XAF/jour
    const dataBudget = calculateDataBudget(20000, 5000) // 20k forfait + 5k extra
    
    expect(rentFund).toBe(172500) // 150000 * 1.15
    expect(transportBudget).toBe(32550) // 1500 * 21.7
    expect(foodBudget).toBe(120000) // 4000 * 30
    expect(dataBudget).toBe(25000) // 20000 + 5000
    
    const totalBudget = rentFund + transportBudget + foodBudget + dataBudget
    expect(totalBudget).toBe(350050) // Budget mensuel total
  })
})
