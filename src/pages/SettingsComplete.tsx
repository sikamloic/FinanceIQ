// Budget Douala - Page Settings Complète
// Configuration complète des budgets par catégorie

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui'
import NumericInput from '../components/NumericInput'
import { formatCurrencyXAF } from '../utils/format'
import { calculateRentFund } from '../utils/calculations'
import { resetDatabase, resetTransactionsOnly, showDatabaseStats } from '../utils/resetDatabase'

interface SettingsFormData {
  salary: number
  rentMonthly: number
  rentMarginPct: 5 | 10
  salarySavePct: number
  
  // Budgets par catégorie
  nutritionBudget: number
  transportBudget: number
  utilitiesBudget: number
  healthBeautyBudget: number
  phoneInternetBudget: number
  leisureBudget: number
  diversBudget: number
  pocketMonsieurBudget: number
  pocketMadameBudget: number
  familyAidBudget: number
}

export default function SettingsComplete() {
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<SettingsFormData>({
    salary: 250000,
    rentMonthly: 35000,
    rentMarginPct: 10,
    salarySavePct: 10,
    
    // Budgets par catégorie
    nutritionBudget: 50000,
    transportBudget: 32550,
    utilitiesBudget: 25000,
    healthBeautyBudget: 15000,
    phoneInternetBudget: 12500,
    leisureBudget: 20000,
    diversBudget: 15000,
    pocketMonsieurBudget: 25000,
    pocketMadameBudget: 25000,
    familyAidBudget: 30000
  })
  
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [originalSettings, setOriginalSettings] = useState<SettingsFormData | null>(null)
  const [isResetting, setIsResetting] = useState(false)
  const [dbStats, setDbStats] = useState<{ transactions: number; categories: number; settings: number } | null>(null)

  // Charger les settings existants
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { db } = await import('../data/db')
        const currentSettings = await db.settings.get('singleton')
        
        const settingsData: SettingsFormData = {
          salary: currentSettings?.salary || 250000,
          rentMonthly: currentSettings?.rentMonthly || 35000,
          rentMarginPct: currentSettings?.rentMarginPct || 10,
          salarySavePct: currentSettings?.salarySavePct || 10,
          
          // Budgets par catégorie
          nutritionBudget: currentSettings?.nutritionBudget || 50000,
          transportBudget: currentSettings?.transportBudget || 32550,
          utilitiesBudget: currentSettings?.utilitiesBudget || 25000,
          healthBeautyBudget: currentSettings?.healthBeautyBudget || 15000,
          phoneInternetBudget: currentSettings?.phoneInternetBudget || 12500,
          leisureBudget: currentSettings?.leisureBudget || 20000,
          diversBudget: currentSettings?.diversBudget || 15000,
          pocketMonsieurBudget: currentSettings?.pocketMonsieurBudget || 25000,
          pocketMadameBudget: currentSettings?.pocketMadameBudget || 25000,
          familyAidBudget: currentSettings?.familyAidBudget || 30000
        }

        setOriginalSettings(settingsData)
        setFormData(settingsData)
        setIsLoading(false)
        
      } catch (error) {
        console.error('Erreur chargement settings:', error)
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  // Détecter les changements
  useEffect(() => {
    if (originalSettings) {
      const hasChanged = JSON.stringify(formData) !== JSON.stringify(originalSettings)
      setHasChanges(hasChanged)
    }
  }, [formData, originalSettings])

  // Calculer les budgets en temps réel
  const calculatedBudgets = {
    rent: calculateRentFund(formData.rentMonthly, formData.rentMarginPct),
    nutrition: formData.nutritionBudget,
    transport: formData.transportBudget,
    utilities: formData.utilitiesBudget,
    healthBeauty: formData.healthBeautyBudget,
    phoneInternet: formData.phoneInternetBudget,
    leisure: formData.leisureBudget,
    divers: formData.diversBudget,
    pocketMonsieur: formData.pocketMonsieurBudget,
    pocketMadame: formData.pocketMadameBudget,
    familyAid: formData.familyAidBudget,
    savings: Math.round(formData.salary * formData.salarySavePct / 100)
  }

  const totalBudgets = Object.values(calculatedBudgets).reduce((sum, val) => sum + val, 0)
  const budgetBalance = formData.salary - totalBudgets

  // Mettre à jour un champ
  const updateField = (field: keyof SettingsFormData, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Sauvegarder les modifications
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { db } = await import('../data/db')
      
      const settingsToSave = {
        id: 'singleton' as const,
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await db.settings.put(settingsToSave)
      
      setOriginalSettings(formData)
      setHasChanges(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  // Reset complet
  const handleResetDatabase = async () => {
    if (!confirm('⚠️ Supprimer TOUTES les données ?')) return
    
    setIsResetting(true)
    try {
      await resetDatabase()
      window.location.reload()
    } catch (error) {
      console.error('Erreur reset:', error)
    } finally {
      setIsResetting(false)
    }
  }

  // Reset transactions uniquement
  const handleResetTransactions = async () => {
    if (!confirm('Supprimer toutes les transactions ?')) return
    
    setIsResetting(true)
    try {
      await resetTransactionsOnly()
      await loadDbStats()
      alert('✅ Transactions supprimées')
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsResetting(false)
    }
  }

  // Charger stats DB
  const loadDbStats = async () => {
    try {
      const stats = await showDatabaseStats()
      setDbStats(stats)
    } catch (error) {
      console.error('Erreur stats:', error)
    }
  }

  useEffect(() => {
    loadDbStats()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
            <div className="text-gray-600">Chargement...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>⚙ Configuration Budgétaire Complète</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Configurez votre salaire et tous vos budgets mensuels par catégorie
          </p>
        </CardContent>
      </Card>

      {/* Revenus et Épargne */}
      <Card>
        <CardHeader>
          <CardTitle>💰 Revenus et Épargne</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NumericInput
              label="Salaire mensuel (XAF)"
              value={formData.salary}
              onChange={(value) => updateField('salary', value)}
              icon="$"
              step={25000}
              placeholder="250000"
            />

            <NumericInput
              label="Épargne (% du salaire)"
              value={formData.salarySavePct}
              onChange={(value) => updateField('salarySavePct', value)}
              icon="%"
              suffix="%"
              step={5}
              placeholder="10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Logement */}
      <Card>
        <CardHeader>
          <CardTitle>🏠 Logement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <NumericInput
              label="Loyer mensuel (XAF)"
              value={formData.rentMonthly}
              onChange={(value) => updateField('rentMonthly', value)}
              icon="H"
              step={25000}
              placeholder="35000"
            />

            {/* Toggle Marge Loyer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marge de sécurité loyer
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => updateField('rentMarginPct', 5)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.rentMarginPct === 5
                      ? 'border-green-500 bg-green-50 text-green-900'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-green-300'
                  }`}
                >
                  <div className="text-lg font-bold">5%</div>
                  <div className="text-xs">Conservative</div>
                </button>
                
                <button
                  onClick={() => updateField('rentMarginPct', 10)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.rentMarginPct === 10
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="text-lg font-bold">10%</div>
                  <div className="text-xs">Recommandé</div>
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budgets par Catégorie */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Budgets par Catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NumericInput
              label="Nutrition (XAF/mois)"
              value={formData.nutritionBudget}
              onChange={(value) => updateField('nutritionBudget', value)}
              icon="A"
              step={5000}
              placeholder="50000"
            />

            <NumericInput
              label="Transport (XAF/mois)"
              value={formData.transportBudget}
              onChange={(value) => updateField('transportBudget', value)}
              icon="T"
              step={5000}
              placeholder="32550"
            />

            <NumericInput
              label="Eau & Électricité (XAF/mois)"
              value={formData.utilitiesBudget}
              onChange={(value) => updateField('utilitiesBudget', value)}
              icon="⚡"
              step={5000}
              placeholder="25000"
            />

            <NumericInput
              label="Santé & Beauté (XAF/mois)"
              value={formData.healthBeautyBudget}
              onChange={(value) => updateField('healthBeautyBudget', value)}
              icon="💊"
              step={2500}
              placeholder="15000"
            />

            <NumericInput
              label="Téléphone & Internet (XAF/mois)"
              value={formData.phoneInternetBudget}
              onChange={(value) => updateField('phoneInternetBudget', value)}
              icon="📱"
              step={2500}
              placeholder="12500"
            />

            <NumericInput
              label="Loisirs (XAF/mois)"
              value={formData.leisureBudget}
              onChange={(value) => updateField('leisureBudget', value)}
              icon="🎮"
              step={5000}
              placeholder="20000"
            />

            <NumericInput
              label="Divers (XAF/mois)"
              value={formData.diversBudget}
              onChange={(value) => updateField('diversBudget', value)}
              icon="📦"
              step={2500}
              placeholder="15000"
            />

            <NumericInput
              label="Poche Monsieur (XAF/mois)"
              value={formData.pocketMonsieurBudget}
              onChange={(value) => updateField('pocketMonsieurBudget', value)}
              icon="👨"
              step={5000}
              placeholder="25000"
            />

            <NumericInput
              label="Poche Madame (XAF/mois)"
              value={formData.pocketMadameBudget}
              onChange={(value) => updateField('pocketMadameBudget', value)}
              icon="👩"
              step={5000}
              placeholder="25000"
            />

            <NumericInput
              label="Aide à la famille (XAF/mois)"
              value={formData.familyAidBudget}
              onChange={(value) => updateField('familyAidBudget', value)}
              icon="👨‍👩‍👧‍👦"
              step={5000}
              placeholder="30000"
            />
          </div>
        </CardContent>
      </Card>

      {/* Résumé Budgétaire */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Résumé Budgétaire</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">Loyer (+{formData.rentMarginPct}%)</div>
                <div className="text-lg font-bold">{formatCurrencyXAF(calculatedBudgets.rent, { showCurrency: false })}</div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">Épargne ({formData.salarySavePct}%)</div>
                <div className="text-lg font-bold">{formatCurrencyXAF(calculatedBudgets.savings, { showCurrency: false })}</div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">Autres Budgets</div>
                <div className="text-lg font-bold">{formatCurrencyXAF(totalBudgets - calculatedBudgets.rent - calculatedBudgets.savings, { showCurrency: false })}</div>
              </div>
            </div>
            
            <hr />
            
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold">Total Budgets :</span>
              <span className="font-bold">{formatCurrencyXAF(totalBudgets, { showCurrency: false })} XAF</span>
            </div>
            
            <div className={`flex justify-between items-center p-4 rounded-lg text-lg ${
              budgetBalance >= 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              <span className="font-semibold">
                {budgetBalance >= 0 ? 'Reste Disponible :' : 'Dépassement :'}
              </span>
              <span className="font-bold">
                {formatCurrencyXAF(Math.abs(budgetBalance), { showCurrency: false })} XAF
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex space-x-3">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          variant="primary"
          className="flex-1"
        >
          {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>

      {/* Status */}
      {saveSuccess && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center text-green-800">
              <span className="mr-2">✓</span>
              <span className="text-sm font-medium">Configuration sauvegardée !</span>
            </div>
          </CardContent>
        </Card>
      )}

      {hasChanges && !saveSuccess && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center text-orange-800">
              <span className="mr-2">⚠</span>
              <span className="text-sm font-medium">Modifications non sauvegardées</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Zone de Reset */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-900">Zone de Test - Reset Données</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dbStats && (
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="text-center p-2 bg-white rounded border">
                  <div className="font-bold text-blue-600">{dbStats.transactions}</div>
                  <div className="text-gray-600">Transactions</div>
                </div>
                <div className="text-center p-2 bg-white rounded border">
                  <div className="font-bold text-green-600">{dbStats.categories}</div>
                  <div className="text-gray-600">Catégories</div>
                </div>
                <div className="text-center p-2 bg-white rounded border">
                  <div className="font-bold text-purple-600">{dbStats.settings}</div>
                  <div className="text-gray-600">Settings</div>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                onClick={handleResetTransactions}
                disabled={isResetting}
                variant="outline"
                className="flex-1 border-orange-300 text-orange-700"
              >
                {isResetting ? 'Reset...' : 'Vider Transactions'}
              </Button>
              
              <Button
                onClick={handleResetDatabase}
                disabled={isResetting}
                variant="danger"
                className="flex-1"
              >
                {isResetting ? 'Reset...' : 'Reset Complet'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
