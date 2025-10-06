// FinanceIQ - Saisie Rapide des Dépenses
// Interface optimisée pour l'ajout de transactions

import { useState, useEffect } from 'react'
import { Button } from '../components/ui'
import ToastContainer from '../components/ToastContainer'
import CustomAmountModal from '../components/CustomAmountModal'
import { useTransactions } from '../hooks/useTransactions'
import { useToast } from '../hooks/useToast'
import { formatCurrencyXAF } from '../utils/format'

export default function QuickAdd() {
  const { transactions, addTransaction } = useTransactions()
  const { toasts, showSuccessToast, showErrorToast, hideToast } = useToast()
  const [todayTotal, setTodayTotal] = useState(0)
  const [todayCount, setTodayCount] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showCustomModal, setShowCustomModal] = useState(false)

  // Calculer les stats du jour
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const todayTransactions = transactions.filter(t => t.date === today)
    setTodayCount(todayTransactions.length)
    setTodayTotal(todayTransactions.reduce((sum, t) => sum + t.amount, 0))
  }, [transactions])

  const handleSuccess = () => {
    setShowSuccess(true)
    
    // Masquer le message après 3s
    setTimeout(() => {
      setShowSuccess(false)
    }, 3000)
  }

  const handleError = (error: string) => {
    console.error('Quick Add Error:', error)
    showErrorToast(error)
  }


  // Handler pour transaction personnalisée
  const handleCustomTransaction = async (amount: number, categoryId: string, categoryName: string, note?: string, date?: string) => {
    try {
      // Créer la transaction
      const transactionData = {
        amount,
        categoryId,
        date: date || new Date().toISOString().split('T')[0], // Utiliser date fournie ou aujourd'hui
        type: 'expense' as const,
        note: note || undefined
      }
      
      // Sauvegarder en DB via le hook
      await addTransaction(transactionData)
      
      // Afficher le toast de succès
      const categoryIcon = getCategoryIcon(categoryId)
      showSuccessToast(amount, categoryName, categoryIcon, note)
      
      // Afficher le message de succès global
      handleSuccess()
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
    <div className="space-y-6 max-w-md mx-auto">
      {/* Header Simple */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Saisie Rapide</h1>
        <p className="text-gray-600">Ajouter une transaction</p>
      </div>

      {/* Message de succès */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-center">
            <div className="font-semibold text-green-900">Transaction ajoutée</div>
          </div>
        </div>
      )}

      {/* Bouton Principal */}
      <div className="text-center py-12">
        <Button 
          variant="primary" 
          size="lg"
          onClick={() => setShowCustomModal(true)}
          className="w-full h-20 text-xl font-semibold"
        >
          + Nouvelle Transaction
        </Button>
      </div>

      {/* Stats du jour */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Aujourd'hui</div>
          <div className="font-semibold text-gray-900">
            {todayCount} transaction{todayCount > 1 ? 's' : ''} • {formatCurrencyXAF(todayTotal)}
          </div>
        </div>
      </div>

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
