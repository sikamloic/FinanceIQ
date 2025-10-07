// FinanceIQ - Gestion Revenus Extra
// Interface de saisie et répartition automatique

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui'
import NumericInput from '../components/NumericInput'
import DateSelector from '../components/DateSelector'
import { formatCurrencyXAF } from '../utils/format'
import { 
  calculateExtraIncomeSplit, 
  generateExtraIncomeAdvice,
  validateExtraIncomeAmount,
  EXTRA_INCOME_TYPES,
  type ExtraIncomeType 
} from '../domain/extraIncome'
import { useExtraIncomeService } from '../services/extraIncomeService'

export default function ExtraIncome() {
  const navigate = useNavigate()
  const extraIncomeService = useExtraIncomeService()
  const [amount, setAmount] = useState('')
  const [selectedType, setSelectedType] = useState<ExtraIncomeType>('bonus')
  const [description, setDescription] = useState('')
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0] // Défaut: aujourd'hui
  )
  const [showSplit, setShowSplit] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Validation et calcul en temps réel
  const validation = validateExtraIncomeAmount(amount)
  const split = validation.isValid ? calculateExtraIncomeSplit(validation.amount) : null
  const advice = split ? generateExtraIncomeAdvice(split.totalAmount) : []

  // Gérer la saisie du montant
  const handleAmountChange = (value: string) => {
    setAmount(value)
    setShowSplit(false)
  }

  // Calculer la répartition
  const handleCalculateSplit = () => {
    if (validation.isValid) {
      setShowSplit(true)
    }
  }

  // Enregistrer les transactions
  const handleSaveTransactions = async () => {
    if (!split || isProcessing) return

    setIsProcessing(true)
    
    try {
      // Sauvegarder le revenu extra avec répartition automatique
      await extraIncomeService.saveExtraIncome(
        split.totalAmount,
        selectedType,
        description.trim() || undefined,
        selectedDate
      )

      // Feedback succès
      alert(`✅ Revenu extra de ${formatCurrencyXAF(split.totalAmount)} réparti avec succès !`)
      
      // Retour au dashboard
      navigate('/')
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      alert('❌ Erreur lors de la sauvegarde')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={() => navigate('/extra-income/history')}
            variant="outline"
            size="sm"
          >
            📊 Historique
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">💰 Revenu Extra</h1>
          </div>
          <div className="w-20"></div> {/* Spacer pour centrer le titre */}
        </div>
        <p className="text-gray-600">
          Répartition automatique : <strong>60% Épargne • 30% Projets • 10% Loisirs</strong>
        </p>
      </div>

      {/* Saisie du montant */}
      <Card>
        <CardHeader>
          <CardTitle>1. Montant reçu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date du revenu */}
          <DateSelector
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            maxPastDays={30}
          />
          
          <NumericInput
            label="Montant du revenu extra"
            value={parseInt(amount) || 0}
            onChange={(value) => handleAmountChange(value.toString())}
            placeholder="Ex: 50000"
            suffix="XAF"
            error={!validation.isValid ? validation.error : undefined}
          />

          {/* Type de revenu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de revenu
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as ExtraIncomeType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(EXTRA_INCOME_TYPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Description optionnelle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optionnel)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Prime fin d'année, Vente ordinateur..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={100}
            />
          </div>

          <Button
            onClick={handleCalculateSplit}
            disabled={!validation.isValid}
            variant="primary"
            className="w-full"
          >
            📊 Calculer la répartition
          </Button>
        </CardContent>
      </Card>

      {/* Répartition calculée */}
      {showSplit && split && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">
              2. Répartition de {formatCurrencyXAF(split.totalAmount)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Barres de répartition */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🏦</span>
                  <div>
                    <div className="font-semibold text-blue-900">Épargne</div>
                    <div className="text-sm text-blue-700">{split.percentages.savings}%</div>
                  </div>
                </div>
                <div className="text-xl font-bold text-blue-900">
                  {formatCurrencyXAF(split.splits.savings)}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-100 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <div className="font-semibold text-purple-900">Projets</div>
                    <div className="text-sm text-purple-700">{split.percentages.projects}%</div>
                  </div>
                </div>
                <div className="text-xl font-bold text-purple-900">
                  {formatCurrencyXAF(split.splits.projects)}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-100 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <div className="font-semibold text-orange-900">Loisirs</div>
                    <div className="text-sm text-orange-700">{split.percentages.leisure}%</div>
                  </div>
                </div>
                <div className="text-xl font-bold text-orange-900">
                  {formatCurrencyXAF(split.splits.leisure)}
                </div>
              </div>
            </div>

            {/* Conseils personnalisés */}
            {advice.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">💡 Conseils FinanceIQ</h4>
                <ul className="space-y-1 text-sm text-yellow-700">
                  {advice.map((tip, index) => (
                    <li key={index}>• {tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={() => setShowSplit(false)}
                variant="outline"
                className="flex-1"
              >
                ← Modifier
              </Button>
              <Button
                onClick={handleSaveTransactions}
                disabled={isProcessing}
                variant="primary"
                className="flex-1"
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Enregistrement...</span>
                  </div>
                ) : (
                  '✅ Enregistrer la répartition'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informations méthodologie */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-900 mb-2">🧠 Méthode Scientifique</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>60% Épargne</strong> : Renforce votre sécurité financière</p>
            <p>• <strong>30% Projets</strong> : Accélère vos objectifs moyen terme</p>
            <p>• <strong>10% Loisirs</strong> : Récompense immédiate pour maintenir la motivation</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
