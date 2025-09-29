// Budget Douala - Composant Quick Add Button
// I3.1 - Bouton Quick Add Simple

import { useState } from 'react'
import { Button, Badge } from './ui'
import { formatCurrencyXAF } from '../utils/format'
import { useTransactions, createQuickTransaction } from '../hooks/useTransactions'

interface QuickAddButtonProps {
  amount: number
  categoryId: string
  categoryName: string
  icon: string
  note?: string
  color?: 'primary' | 'success' | 'danger'
  onSuccess?: (transactionId: string) => void
  onError?: (error: string) => void
  className?: string
}

export default function QuickAddButton({
  amount,
  categoryId,
  categoryName,
  icon,
  note = '',
  color = 'primary',
  onSuccess,
  onError,
  className
}: QuickAddButtonProps) {
  
  const { addTransaction } = useTransactions()
  const [isAdding, setIsAdding] = useState(false)
  const [lastAdded, setLastAdded] = useState<Date | null>(null)

  const handleQuickAdd = async () => {
    try {
      setIsAdding(true)
      
      // Créer la transaction avec nos utilitaires
      const transaction = createQuickTransaction(
        amount,
        categoryId,
        note || `${categoryName} - Saisie rapide`
      )
      
      // Ajouter via notre hook
      const transactionId = await addTransaction(transaction)
      
      // Feedback succès
      setLastAdded(new Date())
      onSuccess?.(transactionId)
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur lors de l\'ajout'
      onError?.(errorMsg)
      console.error('❌ Quick Add Error:', errorMsg)
    } finally {
      setIsAdding(false)
    }
  }

  // Animation de succès (disparaît après 2s)
  const showSuccess = lastAdded && (Date.now() - lastAdded.getTime()) < 2000

  return (
    <div className={`relative ${className}`}>
      <Button
        variant={color}
        size="lg"
        onClick={handleQuickAdd}
        isLoading={isAdding}
        disabled={isAdding}
        className={`w-full h-20 flex-col space-y-1 text-left transition-all duration-200 ${
          showSuccess ? 'ring-2 ring-green-500 ring-opacity-50' : ''
        }`}
      >
        {/* Ligne du haut : Icône + Montant */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{icon}</span>
            <span className="font-semibold">{categoryName}</span>
          </div>
          <div className="text-xl font-bold">
            +{formatCurrencyXAF(amount, { showCurrency: false })}
          </div>
        </div>
        
        {/* Ligne du bas : Note ou status */}
        <div className="w-full text-left">
          {isAdding ? (
            <span className="text-sm opacity-75">Ajout en cours...</span>
          ) : showSuccess ? (
            <span className="text-sm opacity-90">✅ Ajouté avec succès</span>
          ) : (
            <span className="text-sm opacity-75">
              {note || 'Appuyez pour ajouter'}
            </span>
          )}
        </div>
      </Button>

      {/* Badge de feedback rapide */}
      {showSuccess && (
        <div className="absolute -top-2 -right-2 animate-bounce">
          <Badge variant="income" size="sm">
            ✅
          </Badge>
        </div>
      )}
    </div>
  )
}
