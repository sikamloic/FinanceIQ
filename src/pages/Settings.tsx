// Budget Douala - Page Settings
// I6.1 - Interface configuration paramètres financiers

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui'
import NumericInput from '../components/NumericInput'
// Import useSettings supprimé - chargement direct depuis IndexedDB
import { formatCurrencyXAF } from '../utils/format'
import {
  calculateRentFund,
  calculateTransportBudget,
  calculateFoodBudget,
  calculateDataBudget
} from '../utils/calculations'
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

export default function Settings() {
  // Suppression useSettings - chargement direct depuis IndexedDB
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
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [warnings, setWarnings] = useState<Record<string, string>>({})
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [originalSettings, setOriginalSettings] = useState<SettingsFormData | null>(null)
  const [marginChanged, setMarginChanged] = useState(false)
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

        if (currentSettings) {
          console.log('Settings chargés depuis IndexedDB:', currentSettings)
        } else {
          console.log('Aucun settings trouvé, utilisation des valeurs par défaut')
        }

        // Sauvegarder les settings originaux pour détecter les changements
        setOriginalSettings(settingsData)
        setFormData(settingsData)
        setIsLoading(false)

        // Test des calculs pour validation I6.3
        console.log('Test calculs marge loyer:')
        console.log('  Loyer 35000 XAF + 5% =', calculateRentFund(35000, 5), 'XAF (attendu: 36750)')
        console.log('  Loyer 35000 XAF + 10% =', calculateRentFund(35000, 10), 'XAF (attendu: 38500)')
      } catch (error) {
        console.error('Erreur chargement settings:', error)
        // Garder les valeurs par défaut en cas d'erreur
        setIsLoading(false)
      }
    }

    // Charger directement depuis IndexedDB plutôt que d'attendre le hook useSettings
    loadSettings()
  }, [])

  // Détecter les changements et valider
  useEffect(() => {
    if (originalSettings) {
      const hasChanged = 
        formData.salary !== originalSettings.salary ||
        formData.rentMonthly !== originalSettings.rentMonthly ||
        formData.rentMarginPct !== originalSettings.rentMarginPct ||
        formData.salarySavePct !== originalSettings.salarySavePct ||
        formData.nutritionBudget !== originalSettings.nutritionBudget ||
        formData.transportBudget !== originalSettings.transportBudget ||
        formData.utilitiesBudget !== originalSettings.utilitiesBudget ||
        formData.healthBeautyBudget !== originalSettings.healthBeautyBudget ||
        formData.phoneInternetBudget !== originalSettings.phoneInternetBudget ||
        formData.leisureBudget !== originalSettings.leisureBudget ||
        formData.diversBudget !== originalSettings.diversBudget ||
        formData.pocketMonsieurBudget !== originalSettings.pocketMonsieurBudget ||
        formData.pocketMadameBudget !== originalSettings.pocketMadameBudget ||
        formData.familyAidBudget !== originalSettings.familyAidBudget
      
      setHasChanges(hasChanged)
      console.log('🔍 Détection changements:', { hasChanged, formData, originalSettings })
    }
    
    // Valider les données actuelles
    validateData(formData)
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

  // Valider les données avec erreurs et avertissements
  const validateData = (data: SettingsFormData) => {
    const newErrors: Record<string, string> = {}
    const newWarnings: Record<string, string> = {}
    
    // Validation basique du salaire (erreur bloquante)
    if (data.salary <= 0) {
      newErrors.salary = 'Le salaire doit être supérieur à 0'
      setErrors(newErrors)
      setWarnings({})
      return false
    }
    
    // Recalculer les budgets avec les nouvelles données
    const tempBudgets = {
      rent: calculateRentFund(data.rentMonthly, data.rentMarginPct),
      transport: calculateTransportBudget(data.transportDaily),
      food: calculateFoodBudget(4000), // Valeur par défaut
      data: calculateDataBudget(20000, 5000), // Valeurs par défaut
      savings: Math.round(data.salary * data.salarySavePct / 100)
    }
    
    const totalBudgets = Object.values(tempBudgets).reduce((sum, val) => sum + val, 0)
    
    // Avertissements (non bloquants) - Pourcentages recommandés
    
    // Loyer > 30% = avertissement, > 50% = erreur
    const rentPercentage = (data.rentMonthly / data.salary) * 100
    if (rentPercentage > 50) {
      newErrors.rentMonthly = `! Loyer critique : ${rentPercentage.toFixed(1)}% du salaire (max recommandé: 30%)`
    } else if (rentPercentage > 30) {
      newWarnings.rentMonthly = `! Loyer élevé : ${rentPercentage.toFixed(1)}% du salaire (recommandé: ≤30%)`
    }
    
    // Transport > 10% = avertissement, > 20% = erreur
    const monthlyTransport = data.transportDaily * 21.7
    const transportPercentage = (monthlyTransport / data.salary) * 100
    if (transportPercentage > 20) {
      newErrors.transportDaily = `! Transport critique : ${transportPercentage.toFixed(1)}% du salaire (max recommandé: 10%)`
    } else if (transportPercentage > 10) {
      newWarnings.transportDaily = `! Transport élevé : ${transportPercentage.toFixed(1)}% du salaire (recommandé: ≤10%)`
    }
    
    // Épargne < 10% = avertissement
    if (data.salarySavePct < 10) {
      newWarnings.salarySavePct = `i Épargne faible : ${data.salarySavePct}% (recommandé: ≥10% pour la sécurité financière)`
    }
    
    // Total budgets > salaire = erreur bloquante
    if (totalBudgets > data.salary) {
      const deficit = totalBudgets - data.salary
      newErrors.salary = `X Déficit budgétaire : ${formatCurrencyXAF(deficit, { showCurrency: false })} XAF (budgets > salaire)`
    }
    
    setErrors(newErrors)
    setWarnings(newWarnings)
    return Object.keys(newErrors).length === 0
  }

  // Mettre à jour un champ
  const updateField = (field: keyof SettingsFormData, value: number) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    
    // Animation spéciale pour le changement de marge
    if (field === 'rentMarginPct') {
      setMarginChanged(true)
      setTimeout(() => setMarginChanged(false), 1000)
    }
  }

  // Sauvegarder les modifications
  const handleSave = async () => {
    // Vérifier qu'il n'y a pas d'erreurs bloquantes
    if (!validateData(formData)) {
      return
    }

    setIsSaving(true)
    try {
      // Importer la DB
      const { db } = await import('../data/db')
      
      // Récupérer les settings existants ou créer nouveaux
      let currentSettings = await db.settings.get('singleton')
      
      if (!currentSettings) {
        // Créer nouveaux settings
        currentSettings = {
          id: 'singleton',
          salary: formData.salary,
          rentMonthly: formData.rentMonthly,
          rentMarginPct: formData.rentMarginPct,
          transportDaily: formData.transportDaily,
          salarySavePct: formData.salarySavePct,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      } else {
        // Mettre à jour settings existants
        currentSettings = {
          ...currentSettings,
          salary: formData.salary,
          rentMonthly: formData.rentMonthly,
          rentMarginPct: formData.rentMarginPct,
          transportDaily: formData.transportDaily,
          salarySavePct: formData.salarySavePct,
          updatedAt: new Date().toISOString()
        }
      }
      
      // Sauvegarder en IndexedDB
      await db.settings.put(currentSettings)
      
      console.log('Settings sauvegardés avec succès:', currentSettings)
      
      // Mettre à jour les settings originaux avec les nouvelles valeurs
      setOriginalSettings(formData)
      
      // Réinitialiser l'état des changements
      setHasChanges(false)
      
      // Feedback visuel de succès
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000) // Disparaît après 3s
      
    } catch (error) {
      console.error('Erreur sauvegarde settings:', error)
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.')
    } finally {
      setIsSaving(false)
    }
  }

  // Reset aux valeurs par défaut
  const handleReset = async () => {
    try {
      // Importer les valeurs par défaut
      const { DEFAULT_SETTINGS } = await import('../types')
      
      setFormData({
        salary: DEFAULT_SETTINGS.salary,
        rentMonthly: DEFAULT_SETTINGS.rentMonthly,
        rentMarginPct: DEFAULT_SETTINGS.rentMarginPct,
        transportDaily: DEFAULT_SETTINGS.transportDaily,
        salarySavePct: DEFAULT_SETTINGS.salarySavePct
      })
      
      console.log('Reset aux valeurs par défaut:', DEFAULT_SETTINGS)
    } catch (error) {
      console.error('Erreur reset:', error)
      // Fallback valeurs codées en dur
      setFormData({
        salary: 250000,
        rentMonthly: 35000, // Valeur par défaut correcte
        rentMarginPct: 10,
        transportDaily: 1500,
        salarySavePct: 10 // Valeur par défaut correcte
      })
    }
  }

  // Charger les stats de la DB
  const loadDbStats = async () => {
    try {
      const stats = await showDatabaseStats()
      setDbStats(stats)
    } catch (error) {
      console.error('Erreur chargement stats:', error)
    }
  }

  // Reset complet de la base de données
  const handleResetDatabase = async () => {
    if (!confirm('⚠️ ATTENTION : Cette action va supprimer TOUTES vos données (transactions, settings). Continuer ?')) {
      return
    }

    setIsResetting(true)
    try {
      await resetDatabase()
      alert('✅ Base de données réinitialisée avec succès !')
      
      // Recharger la page pour refléter les changements
      window.location.reload()
    } catch (error) {
      console.error('Erreur reset DB:', error)
      alert('❌ Erreur lors du reset de la base de données')
    } finally {
      setIsResetting(false)
    }
  }

  // Reset uniquement des transactions
  const handleResetTransactions = async () => {
    if (!confirm('Supprimer toutes les transactions ? (Les settings seront conservés)')) {
      return
    }

    setIsResetting(true)
    try {
      await resetTransactionsOnly()
      await loadDbStats()
      alert('✅ Transactions supprimées avec succès !')
    } catch (error) {
      console.error('Erreur reset transactions:', error)
      alert('❌ Erreur lors de la suppression des transactions')
    } finally {
      setIsResetting(false)
    }
  }

  // Charger les stats au montage
  useEffect(() => {
    loadDbStats()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
            <div className="text-gray-600">Chargement des paramètres...</div>
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
          <CardTitle className="flex items-center">
            <span className="mr-3">⚙</span>
            Paramètres Financiers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Configurez vos revenus et dépenses pour personnaliser vos budgets
          </p>
        </CardContent>
      </Card>

      {/* Formulaire Principal */}
      <Card>
        <CardHeader>
          <CardTitle>$ Revenus et Charges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Salaire */}
            <NumericInput
              label="Salaire mensuel"
              value={formData.salary}
              onChange={(value) => updateField('salary', value)}
              icon="$"
              min={1} // Juste pour éviter 0 ou négatif
              max={999999999} // Pas de limite réelle
              step={25000}
              placeholder="250000"
            />

            {/* Loyer */}
            <NumericInput
              label="Loyer mensuel"
              value={formData.rentMonthly}
              onChange={(value) => updateField('rentMonthly', value)}
              icon="H"
              min={0}
              max={999999999} // Pas de limite technique
              step={25000}
              placeholder="150000"
              error={errors.rentMonthly}
              warning={warnings.rentMonthly}
            />

            {/* Transport */}
            <NumericInput
              label="Transport quotidien"
              value={formData.transportDaily}
              onChange={(value) => updateField('transportDaily', value)}
              icon="T"
              min={0}
              max={999999999} // Pas de limite technique
              step={250}
              placeholder="1500"
              error={errors.transportDaily}
              warning={warnings.transportDaily}
            />

            {/* Épargne */}
            <NumericInput
              label="Épargne (% du salaire)"
              value={formData.salarySavePct}
              onChange={(value) => updateField('salarySavePct', value)}
              icon="%"
              suffix="%"
              min={0}
              max={100} // Pas de limite technique
              step={5}
              placeholder="20"
              warning={warnings.salarySavePct}
            />
          </div>
        </CardContent>
      </Card>

      {/* Marge Loyer */}
      <Card>
        <CardHeader>
          <CardTitle>H Marge de Sécurité Loyer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-blue-800 text-sm font-medium mb-1">
                i Pourquoi une marge de sécurité ?
              </p>
              <p className="text-blue-700 text-xs">
                Économisez plus que votre loyer pour couvrir les augmentations, réparations et imprévus
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => updateField('rentMarginPct', 5)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  formData.rentMarginPct === 5
                    ? 'border-green-500 bg-green-50 text-green-900 shadow-md'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50'
                }`}
              >
                <div className="text-xl font-bold">5%</div>
                <div className="text-sm font-medium">Conservative</div>
                <div className="text-xs text-gray-600 mt-2">
                  Budget mensuel :
                </div>
                <div className="text-sm font-bold text-green-700">
                  {formatCurrencyXAF(calculateRentFund(formData.rentMonthly, 5), { showCurrency: false })} XAF
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  +{formatCurrencyXAF(Math.round(formData.rentMonthly * 0.05), { showCurrency: false })} de marge
                </div>
              </button>
              
              <button
                onClick={() => updateField('rentMarginPct', 10)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  formData.rentMarginPct === 10
                    ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="text-xl font-bold">10%</div>
                <div className="text-sm font-medium">Recommandé</div>
                <div className="text-xs text-gray-600 mt-2">
                  Budget mensuel :
                </div>
                <div className="text-sm font-bold text-blue-700">
                  {formatCurrencyXAF(calculateRentFund(formData.rentMonthly, 10), { showCurrency: false })} XAF
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  +{formatCurrencyXAF(Math.round(formData.rentMonthly * 0.10), { showCurrency: false })} de marge
                </div>
              </button>
            </div>

            {/* Comparaison des options */}
            <div className={`bg-gray-50 p-3 rounded-lg transition-all duration-500 ${
              marginChanged ? 'bg-yellow-50 border border-yellow-200' : ''
            }`}>
              <div className="text-sm font-medium text-gray-700 mb-2">
                → Impact sur votre budget mensuel :
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="text-center">
                  <div className="font-medium text-green-700">Option 5%</div>
                  <div className="text-gray-600">
                    Économie : {formatCurrencyXAF(calculateRentFund(formData.rentMonthly, 5) - formData.rentMonthly, { showCurrency: false })} XAF/mois
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-blue-700">Option 10%</div>
                  <div className="text-gray-600">
                    Économie : {formatCurrencyXAF(calculateRentFund(formData.rentMonthly, 10) - formData.rentMonthly, { showCurrency: false })} XAF/mois
                  </div>
                </div>
              </div>
              <div className="text-center mt-2 pt-2 border-t border-gray-200">
                <span className="text-xs font-medium text-gray-700">
                  Différence : {formatCurrencyXAF(calculateRentFund(formData.rentMonthly, 10) - calculateRentFund(formData.rentMonthly, 5), { showCurrency: false })} XAF/mois
                </span>
              </div>
              {marginChanged && (
                <div className="text-center mt-2 text-xs text-yellow-700 font-medium">
                  • Calculs mis à jour !
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Budgets */}
      <Card>
        <CardHeader>
          <CardTitle>→ Aperçu des Budgets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span>H Loyer (+{formData.rentMarginPct}%)</span>
                <span className="font-medium">{formatCurrencyXAF(calculatedBudgets.rent, { showCurrency: false })}</span>
              </div>
              
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span>T Transport</span>
                <span className="font-medium">{formatCurrencyXAF(calculatedBudgets.transport, { showCurrency: false })}</span>
              </div>
              
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span>A Alimentation</span>
                <span className="font-medium">{formatCurrencyXAF(calculatedBudgets.food, { showCurrency: false })}</span>
              </div>
              
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span>D Data</span>
                <span className="font-medium">{formatCurrencyXAF(calculatedBudgets.data, { showCurrency: false })}</span>
              </div>
              
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span>% Épargne ({formData.salarySavePct}%)</span>
                <span className="font-medium">{formatCurrencyXAF(calculatedBudgets.savings, { showCurrency: false })}</span>
              </div>
            </div>
            
            <hr className="my-3" />
            
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Budgets</span>
              <span className="font-bold text-lg">{formatCurrencyXAF(totalBudgets, { showCurrency: false })}</span>
            </div>
            
            <div className={`flex justify-between items-center p-3 rounded-lg ${
              budgetBalance >= 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              <span className="font-semibold">
                {budgetBalance >= 0 ? 'Reste Disponible' : 'Dépassement'}
              </span>
              <span className="font-bold text-lg">
                {formatCurrencyXAF(Math.abs(budgetBalance), { showCurrency: false })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex space-x-3">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving || Object.keys(errors).length > 0}
          variant="primary"
          className="flex-1"
        >
          {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
        
        <Button
          onClick={handleReset}
          variant="outline"
          disabled={isSaving}
        >
          ↻ Reset
        </Button>
      </div>

      {/* Status */}
      {saveSuccess && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center text-green-800">
              <span className="mr-2">✓</span>
              <span className="text-sm font-medium">
                Paramètres sauvegardés avec succès !
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {hasChanges && !saveSuccess && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center text-orange-800">
              <span className="mr-2">▲</span>
              <span className="text-sm font-medium">
                Vous avez des modifications non sauvegardées
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Zone de Reset pour Tests Réels */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-900">Zone de Test - Reset Données</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-white p-3 rounded-lg border border-red-200">
              <p className="text-sm text-red-800 mb-3">
                <strong>Pour commencer des tests réels :</strong> Videz les données de test existantes
              </p>
              
              {dbStats && (
                <div className="grid grid-cols-3 gap-4 mb-4 text-xs">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="font-bold text-blue-600">{dbStats.transactions}</div>
                    <div className="text-gray-600">Transactions</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="font-bold text-green-600">{dbStats.categories}</div>
                    <div className="text-gray-600">Catégories</div>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <div className="font-bold text-purple-600">{dbStats.settings}</div>
                    <div className="text-gray-600">Settings</div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleResetTransactions}
                disabled={isResetting}
                variant="outline"
                className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
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

            <div className="text-xs text-red-600 bg-white p-2 rounded border border-red-200">
              <strong>Vider Transactions :</strong> Supprime uniquement les dépenses (garde vos paramètres)<br/>
              <strong>Reset Complet :</strong> Supprime TOUT et remet les valeurs par défaut
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
