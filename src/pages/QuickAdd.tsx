// FinanceIQ - Saisie Rapide des Dépenses
// Interface optimisée pour l'ajout de transactions

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Icon, ActionIcons, StatusIcons } from '../components/ui'
// import QuickAddButtonLarge from '../components/QuickAddButtonLarge' // Plus utilisé
import ToastContainer from '../components/ToastContainer'
import CustomAmountModal from '../components/CustomAmountModal'
// import { useQuickActions } from '../hooks/useQuickActions' // Plus utilisé
import { useTransactions } from '../hooks/useTransactions'
import { useToast } from '../hooks/useToast'
import { formatCurrencyXAF } from '../utils/format'

export default function QuickAdd() {
  const navigate = useNavigate()
  // const { quickActions } = useQuickActions() // Plus utilisé
  const { transactions, addTransaction } = useTransactions()
  const { toasts, showSuccessToast, showErrorToast, hideToast } = useToast()
  const [todayTotal, setTodayTotal] = useState(0)
  const [todayCount, setTodayCount] = useState(0)
  const [lastTransaction, setLastTransaction] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showCustomModal, setShowCustomModal] = useState(false)

  // Calculer les stats du jour
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const todayTransactions = transactions.filter(t => t.date === today)
    setTodayCount(todayTransactions.length)
    setTodayTotal(todayTransactions.reduce((sum, t) => sum + t.amount, 0))
  }, [transactions])

  const handleSuccess = (transactionId: string) => {
    setLastTransaction(transactionId)
    setShowSuccess(true)
    
    // Masquer le message après 3s
    setTimeout(() => {
      setShowSuccess(false)
      setLastTransaction(null)
    }, 3000)
  }

  const handleError = (error: string) => {
    console.error('Quick Add Error:', error)
    showErrorToast(error)
  }


  // Handler pour transaction personnalisée
  const handleCustomTransaction = async (amount: number, categoryId: string, categoryName: string, note?: string) => {
    try {
      // Créer la transaction
      const transactionData = {
        amount,
        categoryId,
        date: new Date().toISOString().split('T')[0],
        type: 'expense' as const,
        note: note || undefined
      }
      
      // Sauvegarder en DB via le hook
      const transactionId = await addTransaction(transactionData)
      
      // Afficher le toast de succès
      const categoryIcon = getCategoryIcon(categoryId)
      showSuccessToast(amount, categoryName, categoryIcon, note)
      
      // Afficher le message de succès global
      handleSuccess(transactionId)
    } catch (error) {
      console.error('❌ Erreur sauvegarde transaction:', error)
      handleError(`Erreur lors de l'ajout: ${error}`)
    }
  }

  // Obtenir l'icône selon la catégorie scientifique
  const getCategoryIcon = (categoryId: string): string => {
    const icons: Record<string, string> = {
      'logement': 'L',
      'alimentation': 'A',
      'transport': 'T',
      'factures': 'F',
      'sante': 'S',
      'vie_courante': 'V',
      'couple': 'C',
      'loisirs': 'L',
      'famille': 'F',
      'education': 'E',
      'dettes': 'D',
      'imprevus': 'I',
      'epargne': 'E'
    }
    return icons[categoryId] || 'X'
  }

  return (
    <div className="space-y-6">
      {/* Header avec stats */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">+ Saisie Rapide</h1>
        <p className="text-gray-600 mb-4">Ajoutez vos dépenses en moins de 3 secondes</p>
        
        <div className="flex justify-center space-x-4">
          <Badge variant="income" size="sm">
            {todayCount} transaction{todayCount > 1 ? 's' : ''} aujourd'hui
          </Badge>
          <Badge variant="expense" size="sm">
            {formatCurrencyXAF(todayTotal)} dépensés
          </Badge>
        </div>
      </div>

      {/* Message de succès global */}
      {showSuccess && (
        <Card className="bg-green-50 border-green-200 animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-3">
              <Icon name={StatusIcons.success} className="text-green-600" size="lg" />
              <div className="text-center">
                <div className="font-semibold text-green-900">Transaction ajoutée !</div>
                <div className="text-sm text-green-700">
                  ID: {lastTransaction?.slice(0, 8)}...
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saisie Principale */}
      <Card>
        <CardHeader>
          <CardTitle>Ajouter une Dépense</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-4 text-blue-600">+</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nouvelle Transaction
            </h3>
            <p className="text-gray-600 mb-6">
              Cliquez pour saisir le montant et la catégorie de votre dépense
            </p>
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => setShowCustomModal(true)}
              className="px-8 py-4 flex items-center space-x-2"
            >
              <Icon name={ActionIcons.add} size="sm" />
              <span>Saisir une dépense</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions secondaires */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            <Button 
              variant="outline" 
              className="h-16 flex-col space-y-1"
              onClick={() => navigate('/budgets')}
            >
              <Icon name={ActionIcons.next} size="lg" />
              <span className="text-sm">Voir mes budgets</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conseils UX */}
      <Card variant="outlined" className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="text-center">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center space-x-2">
              <Icon name={StatusIcons.info} size="sm" />
              <span>Conseil</span>
            </h3>
            <p className="text-sm text-blue-700">
              Saisissez vos dépenses dès qu'elles arrivent pour un suivi précis. 
              Choisissez la bonne catégorie pour des budgets plus utiles !
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Container des Toasts */}
      <ToastContainer toasts={toasts} onClose={hideToast} />

      {/* Modal Montant Personnalisé */}
      <CustomAmountModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onSubmit={handleCustomTransaction}
      />
    </div>
  )
}
