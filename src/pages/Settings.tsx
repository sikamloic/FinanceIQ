// FinanceIQ - Configuration Intelligente
// Paramétrage scientifique des budgets optimaux

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui'
import NumericInput from '../components/NumericInput'
import DataPrivacyModal from '../components/DataPrivacyModal'
import { formatCurrencyXAF } from '../utils/format'
import { BUDGET_RULES, calculateBudgetAmount, getBudgetValidation } from '../types/budgetRules'
import { resetDatabase, resetTransactionsOnly, showDatabaseStats } from '../utils/resetDatabase'
import { migrateToScientificCategories, needsMigration } from '../utils/migrateCategories'

interface ScientificBudgetData {
  salary: number
  budgets: Record<string, number> // categoryId -> amount
}

export default function SettingsScientific() {
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<ScientificBudgetData>({
    salary: 0,
    budgets: {}
  })
  
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [originalData, setOriginalData] = useState<ScientificBudgetData | null>(null)
  const [isResetting, setIsResetting] = useState(false)
  const [dbStats, setDbStats] = useState<{ transactions: number; categories: number; settings: number } | null>(null)
  const [useRecommended, setUseRecommended] = useState(true)
  const [needsCategoryMigration, setNeedsCategoryMigration] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  // Initialiser les budgets avec les valeurs recommandées
  const initializeBudgets = (salary: number, useRecommendedValues: boolean = true) => {
    if (salary <= 0) return {}
    
    const budgets: Record<string, number> = {}
    
    BUDGET_RULES.forEach(category => {
      const percentage = useRecommendedValues ? category.recommendedPercentage : category.maxPercentage
      budgets[category.id] = calculateBudgetAmount(salary, percentage)
    })
    
    return budgets
  }

  // Charger les settings existants
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { db } = await import('../data/db')
        const currentSettings = await db.settings.get('singleton')
        
        let budgets = {}
        let salary = 0

        if (currentSettings && currentSettings.salary > 0) {
          salary = currentSettings.salary
          
          // Prioriser les nouvelles catégories scientifiques si elles existent
          if (currentSettings.scientificBudgets) {
            budgets = currentSettings.scientificBudgets
          } else {
            // Fallback : mapper les anciens champs vers les nouvelles catégories
            budgets = {
              logement: Math.round((currentSettings.rentMonthly || 0) * 1.1), // Ajouter marge
              alimentation: currentSettings.nutritionBudget || calculateBudgetAmount(salary, 8.5),
              transport: currentSettings.transportBudget || calculateBudgetAmount(salary, 6),
              factures: currentSettings.utilitiesBudget || calculateBudgetAmount(salary, 6),
              sante: currentSettings.healthBeautyBudget || calculateBudgetAmount(salary, 4),
              vie_courante: currentSettings.diversBudget || calculateBudgetAmount(salary, 3.5),
              couple: (currentSettings.pocketMonsieurBudget || 0) + (currentSettings.pocketMadameBudget || 0) || calculateBudgetAmount(salary, 4),
              loisirs: currentSettings.leisureBudget || calculateBudgetAmount(salary, 1.5),
              famille: currentSettings.familyAidBudget || calculateBudgetAmount(salary, 2.5),
              education: calculateBudgetAmount(salary, 2.5),
              dettes: calculateBudgetAmount(salary, 5),
              imprevus: calculateBudgetAmount(salary, 3.5),
              epargne: Math.round(salary * (currentSettings.salarySavePct || 20) / 100)
            }
          }
        }

        const settingsData = { salary, budgets }
        setOriginalData(settingsData)
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
    if (originalData) {
      const hasChanged = JSON.stringify(formData) !== JSON.stringify(originalData)
      setHasChanges(hasChanged)
    }
  }, [formData, originalData])

  // Calculer les totaux et validations
  const totalBudgets = Object.values(formData.budgets).reduce((sum, amount) => sum + amount, 0)
  const totalExpenses = Object.entries(formData.budgets)
    .filter(([categoryId]) => categoryId !== 'epargne')
    .reduce((sum, [, amount]) => sum + amount, 0)
  const budgetBalance = formData.salary - totalBudgets
  const expensePercentage = formData.salary > 0 ? (totalExpenses / formData.salary) * 100 : 0
  const savingsPercentage = formData.salary > 0 ? ((formData.budgets.epargne || 0) / formData.salary) * 100 : 0
  const hasSalary = formData.salary > 0

  // Mettre à jour le salaire et recalculer tous les budgets
  const updateSalary = (newSalary: number) => {
    const newBudgets = initializeBudgets(newSalary, useRecommended)
    setFormData({ salary: newSalary, budgets: newBudgets })
  }

  // Mettre à jour un budget spécifique
  const updateBudget = (categoryId: string, amount: number) => {
    setFormData(prev => ({
      ...prev,
      budgets: { ...prev.budgets, [categoryId]: amount }
    }))
  }

  // Appliquer les valeurs recommandées/maximales
  const applyPreset = (useRecommendedValues: boolean) => {
    const newBudgets = initializeBudgets(formData.salary, useRecommendedValues)
    setFormData(prev => ({ ...prev, budgets: newBudgets }))
    setUseRecommended(useRecommendedValues)
  }

  // Sauvegarder
  const handleSave = async () => {
    if (formData.salary <= 0) {
      alert('Veuillez saisir un salaire valide avant de sauvegarder')
      return
    }
    
    setIsSaving(true)
    try {
      const { db } = await import('../data/db')
      
      // Sauvegarder les nouvelles catégories scientifiques
      const settingsToSave = {
        id: 'singleton' as const,
        salary: formData.salary,
        
        // Compatibilité ancienne version
        rentMonthly: Math.round(formData.budgets.logement * 0.65), // Loyer sans marge
        rentMarginPct: 10 as const,
        salarySavePct: Math.round((formData.budgets.epargne / formData.salary) * 100),
        
        // Nouvelles catégories scientifiques
        scientificBudgets: formData.budgets,
        
        // Mapping pour compatibilité
        nutritionBudget: formData.budgets.alimentation || 0,
        transportBudget: formData.budgets.transport || 0,
        utilitiesBudget: formData.budgets.factures || 0,
        healthBeautyBudget: formData.budgets.sante || 0,
        phoneInternetBudget: Math.round((formData.budgets.factures || 0) * 0.4),
        leisureBudget: formData.budgets.loisirs || 0,
        diversBudget: formData.budgets.vie_courante || 0,
        pocketMonsieurBudget: Math.round((formData.budgets.couple || 0) * 0.4),
        pocketMadameBudget: Math.round((formData.budgets.couple || 0) * 0.4),
        familyAidBudget: formData.budgets.famille || 0,
        
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await db.settings.put(settingsToSave)
      
      setOriginalData(formData)
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

  // Reset functions (réutilisées)
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

  const loadDbStats = async () => {
    try {
      const stats = await showDatabaseStats()
      setDbStats(stats)
    } catch (error) {
      console.error('Erreur stats:', error)
    }
  }

  // Fonction de test pour recharger les settings
  const handleReloadSettings = async () => {
    setIsLoading(true)
    try {
      const { db } = await import('../data/db')
      const currentSettings = await db.settings.get('singleton')
      
      if (currentSettings && currentSettings.salary > 0) {
        const settingsData = {
          salary: currentSettings.salary,
          budgets: currentSettings.scientificBudgets || {}
        }
        setOriginalData(settingsData)
        setFormData(settingsData)
      }
    } catch (error) {
      console.error('Erreur rechargement:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction de migration des catégories
  const handleMigrateCategories = async () => {
    if (!confirm('Migrer vers les nouvelles catégories scientifiques ? Cela remplacera les anciennes catégories.')) return
    
    setIsResetting(true)
    try {
      await migrateToScientificCategories()
      await loadDbStats()
      setNeedsCategoryMigration(false)
      alert('✅ Migration réussie ! Les nouvelles catégories scientifiques sont disponibles.')
    } catch (error) {
      console.error('Erreur migration:', error)
      alert('❌ Erreur lors de la migration')
    } finally {
      setIsResetting(false)
    }
  }

  // Vérifier si migration nécessaire
  const checkMigration = async () => {
    try {
      const needs = await needsMigration()
      setNeedsCategoryMigration(needs)
    } catch (error) {
      console.error('Erreur vérification migration:', error)
    }
  }

  useEffect(() => {
    loadDbStats()
    checkMigration()
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Budgétaire Scientifique</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-gray-600">
              Répartition optimale basée sur les meilleures pratiques financières
            </p>
            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
              <strong>Objectif :</strong> Dépenses &le; 75% • Épargne &ge; 25% • Logement &le; 20%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salaire et Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Salaire et Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <NumericInput
                label="Salaire mensuel (XAF) *"
                value={formData.salary}
                onChange={updateSalary}
                icon="$"
                step={25000}
                placeholder="Saisissez votre salaire"
                error={formData.salary <= 0 ? "Le salaire est obligatoire pour calculer les budgets" : undefined}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Configuration automatique
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => applyPreset(true)}
                    variant={useRecommended ? "primary" : "outline"}
                    size="sm"
                    disabled={!hasSalary}
                  >
                    Recommandé
                  </Button>
                  <Button
                    onClick={() => applyPreset(false)}
                    variant={!useRecommended ? "primary" : "outline"}
                    size="sm"
                    disabled={!hasSalary}
                  >
                    Maximum
                  </Button>
                </div>
                {!hasSalary && (
                  <p className="text-sm text-gray-500 mt-2">
                    Saisissez d'abord votre salaire pour activer la configuration automatique
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message si pas de salaire */}
      {!hasSalary && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="text-center text-blue-800">
              <p className="font-medium">Configuration des budgets</p>
              <p className="text-sm mt-1">
                Saisissez votre salaire mensuel ci-dessus pour calculer automatiquement vos budgets optimaux selon les règles scientifiques.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budgets par Catégorie */}
      {hasSalary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {BUDGET_RULES.map((category) => {
          const amount = formData.budgets[category.id] || 0
          const validation = getBudgetValidation(formData.salary, category.id, amount)
          
          return (
            <Card key={category.id} className="relative">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center space-x-2">
                  <span>{category.name}</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    &le;{category.maxPercentage}%
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <NumericInput
                    label={`Budget mensuel (${validation.percentage.toFixed(1)}%)`}
                    value={amount}
                    onChange={(value) => updateBudget(category.id, value)}
                    icon="$"
                    step={category.id === 'epargne' ? 10000 : 5000}
                    error={validation.level === 'error' ? validation.message : undefined}
                    warning={validation.level === 'warning' ? validation.message : undefined}
                  />
                  
                  {/* Sous-catégories */}
                  <div className="text-xs text-gray-600 space-y-1">
                    {category.subcategories.slice(0, 3).map(sub => (
                      <div key={sub.id} className="flex justify-between">
                        <span>- {sub.name}</span>
                        <span>&le;{sub.maxPercentage}%</span>
                      </div>
                    ))}
                    {category.subcategories.length > 3 && (
                      <div className="text-gray-500">
                        +{category.subcategories.length - 3} autres...
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        </div>
      )}

      {/* Résumé Global */}
      {hasSalary && (
        <Card>
        <CardHeader>
          <CardTitle>Résumé Budgétaire</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrencyXAF(formData.salary, { showCurrency: false })}
                </div>
                <div className="text-sm text-gray-600">Salaire</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrencyXAF(totalExpenses, { showCurrency: false })}
                </div>
                <div className="text-sm text-gray-600">Total Dépenses ({expensePercentage.toFixed(1)}%)</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrencyXAF(formData.budgets.epargne || 0, { showCurrency: false })}
                </div>
                <div className="text-sm text-gray-600">Épargne ({savingsPercentage.toFixed(1)}%)</div>
              </div>
              
              <div className={`text-center p-4 rounded-lg ${
                budgetBalance >= 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                <div className="text-2xl font-bold">
                  {formatCurrencyXAF(Math.abs(budgetBalance), { showCurrency: false })}
                </div>
                <div className="text-sm">
                  {budgetBalance >= 0 ? 'Surplus' : 'Déficit'}
                </div>
              </div>
            </div>

            {/* Messages éducatifs */}
            <div className="space-y-2">
              {expensePercentage > 75 && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-sm text-red-800">
                  <strong>Attention :</strong> Total dépenses {expensePercentage.toFixed(1)}% &gt; 75% recommandé
                </div>
              )}
              
              {savingsPercentage < 25 && (
                <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg text-sm text-orange-800">
                  <strong>Épargne insuffisante :</strong> {savingsPercentage.toFixed(1)}% &lt; 25% recommandé
                </div>
              )}
              
              {formData.budgets.logement / formData.salary > 0.20 && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-sm text-red-800">
                  <strong>Logement trop cher :</strong> {((formData.budgets.logement / formData.salary) * 100).toFixed(1)}% &gt; 20% max
                </div>
              )}
            </div>
          </div>
        </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex space-x-3">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving || !hasSalary}
          variant="primary"
          className="flex-1"
        >
          {isSaving ? 'Sauvegarde...' : 'Sauvegarder Configuration'}
        </Button>
      </div>

      {/* Status Messages */}
      {saveSuccess && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center text-green-800">
              <span className="text-sm font-medium">Configuration scientifique sauvegardée !</span>
            </div>
          </CardContent>
        </Card>
      )}

      {hasChanges && !saveSuccess && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center text-orange-800">
              <span className="text-sm font-medium">Modifications non sauvegardées</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Zone de Reset */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-900">Zone de Test</CardTitle>
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

            {needsCategoryMigration && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-800 mb-4">
                <strong>Migration nécessaire :</strong> Anciennes catégories détectées. Migrez vers les nouvelles catégories scientifiques.
              </div>
            )}

            <div className="space-y-2">
              {needsCategoryMigration && (
                <Button
                  onClick={handleMigrateCategories}
                  disabled={isResetting}
                  variant="primary"
                  className="w-full"
                >
                  {isResetting ? 'Migration...' : 'Migrer Catégories'}
                </Button>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button
                  onClick={handleReloadSettings}
                  disabled={isLoading}
                  variant="outline"
                  className="border-blue-300 text-blue-700"
                >
                  {isLoading ? 'Chargement...' : 'Recharger'}
                </Button>
                
                <Button
                  onClick={() => setShowPrivacyModal(true)}
                  variant="outline"
                  className="border-gray-300 text-gray-700"
                >
                  🔒 Confidentialité
                </Button>
                
                <Button
                  onClick={handleResetTransactions}
                  disabled={isResetting}
                  variant="outline"
                  className="border-orange-300 text-orange-700"
                >
                  {isResetting ? 'Reset...' : 'Vider Transactions'}
                </Button>
              </div>
              
              <Button
                onClick={handleResetDatabase}
                disabled={isResetting}
                variant="danger"
                className="w-full"
              >
                {isResetting ? 'Reset...' : 'Reset Complet'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Confidentialité */}
      <DataPrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onAccept={() => setShowPrivacyModal(false)}
      />
    </div>
  )
}
