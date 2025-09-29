// Budget Douala - Validateur Transactions IndexedDB
// I3.3 - Intégration Transaction Creation

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Badge } from './ui'
import { useTransactions } from '../hooks/useTransactions'
import { formatCurrencyXAF } from '../utils/format'
import { db } from '../data/db'

export default function TransactionValidator() {
  const { transactions, refreshTransactions } = useTransactions()
  const [dbStats, setDbStats] = useState({
    totalCount: 0,
    todayCount: 0,
    lastTransaction: null as any,
    dbSize: 0
  })
  const [isValidating, setIsValidating] = useState(false)

  // Validation directe IndexedDB
  const validateIndexedDB = async () => {
    try {
      setIsValidating(true)
      
      // Compter directement dans IndexedDB
      const allTransactions = await db.transactions.toArray()
      const today = new Date().toISOString().split('T')[0]
      const todayTransactions = allTransactions.filter(t => t.date === today)
      const lastTransaction = allTransactions[allTransactions.length - 1]
      
      // Estimer la taille de la DB
      const dbSizeEstimate = JSON.stringify(allTransactions).length
      
      setDbStats({
        totalCount: allTransactions.length,
        todayCount: todayTransactions.length,
        lastTransaction,
        dbSize: dbSizeEstimate
      })
      
      console.log('🔍 Validation IndexedDB:', {
        hookCount: transactions.length,
        dbCount: allTransactions.length,
        match: transactions.length === allTransactions.length
      })
      
    } catch (error) {
      console.error('❌ Erreur validation IndexedDB:', error)
    } finally {
      setIsValidating(false)
    }
  }

  // Validation automatique au montage et changements
  useEffect(() => {
    validateIndexedDB()
  }, [transactions])

  // Forcer le refresh
  const handleRefresh = async () => {
    await refreshTransactions()
    await validateIndexedDB()
  }

  // Vider la DB (pour tests)
  const handleClearDB = async () => {
    if (confirm('Vider toutes les transactions ? (Action irréversible)')) {
      await db.transactions.clear()
      await refreshTransactions()
      await validateIndexedDB()
    }
  }

  const isConsistent = transactions.length === dbStats.totalCount

  return (
    <Card className={isConsistent ? 'border-green-200' : 'border-orange-200'}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🔍 I3.3 - Validation Transaction Creation</span>
          <Badge variant={isConsistent ? 'income' : 'expense'}>
            {isConsistent ? 'Cohérent' : 'Incohérent'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Statistiques comparatives */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Hook useTransactions</div>
            <div className="text-xl font-bold text-blue-900">{transactions.length}</div>
            <div className="text-xs text-blue-600">transactions en mémoire</div>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">IndexedDB Direct</div>
            <div className="text-xl font-bold text-purple-900">{dbStats.totalCount}</div>
            <div className="text-xs text-purple-600">transactions en base</div>
          </div>
        </div>

        {/* Stats aujourd'hui */}
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-sm text-green-600 font-medium">Aujourd'hui</div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-green-900">{dbStats.todayCount} transactions</span>
            <span className="text-sm text-green-600">
              {formatCurrencyXAF(
                transactions
                  .filter(t => t.date === new Date().toISOString().split('T')[0])
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </span>
          </div>
        </div>

        {/* Dernière transaction */}
        {dbStats.lastTransaction && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600 font-medium mb-2">Dernière Transaction</div>
            <div className="text-xs space-y-1">
              <div><strong>ID:</strong> {dbStats.lastTransaction.id}</div>
              <div><strong>Date:</strong> {dbStats.lastTransaction.date}</div>
              <div><strong>Montant:</strong> {formatCurrencyXAF(dbStats.lastTransaction.amount)}</div>
              <div><strong>Catégorie:</strong> {dbStats.lastTransaction.categoryId}</div>
              <div><strong>Note:</strong> {dbStats.lastTransaction.note}</div>
              <div><strong>Créé:</strong> {new Date(dbStats.lastTransaction.createdAt).toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Actions de validation */}
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isValidating}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {isValidating ? '🔄 Validation...' : '🔄 Refresh'}
          </button>
          
          <button
            onClick={validateIndexedDB}
            disabled={isValidating}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            🔍 Valider DB
          </button>
          
          <button
            onClick={handleClearDB}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium"
          >
            🗑️ Clear
          </button>
        </div>

        {/* Informations techniques */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>Taille DB estimée: {(dbStats.dbSize / 1024).toFixed(1)} KB</div>
          <div>Cohérence Hook ↔ DB: {isConsistent ? '✅ OK' : '❌ Problème'}</div>
          <div>Status validation: {isValidating ? 'En cours...' : 'Terminée'}</div>
        </div>

        {/* Validation I3.3 */}
        <div className={`p-3 rounded-lg ${isConsistent ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{isConsistent ? '✅' : '⚠️'}</span>
            <div>
              <div className="font-semibold text-sm">
                I3.3 - Intégration Transaction Creation
              </div>
              <div className="text-xs">
                {isConsistent 
                  ? 'Click bouton → transaction sauvée → feedback OK'
                  : 'Incohérence détectée entre Hook et IndexedDB'
                }
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
