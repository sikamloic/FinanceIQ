// FinanceIQ - Historique Revenus Extra
// Visualisation et analyse des revenus extra stockés

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui'
import { formatCurrencyXAF, formatDateFR } from '../utils/format'
import { useExtraIncomeService } from '../services/extraIncomeService'
import { EXTRA_INCOME_TYPES } from '../domain/extraIncome'
import type { ExtraIncome } from '../types'

export default function ExtraIncomeHistory() {
  const navigate = useNavigate()
  const extraIncomeService = useExtraIncomeService()
  
  const [extraIncomes, setExtraIncomes] = useState<ExtraIncome[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'1' | '3' | '6' | '12'>('3')

  // Charger les données
  useEffect(() => {
    loadData()
  }, [selectedPeriod])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [incomes, statistics] = await Promise.all([
        extraIncomeService.getExtraIncomes(),
        extraIncomeService.getExtraIncomeStats(parseInt(selectedPeriod))
      ])
      
      setExtraIncomes(incomes)
      setStats(statistics)
    } catch (error) {
      console.error('Erreur chargement données:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Supprimer un revenu extra
  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce revenu extra et ses transactions associées ?')) return
    
    try {
      await extraIncomeService.deleteExtraIncome(id)
      await loadData() // Recharger
    } catch (error) {
      console.error('Erreur suppression:', error)
      alert('❌ Erreur lors de la suppression')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">💰 Historique Revenus Extra</h1>
          <p className="text-gray-600">Analyse de vos revenus complémentaires</p>
        </div>
        
        <Button
          onClick={() => navigate('/extra-income')}
          variant="primary"
        >
          + Nouveau revenu
        </Button>
      </div>

      {/* Statistiques Période */}
      {stats && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>📊 Statistiques</CardTitle>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="1">1 mois</option>
                <option value="3">3 mois</option>
                <option value="6">6 mois</option>
                <option value="12">12 mois</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrencyXAF(stats.totalAmount)}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {stats.count}
                </div>
                <div className="text-sm text-gray-600">Revenus</div>
              </div>
              
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrencyXAF(stats.averageAmount)}
                </div>
                <div className="text-sm text-gray-600">Moyenne</div>
              </div>
              
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrencyXAF(stats.monthlyAverage)}
                </div>
                <div className="text-sm text-gray-600">Par mois</div>
              </div>
            </div>
            
            {/* Répartition totale */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg">
                <span className="text-blue-800 font-medium">🏦 Épargne (60%)</span>
                <span className="font-bold text-blue-900">
                  {formatCurrencyXAF(stats.totalSavings)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-100 rounded-lg">
                <span className="text-purple-800 font-medium">🎯 Projets (30%)</span>
                <span className="font-bold text-purple-900">
                  {formatCurrencyXAF(stats.totalProjects)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-100 rounded-lg">
                <span className="text-orange-800 font-medium">🎉 Loisirs (10%)</span>
                <span className="font-bold text-orange-900">
                  {formatCurrencyXAF(stats.totalLeisure)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des revenus extra */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Historique Détaillé</CardTitle>
        </CardHeader>
        <CardContent>
          {extraIncomes.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4 text-4xl">💰</div>
              <div className="text-gray-700 font-medium">Aucun revenu extra enregistré</div>
              <div className="text-sm text-gray-500 mb-4">
                Commencez par ajouter vos premiers revenus complémentaires
              </div>
              <Button
                onClick={() => navigate('/extra-income')}
                variant="primary"
              >
                + Ajouter un revenu extra
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {extraIncomes.map((income) => (
                <div
                  key={income.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">💰</div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {formatCurrencyXAF(income.amount)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {EXTRA_INCOME_TYPES[income.type]} • {formatDateFR(income.date)}
                          </div>
                          {income.description && (
                            <div className="text-sm text-gray-500 italic">
                              "{income.description}"
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Répartition */}
                      <div className="mt-3 flex space-x-4 text-sm">
                        <span className="text-blue-600">
                          🏦 {formatCurrencyXAF(income.savingsAmount)}
                        </span>
                        <span className="text-purple-600">
                          🎯 {formatCurrencyXAF(income.projectsAmount)}
                        </span>
                        <span className="text-orange-600">
                          🎉 {formatCurrencyXAF(income.leisureAmount)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {income.isProcessed ? (
                        <span className="text-green-600 text-sm">✅ Traité</span>
                      ) : (
                        <span className="text-orange-600 text-sm">⏳ En cours</span>
                      )}
                      
                      <button
                        onClick={() => handleDelete(income.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conseils */}
      {stats && stats.count > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">💡 Analyse FinanceIQ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-blue-800">
              {stats.monthlyAverage > 50000 && (
                <p>🚀 Excellente fréquence de revenus extra ! Vous accélérez significativement vos objectifs.</p>
              )}
              
              {stats.count >= 5 && (
                <p>📈 Avec {stats.count} revenus extra, vous développez une bonne dynamique financière.</p>
              )}
              
              <p>
                💎 Grâce à la répartition 60/30/10, vous avez renforcé votre épargne de{' '}
                <strong>{formatCurrencyXAF(stats.totalSavings)}</strong> !
              </p>
              
              {stats.totalProjects > 100000 && (
                <p>
                  🎯 Vos projets bénéficient de <strong>{formatCurrencyXAF(stats.totalProjects)}</strong> supplémentaires.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
