// Budget Douala - Hook CRUD Transactions
// I1.2 - CRUD Transactions (Sans Crypto)

import { useState, useEffect, useCallback } from 'react'
import { db } from '../data/db'
import type { Transaction } from '../types'
import { getCurrentDateDouala } from '../utils/format'


interface UseTransactionsReturn {
  transactions: Transaction[]
  isLoading: boolean
  error: string | null
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<string>
  deleteTransaction: (id: string) => Promise<void>
  getTransactionsByMonth: (month: string) => Promise<Transaction[]>
  refreshTransactions: () => Promise<void>
}

export function useTransactions(): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger toutes les transactions
  const loadTransactions = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const allTransactions = await db.transactions
        .orderBy('date')
        .reverse() // Plus récentes en premier
        .toArray()
      
      setTransactions(allTransactions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Ajouter une transaction
  const addTransaction = useCallback(async (
    transactionData: Omit<Transaction, 'id' | 'createdAt'>
  ): Promise<string> => {
    try {
      setError(null)
      
      // Générer un ID unique
      const id = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const newTransaction: Transaction = {
        ...transactionData,
        id,
        createdAt: new Date().toISOString()
      }
      
      // Sauvegarder en DB
      await db.transactions.add(newTransaction)
      
      // Recharger la liste
      await loadTransactions()
      
      return id
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur d\'ajout'
      setError(errorMsg)
      throw new Error(errorMsg)
    }
  }, [loadTransactions])

  // Supprimer une transaction
  const deleteTransaction = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null)
      
      await db.transactions.delete(id)
      
      // Recharger la liste
      await loadTransactions()
      
      console.log('🗑️ Transaction supprimée:', id)
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur de suppression'
      setError(errorMsg)
      throw new Error(errorMsg)
    }
  }, [loadTransactions])

  // Récupérer les transactions d'un mois
  const getTransactionsByMonth = useCallback(async (month: string): Promise<Transaction[]> => {
    try {
      setError(null)
      
      // Format month: "2025-09"
      const startDate = `${month}-01`
      const endDate = `${month}-31` // Approximatif mais suffisant
      
      const monthTransactions = await db.transactions
        .where('date')
        .between(startDate, endDate, true, true)
        .toArray()
      
      return monthTransactions.sort((a, b) => b.date.localeCompare(a.date))
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur de requête'
      setError(errorMsg)
      throw new Error(errorMsg)
    }
  }, [])

  // Rafraîchir manuellement
  const refreshTransactions = useCallback(async (): Promise<void> => {
    await loadTransactions()
  }, [loadTransactions])

  // Charger au montage
  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  return {
    transactions,
    isLoading,
    error,
    addTransaction,
    deleteTransaction,
    getTransactionsByMonth,
    refreshTransactions
  }
}

// Fonction utilitaire pour créer une transaction rapide
export function createQuickTransaction(
  amount: number,
  categoryId: string,
  note?: string
): Omit<Transaction, 'id' | 'createdAt'> {
  return {
    date: getCurrentDateDouala(),
    amount,
    categoryId,
    note: note || '',
    type: 'expense'
  }
}
