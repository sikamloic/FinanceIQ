// Budget Douala - Bouton Quick Add Large pour Mobile
// I3.2 - Page Quick Add avec 3 Boutons

import { useState } from 'react'
import { formatCurrencyXAF } from '../utils/format'
import { useTransactions, createQuickTransaction } from '../hooks/useTransactions'

interface QuickAddButtonLargeProps {
  amount: number
  categoryId: string
  categoryName: string
  icon: string
  note?: string
  color: 'blue' | 'green' | 'purple' | 'orange'
  onSuccess?: (transactionId: string) => void
  onError?: (error: string) => void
  showToast?: (amount: number, categoryName: string, icon: string, note?: string) => void
}

export default function QuickAddButtonLarge({
  amount,
  categoryId,
  categoryName,
  icon,
  note = '',
  color,
  onSuccess,
  onError,
  showToast
}: QuickAddButtonLargeProps) {
  
  const { addTransaction } = useTransactions()
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  // Couleurs par type
  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    green: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    purple: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
    orange: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
  }

  const handleQuickAdd = async () => {
    try {
      setIsAdding(true)
      
      // Créer la transaction
      const transaction = createQuickTransaction(
        amount,
        categoryId,
        note || `${categoryName} - Saisie rapide`
      )
      
      // Ajouter via notre hook
      const transactionId = await addTransaction(transaction)
      
      // Afficher le toast de confirmation
      showToast?.(amount, categoryName, icon, note)
      
      // Feedback succès
      setJustAdded(true)
      onSuccess?.(transactionId)
      
      setIsAdding(false)
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur lors de l\'ajout'
      onError?.(errorMsg)
      console.error('❌ Quick Add Large Error:', errorMsg)
      setIsAdding(false)
    }
  }

  return (
    <button
      onClick={handleQuickAdd}
      disabled={isAdding}
      className={`
        w-full p-6 rounded-2xl text-white font-semibold shadow-lg
        transition-all duration-200 transform
        focus:outline-none focus:ring-4 focus:ring-opacity-50
        active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        ${colorClasses[color]}
        ${justAdded ? 'ring-4 ring-white ring-opacity-50 scale-105' : ''}
        ${isAdding ? 'animate-pulse' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{icon}</span>
          <span className="text-xl font-bold">{categoryName}</span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">
            +{formatCurrencyXAF(amount, { showCurrency: false })}
          </div>
          <div className="text-sm opacity-90">XAF</div>
        </div>
      </div>
      
      <div className="text-left">
        {isAdding ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm opacity-90">Ajout en cours...</span>
          </div>
        ) : justAdded ? (
          <div className="flex items-center space-x-2">
            <span className="text-lg">✅</span>
            <span className="text-sm opacity-90">Ajouté avec succès !</span>
          </div>
        ) : (
          <div className="text-sm opacity-90">
            {note || 'Appuyez pour ajouter cette dépense'}
          </div>
        )}
      </div>
    </button>
  )
}
