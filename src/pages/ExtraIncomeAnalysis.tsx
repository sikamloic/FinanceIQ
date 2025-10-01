// FinanceIQ - Analyse Impact Revenus Extra
// Visualisation de l'interaction avec le budget salarial

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui'
import { formatCurrencyXAF } from '../utils/format'
import { 
  calculateBudgetImpact, 
  generateSmartRecommendations,
  checkBudgetBalance,
  type BudgetImpact 
} from '../domain/budgetInteraction'

export default function ExtraIncomeAnalysis() {
  const [impact, setImpact] = useState<BudgetImpact | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Données simulées pour la démo
  useEffect(() => {
    // TODO: Récupérer les vraies données depuis la base
    const mockSalaryBudget = {
      monthlySalary: 250000,
      monthlyExpenses: 175000,
      monthlySavings: 75000,
      emergencyTarget: 525000 // 3x dépenses essentielles
    }

    const mockExtraHistory = [
      { amount: 50000, date: '2024-01-15', split: { splits: { savings: 30000, projects: 15000, leisure: 5000 } } },
      { amount: 25000, date: '2024-02-20', split: { splits: { savings: 15000, projects: 7500, leisure: 2500 } } },
      { amount: 75000, date: '2024-03-10', split: { splits: { savings: 45000, projects: 22500, leisure: 7500 } } }
    ]

    const calculatedImpact = calculateBudgetImpact(mockSalaryBudget, mockExtraHistory as any)
    setImpact(calculatedImpact)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!impact) return null

  const recommendations = generateSmartRecommendations(impact, 'occasional')
  const balanceCheck = checkBudgetBalance(
    { monthlySalary: 250000, monthlyExpenses: 175000 },
    50000
  )

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">📊 Impact Revenus Extra</h1>
        <p className="text-gray-600">
          Analyse de l'interaction avec votre budget salarial
        </p>
      </div>

      {/* Principes Fondamentaux */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">🎯 Principe FinanceIQ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">💼 Budget Salarial = Base</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Répartition fixe 13 catégories</li>
                <li>• Dépenses ≤70% du salaire</li>
                <li>• Épargne 25-30% garantie</li>
                <li>• Stabilité et prévisibilité</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">🚀 Revenus Extra = Accélérateurs</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Ne remplacent jamais la base</li>
                <li>• Renforcent les objectifs</li>
                <li>• Accélèrent la liberté financière</li>
                <li>• Répartition 60/30/10 automatique</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impact sur le Coussin d'Urgence */}
      <Card>
        <CardHeader>
          <CardTitle>🛡️ Impact Coussin d'Urgence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrencyXAF(impact.emergencyFund.targetAmount)}
              </div>
              <div className="text-sm text-gray-600">Objectif (3x essentiels)</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(impact.emergencyFund.monthsToTarget)} mois
              </div>
              <div className="text-sm text-gray-600">Sans revenus extra</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(impact.emergencyFund.monthsToTargetWithExtra)} mois
              </div>
              <div className="text-sm text-gray-600">Avec revenus extra</div>
            </div>
          </div>
          
          {impact.emergencyFund.accelerationMonths > 0 && (
            <div className="mt-4 p-3 bg-green-100 rounded-lg text-center">
              <div className="text-green-800 font-semibold">
                ⚡ Accélération : {Math.round(impact.emergencyFund.accelerationMonths)} mois gagnés !
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Impact sur les Projets */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Impact Projets Moyen Terme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-purple-800">Épargne projets (salaire)</span>
              <span className="font-bold text-purple-900">
                {formatCurrencyXAF(impact.projects.monthlyFromSalary)}/mois
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-800">Bonus revenus extra</span>
              <span className="font-bold text-blue-900">
                +{formatCurrencyXAF(impact.projects.monthlyFromExtra)}/mois
              </span>
            </div>
            
            {impact.projects.accelerationFactor > 0 && (
              <div className="p-3 bg-green-100 rounded-lg text-center">
                <div className="text-green-800 font-semibold">
                  📈 Accélération projets : +{Math.round(impact.projects.accelerationFactor)}%
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Impact Liberté Financière */}
      <Card>
        <CardHeader>
          <CardTitle>💎 Impact Liberté Financière</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {Math.round(impact.financialFreedom.yearsToTarget)} ans
              </div>
              <div className="text-sm text-gray-600">Sans revenus extra</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(impact.financialFreedom.yearsToTargetWithExtra)} ans
              </div>
              <div className="text-sm text-gray-600">Avec revenus extra</div>
            </div>
          </div>
          
          {impact.financialFreedom.accelerationYears > 0 && (
            <div className="mt-4 p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg text-center">
              <div className="text-gray-800 font-semibold">
                🚀 Liberté financière atteinte {Math.round(impact.financialFreedom.accelerationYears)} ans plus tôt !
              </div>
            </div>
          )}
          
          <div className="mt-4 text-sm text-gray-600">
            <p>* Basé sur la règle des 25x : {formatCurrencyXAF(impact.financialFreedom.monthlyExpenses * 12 * 25)} nécessaires</p>
          </div>
        </CardContent>
      </Card>

      {/* Recommandations Intelligentes */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-800">💡 Recommandations FinanceIQ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recommendations.map((rec, index) => (
              <div key={index} className="text-yellow-800">
                {rec}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vérification Équilibre */}
      {!balanceCheck.isBalanced && (
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800">⚠️ Alertes Équilibre</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {balanceCheck.warnings.map((warning, index) => (
                <div key={index} className="text-red-700 font-medium">
                  {warning}
                </div>
              ))}
              
              <div className="border-t border-red-200 pt-3">
                <h4 className="font-semibold text-red-800 mb-2">Suggestions :</h4>
                {balanceCheck.suggestions.map((suggestion, index) => (
                  <div key={index} className="text-red-700">
                    {suggestion}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Règles d'Or */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">📜 Règles d'Or FinanceIQ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">✅ À FAIRE</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Maintenir le budget salarial stable</li>
                <li>• Traiter les extras comme des bonus</li>
                <li>• Respecter la répartition 60/30/10</li>
                <li>• Accélérer les objectifs existants</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-800 mb-2">❌ À ÉVITER</h4>
              <ul className="space-y-1 text-red-700">
                <li>• Compter sur les extras pour vivre</li>
                <li>• Augmenter le train de vie</li>
                <li>• Négliger l'épargne régulière</li>
                <li>• Créer une dépendance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
