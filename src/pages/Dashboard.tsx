// FinanceIQ - Dashboard Principal
// Vue d'ensemble quotidienne et actions rapides

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui'
import { formatCurrencyXAF, formatDateFR, getCurrentDateDouala, getCurrentMonthDouala } from '../utils/format'
import { db } from '../data/db'
import { useScientificBudgets } from '../hooks/useScientificBudgets'
import type { Transaction } from '../types'

export default function Dashboard() {
  const navigate = useNavigate()
  const today = getCurrentDateDouala()
  const currentMonth = getCurrentMonthDouala()
  
  // État pour les données du jour
  const [todayTransactions, setTodayTransactions] = useState<Transaction[]>([])
  const [todayStats, setTodayStats] = useState({
    totalExpenses: 0,
    totalIncome: 0,
    transactionCount: 0
  })
  
  
  const [isLoading, setIsLoading] = useState(true)

  // Hook pour les budgets scientifiques
  const { budgets, totalBudgeted, totalSpent, isLoading: budgetsLoading } = useScientificBudgets()

  // Charger les données du jour
  useEffect(() => {
    loadTodayData()
  }, [today])

  const loadTodayData = async () => {
    try {
      // Récupérer les transactions du jour
      const todayTransactions = await db.transactions
        .where('date')
        .equals(today)
        .reverse()
        .sortBy('createdAt')

      // Calculer les statistiques du jour
      const todayExpenses = todayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const todayIncome = todayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)

      setTodayTransactions(todayTransactions)
      setTodayStats({
        totalExpenses: todayExpenses,
        totalIncome: todayIncome,
        transactionCount: todayTransactions.length
      })
    } catch (error) {
      console.error('Erreur chargement données du jour:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">{formatDateFR(today)} - Activité du jour</p>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/transactions')}
          >
            Transactions
          </Button>
          <Button 
            variant="success" 
            size="sm"
            onClick={() => navigate('/quick-add')}
          >
            Saisie Rapide
          </Button>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => navigate('/extra-income')}
          >
            Revenu Extra
          </Button>
        </div>
      </div>

      {/* Résumé Budget vs Réalité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Résumé Budget - {currentMonth}</span>
            {!budgetsLoading && budgets.length > 0 && (
              <div className="text-sm font-normal text-green-600">
                • Données temps réel
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {budgetsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
              <div className="text-gray-600">Chargement des budgets...</div>
            </div>
          ) : budgets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrencyXAF(totalBudgeted)}
                </div>
                <div className="text-sm text-gray-600">Budget Total</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-600">
                  {formatCurrencyXAF(totalSpent)}
                </div>
                <div className="text-sm text-gray-600">Dépensé</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrencyXAF(totalBudgeted - totalSpent)}
                </div>
                <div className="text-sm text-gray-600">Restant</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-3 text-2xl">📊</div>
              <div className="text-gray-700 font-medium">Aucun budget configuré</div>
              <div className="text-sm text-gray-500 mb-4">
                Configurez vos paramètres pour voir vos budgets
              </div>
              <Button 
                variant="primary"
                onClick={() => navigate('/settings')}
              >
                Configurer mes budgets
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activité du Jour */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Activité du Jour</span>
            {!isLoading && (
              <div className="text-sm font-normal text-blue-600">
                {todayStats.transactionCount} transaction(s)
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
              <div className="text-gray-600">Chargement...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-600">
                  {formatCurrencyXAF(todayStats.totalExpenses)}
                </div>
                <div className="text-sm text-gray-600">Dépenses du jour</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrencyXAF(todayStats.totalIncome)}
                </div>
                <div className="text-sm text-gray-600">Revenus du jour</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrencyXAF(todayStats.totalIncome - todayStats.totalExpenses)}
                </div>
                <div className="text-sm text-gray-600">Solde du jour</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions du Jour */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transactions du Jour</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/transactions')}
            >
              Voir tout
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayTransactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-3 text-2xl">📝</div>
              <div className="text-gray-700 font-medium">Aucune transaction aujourd'hui</div>
              <div className="text-sm text-gray-500 mb-4">
                Commencez par ajouter vos première dépenses ou revenus
              </div>
              <Button 
                variant="primary"
                onClick={() => navigate('/quick-add')}
              >
                Ajouter une transaction
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {todayTransactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {transaction.note || 'Transaction'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.categoryId}
                    </div>
                  </div>
                  <div className={`font-bold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrencyXAF(transaction.amount)}
                  </div>
                </div>
              ))}
              
              {todayTransactions.length > 5 && (
                <div className="text-center pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/transactions')}
                  >
                    Voir les {todayTransactions.length - 5} autres
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions Rapides */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="primary"
              onClick={() => navigate('/quick-add')}
              className="h-20 flex flex-col items-center justify-center"
            >
              <div className="text-2xl mb-1">⚡</div>
              <div>Saisie Rapide</div>
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/extra-income')}
              className="h-20 flex flex-col items-center justify-center"
            >
              <div className="text-2xl mb-1">💰</div>
              <div>Revenu Extra</div>
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/budgets')}
              className="h-20 flex flex-col items-center justify-center"
            >
              <div className="text-2xl mb-1">📊</div>
              <div>Budgets</div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
