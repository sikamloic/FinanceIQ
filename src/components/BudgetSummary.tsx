// Budget Douala - Résumé Budget
// I2.4 - Dashboard Vide Stylé

import { Card, CardHeader, CardTitle, CardContent, Badge } from './ui'
import { formatCurrencyXAF, formatCurrencyWithType } from '../utils/format'

interface BudgetSummaryProps {
  totalIncome: number
  totalExpenses: number
  totalBudget: number
  currentMonth: string
}

export default function BudgetSummary({ 
  totalIncome, 
  totalExpenses, 
  totalBudget,
  currentMonth 
}: BudgetSummaryProps) {
  
  const remaining = totalIncome - totalExpenses
  const budgetUsed = (totalExpenses / totalBudget) * 100
  const incomeResult = formatCurrencyWithType(totalIncome, 'income')
  const expenseResult = formatCurrencyWithType(totalExpenses, 'expense')
  
  const getStatusBadge = () => {
    if (remaining < 0) return { variant: 'expense' as const, text: 'Déficit' }
    if (budgetUsed > 90) return { variant: 'savings' as const, text: 'Attention' }
    if (budgetUsed > 70) return { variant: 'budget' as const, text: 'Surveillé' }
    return { variant: 'income' as const, text: 'Équilibré' }
  }
  
  const status = getStatusBadge()

  return (
    <Card variant="elevated" className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>💰</span>
            <span>Budget {currentMonth}</span>
          </CardTitle>
          <Badge variant={status.variant}>{status.text}</Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Revenus */}
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Revenus</div>
            <div className={`text-xl font-bold ${incomeResult.className}`}>
              {incomeResult.formatted}
            </div>
          </div>
          
          {/* Dépenses */}
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Dépenses</div>
            <div className={`text-xl font-bold ${expenseResult.className}`}>
              {expenseResult.formatted}
            </div>
          </div>
          
          {/* Solde */}
          <div className={`text-center p-4 rounded-lg ${
            remaining >= 0 ? 'bg-blue-50' : 'bg-red-50'
          }`}>
            <div className="text-sm text-gray-600 mb-1">Solde</div>
            <div className={`text-xl font-bold ${
              remaining >= 0 ? 'text-blue-600' : 'text-red-600'
            }`}>
              {formatCurrencyXAF(remaining, { sign: true })}
            </div>
          </div>
        </div>

        {/* Barre de progression globale */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Utilisation du budget
            </span>
            <span className="text-sm text-gray-600">
              {budgetUsed.toFixed(0)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                budgetUsed > 100 ? 'bg-red-500' :
                budgetUsed > 90 ? 'bg-orange-500' :
                budgetUsed > 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(budgetUsed, 100)}%` }}
            />
          </div>
        </div>

        {/* Conseils rapides */}
        <div className="text-sm text-gray-600">
          {remaining < 0 && (
            <div className="flex items-center space-x-2 text-red-600">
              <span>⚠️</span>
              <span>Attention: Budget dépassé de {formatCurrencyXAF(Math.abs(remaining), { showCurrency: false })}</span>
            </div>
          )}
          
          {remaining >= 0 && budgetUsed > 90 && (
            <div className="flex items-center space-x-2 text-orange-600">
              <span>💡</span>
              <span>Conseil: Surveillez vos dépenses, budget presque atteint</span>
            </div>
          )}
          
          {remaining >= 0 && budgetUsed <= 70 && (
            <div className="flex items-center space-x-2 text-green-600">
              <span>✅</span>
              <span>Excellent: Budget bien maîtrisé ce mois-ci</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
