// Budget Douala - Composant Barre de Budget
// I4.3 - Composant BudgetBar avec couleurs et états

import { Card, CardContent, Badge } from './ui'
import { formatCurrencyXAF } from '../utils/format'
import type { ScientificBudgetItem } from '../hooks/useScientificBudgets'

interface BudgetBarProps {
  budget: ScientificBudgetItem
  className?: string
  showDetails?: boolean
}

export default function BudgetBar({ budget, className = '', showDetails = true }: BudgetBarProps) {
  const percentage = budget.usage || 0
  const spent = budget.spent || 0
  const budgeted = budget.budgeted || 0
  const remaining = budget.remaining || 0
  const category = budget.categoryName || 'Catégorie'
  const categoryId = budget.categoryId || 'unknown'
  const status = budget.status || 'ok'
  
  const isOverBudget = spent > budgeted
  
  // Couleurs de la barre selon le statut
  const getBarColor = () => {
    if (isOverBudget) return 'bg-red-500'
    if (percentage > 80) return 'bg-orange-500'
    if (percentage > 60) return 'bg-yellow-500'
    return 'bg-green-500'
  }
  
  const getBackgroundColor = () => {
    if (isOverBudget) return 'bg-red-100'
    if (percentage > 80) return 'bg-orange-100'
    if (percentage > 60) return 'bg-yellow-100'
    return 'bg-green-100'
  }

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: budget.color }}>
              {category.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{category}</h3>
              <div className="text-xs text-gray-500">{categoryId}</div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-bold text-lg">
              {formatCurrencyXAF(spent)}
            </div>
            <div className="text-sm text-gray-500">
              / {formatCurrencyXAF(budgeted)}
            </div>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mb-3">
          <div className={`w-full h-4 rounded-full ${getBackgroundColor()}`}>
            <div 
              className={`h-4 rounded-full transition-all duration-500 ${getBarColor()}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600">
              {percentage.toFixed(1)}% utilisé
            </span>
            
            {isOverBudget ? (
              <Badge variant="expense" size="sm">
                Dépassé de {formatCurrencyXAF(spent - budgeted, { showCurrency: false })}
              </Badge>
            ) : (
              <span className="text-sm text-gray-600">
                Reste {formatCurrencyXAF(remaining, { showCurrency: false })}
              </span>
            )}
          </div>
        </div>

        {/* Status badge et détails */}
        <div className="flex justify-between items-center">
          <Badge variant={
            status === 'ok' ? 'income' :
            status === 'warning' ? 'neutral' : 'expense'
          } size="sm">
            {status === 'ok' ? 'OK' :
             status === 'warning' ? 'Attention' : 'Dépassé'}
          </Badge>
          
          {showDetails && (
            <div className="text-xs text-gray-500">
              {percentage.toFixed(1)}% • {status}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
