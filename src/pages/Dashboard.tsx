// FinanceIQ - Dashboard Principal
// Vue d'ensemble de l'intelligence financière

import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui'
import BudgetBar from '../components/BudgetBar'
import { useScientificBudgets } from '../hooks/useScientificBudgets'
import { getCurrentMonthDouala } from '../utils/format'

export default function Dashboard() {
  const navigate = useNavigate()
  const currentMonth = getCurrentMonthDouala()
  
  // Hook pour les vraies données de budget
  const { budgets, totalBudgeted, totalSpent, isLoading } = useScientificBudgets()

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Vue d'ensemble de vos finances</p>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/transactions')}
          >
            📋 Transactions
          </Button>
          <Button 
            variant="success" 
            size="sm"
            onClick={() => navigate('/quick-add')}
          >
            ⚡ Saisie
          </Button>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => navigate('/extra-income')}
          >
            💰 Extra
          </Button>
        </div>
      </div>

      {/* Résumé Budget - Données Réelles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Résumé Budget {currentMonth}</span>
            {!isLoading && (
              <div className="text-sm font-normal text-green-600">
                • Données temps réel
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {budgets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {totalBudgeted.toLocaleString()} XAF
                </div>
                <div className="text-sm text-gray-600">Budget Total</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-600">
                  {totalSpent.toLocaleString()} XAF
                </div>
                <div className="text-sm text-gray-600">Dépensé</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {(totalBudgeted - totalSpent).toLocaleString()} XAF
                </div>
                <div className="text-sm text-gray-600">Restant</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-gray-500">
                Aucune donnée budgétaire disponible
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Barres de Budget - Données Réelles */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Budgets par Catégorie ({currentMonth})
          </h2>
          {!isLoading && budgets.length > 0 && (
            <div className="text-sm text-gray-600">
              {totalSpent.toLocaleString()} / {totalBudgeted.toLocaleString()} XAF
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
            <div className="text-gray-600">Chargement des budgets...</div>
          </div>
        ) : budgets.length > 0 ? (
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
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <div className="text-gray-500 mb-3 text-2xl">■</div>
            <div className="text-gray-700 font-medium">Aucun budget configuré</div>
            <div className="text-sm text-gray-500">
              Initialisez vos settings pour voir les budgets
            </div>
          </div>
        )}
      </div>

      {/* Actions rapides - Simplifiées */}
      {budgets.length === 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-3 text-blue-600">▶</div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Commencez votre gestion financière
            </h3>
            <p className="text-blue-700 text-sm mb-4">
              Configurez vos paramètres pour voir vos budgets personnalisés
            </p>
            <Button 
              variant="primary"
              onClick={() => navigate('/settings')}
            >
              ⚙ Configurer mes paramètres
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
