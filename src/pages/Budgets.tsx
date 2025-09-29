// FinanceIQ - Suivi Budgétaire Intelligent
// Analyse détaillée des budgets scientifiques par catégorie

import { Card, CardHeader, CardTitle, CardContent } from '../components/ui'
import BudgetBar from '../components/BudgetBar'
import { useScientificBudgets } from '../hooks/useScientificBudgets'
import { getCurrentMonthDouala, formatCurrencyXAF } from '../utils/format'

export default function Budgets() {
  const currentMonth = getCurrentMonthDouala()
  const { budgets, totalBudgeted, totalSpent, isLoading } = useScientificBudgets()

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
            <div className="text-gray-600">Chargement des budgets...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
          <p className="text-gray-600">Suivi détaillé par catégorie - {currentMonth}</p>
        </div>
      </div>

      {/* Résumé Global */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé Global</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrencyXAF(totalBudgeted, { showCurrency: false })} XAF
              </div>
              <div className="text-sm text-gray-600">Budget Total</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrencyXAF(totalSpent, { showCurrency: false })} XAF
              </div>
              <div className="text-sm text-gray-600">Dépensé</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrencyXAF(totalBudgeted - totalSpent, { showCurrency: false })} XAF
              </div>
              <div className="text-sm text-gray-600">Restant</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budgets par Catégorie */}
      <Card>
        <CardHeader>
          <CardTitle>Budgets par Catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          {budgets.length > 0 ? (
            <div className="space-y-4">
              {budgets.map((budget) => (
                <BudgetBar
                  key={budget.categoryId}
                  budget={budget}
                  showDetails={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-3 text-2xl">■</div>
              <div className="text-gray-700 font-medium">Aucun budget configuré</div>
              <div className="text-sm text-gray-500 mb-4">
                Configurez vos paramètres pour générer vos budgets automatiquement
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conseils Budgétaires */}
      {budgets.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Conseils Budgétaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Essayez de maintenir vos dépenses sous 80% de chaque budget</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Les budgets en rouge nécessitent une attention particulière</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Révisez vos paramètres si les budgets ne correspondent pas à vos besoins</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
