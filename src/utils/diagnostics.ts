// Budget Douala - Utilitaires de Diagnostic
// I3.3 - Intégration Transaction Creation

import { db } from '../data/db'

export interface DiagnosticResult {
  timestamp: string
  dbStatus: 'ok' | 'error' | 'empty'
  transactionCount: number
  categoriesCount: number
  settingsCount: number
  dbSize: number
  lastTransaction: any
  performance: {
    dbOpenTime: number
    queryTime: number
  }
  errors: string[]
}

/**
 * Diagnostic complet de l'état de la base de données
 */
export async function runFullDiagnostic(): Promise<DiagnosticResult> {
  const startTime = Date.now()
  const errors: string[] = []
  let dbStatus: 'ok' | 'error' | 'empty' = 'ok'
  
  try {
    // Test ouverture DB
    const dbOpenStart = Date.now()
    await db.open()
    const dbOpenTime = Date.now() - dbOpenStart

    // Test requêtes
    const queryStart = Date.now()
    const [transactions, categories, settings] = await Promise.all([
      db.transactions.toArray().catch(e => { errors.push(`Transactions: ${e.message}`); return [] }),
      db.categories.toArray().catch(e => { errors.push(`Categories: ${e.message}`); return [] }),
      db.settings.toArray().catch(e => { errors.push(`Settings: ${e.message}`); return [] })
    ])
    const queryTime = Date.now() - queryStart

    // Calculer la taille approximative
    const dbSize = JSON.stringify({ transactions, categories, settings }).length

    // Dernière transaction
    const lastTransaction = transactions.length > 0 
      ? transactions[transactions.length - 1] 
      : null

    // Déterminer le statut
    if (errors.length > 0) {
      dbStatus = 'error'
    } else if (transactions.length === 0 && categories.length === 0) {
      dbStatus = 'empty'
    }

    return {
      timestamp: new Date().toISOString(),
      dbStatus,
      transactionCount: transactions.length,
      categoriesCount: categories.length,
      settingsCount: settings.length,
      dbSize,
      lastTransaction,
      performance: {
        dbOpenTime,
        queryTime
      },
      errors
    }

  } catch (error) {
    errors.push(`Fatal: ${error instanceof Error ? error.message : 'Unknown error'}`)
    
    return {
      timestamp: new Date().toISOString(),
      dbStatus: 'error',
      transactionCount: 0,
      categoriesCount: 0,
      settingsCount: 0,
      dbSize: 0,
      lastTransaction: null,
      performance: {
        dbOpenTime: Date.now() - startTime,
        queryTime: 0
      },
      errors
    }
  }
}

/**
 * Test de performance d'ajout de transaction
 */
export async function testTransactionPerformance(count: number = 5): Promise<{
  totalTime: number
  avgTime: number
  success: number
  errors: number
  details: Array<{ time: number, success: boolean, error?: string }>
}> {
  const results = []
  let success = 0
  let errors = 0

  const startTime = Date.now()

  for (let i = 0; i < count; i++) {
    const txStart = Date.now()
    
    try {
      const transaction = {
        date: new Date().toISOString().split('T')[0],
        amount: 1000 + i * 100,
        categoryId: 'cat_test',
        note: `Test performance ${i + 1}`,
        type: 'expense' as const
      }

      await db.transactions.add({
        ...transaction,
        id: `perf_test_${Date.now()}_${i}`,
        createdAt: new Date().toISOString()
      })

      const txTime = Date.now() - txStart
      results.push({ time: txTime, success: true })
      success++

    } catch (error) {
      const txTime = Date.now() - txStart
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      results.push({ time: txTime, success: false, error: errorMsg })
      errors++
    }
  }

  const totalTime = Date.now() - startTime
  const avgTime = totalTime / count

  return {
    totalTime,
    avgTime,
    success,
    errors,
    details: results
  }
}

/**
 * Nettoyage des données de test
 */
export async function cleanupTestData(): Promise<number> {
  try {
    const testTransactions = await db.transactions
      .where('note')
      .startsWith('Test')
      .or('note')
      .startsWith('Concurrent')
      .or('note')
      .startsWith('Test performance')
      .toArray()

    const testIds = testTransactions.map(t => t.id)
    
    if (testIds.length > 0) {
      await db.transactions.bulkDelete(testIds)
    }

    return testIds.length
  } catch (error) {
    console.error('Erreur nettoyage:', error)
    return 0
  }
}

/**
 * Validation de l'intégrité des données
 */
export async function validateDataIntegrity(): Promise<{
  valid: boolean
  issues: string[]
  stats: {
    duplicateTransactions: number
    orphanTransactions: number
    invalidDates: number
    negativeAmounts: number
  }
}> {
  const issues: string[] = []
  const stats = {
    duplicateTransactions: 0,
    orphanTransactions: 0,
    invalidDates: 0,
    negativeAmounts: 0
  }

  try {
    const [transactions, categories] = await Promise.all([
      db.transactions.toArray(),
      db.categories.toArray()
    ])

    const categoryIds = new Set(categories.map(c => c.id))

    // Vérifier les doublons (même date, montant, catégorie)
    const transactionKeys = new Set()
    for (const tx of transactions) {
      const key = `${tx.date}_${tx.amount}_${tx.categoryId}`
      if (transactionKeys.has(key)) {
        stats.duplicateTransactions++
      }
      transactionKeys.add(key)
    }

    // Vérifier les transactions orphelines
    for (const tx of transactions) {
      if (!categoryIds.has(tx.categoryId)) {
        stats.orphanTransactions++
      }
    }

    // Vérifier les dates invalides
    for (const tx of transactions) {
      if (!tx.date || isNaN(Date.parse(tx.date))) {
        stats.invalidDates++
      }
    }

    // Vérifier les montants négatifs
    for (const tx of transactions) {
      if (tx.amount < 0) {
        stats.negativeAmounts++
      }
    }

    // Générer les issues
    if (stats.duplicateTransactions > 0) {
      issues.push(`${stats.duplicateTransactions} transactions potentiellement dupliquées`)
    }
    if (stats.orphanTransactions > 0) {
      issues.push(`${stats.orphanTransactions} transactions avec catégorie inexistante`)
    }
    if (stats.invalidDates > 0) {
      issues.push(`${stats.invalidDates} transactions avec date invalide`)
    }
    if (stats.negativeAmounts > 0) {
      issues.push(`${stats.negativeAmounts} transactions avec montant négatif`)
    }

    return {
      valid: issues.length === 0,
      issues,
      stats
    }

  } catch (error) {
    issues.push(`Erreur validation: ${error instanceof Error ? error.message : 'Unknown'}`)
    return {
      valid: false,
      issues,
      stats
    }
  }
}
