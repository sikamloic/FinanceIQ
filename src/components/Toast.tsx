// Budget Douala - Composant Toast
// I3.4 - Toast Confirmation

import { useEffect, useState } from 'react'
import { formatCurrencyXAF } from '../utils/format'

export interface ToastData {
  id: string
  amount: number
  categoryName: string
  categoryIcon: string
  note: string
  type: 'success' | 'error' | 'info'
}

interface ToastProps {
  toast: ToastData
  onClose: (id: string) => void
  duration?: number
}

export default function Toast({ toast, onClose, duration = 3000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Animation d'entrée
    const showTimer = setTimeout(() => setIsVisible(true), 10)
    
    // Auto-dismiss
    const hideTimer = setTimeout(() => {
      setIsLeaving(true)
      setTimeout(() => onClose(toast.id), 300) // Attendre la fin de l'animation
    }, duration)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [toast.id, duration, onClose])

  const handleClick = () => {
    setIsLeaving(true)
    setTimeout(() => onClose(toast.id), 300)
  }

  // Couleurs selon le type
  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-600 border-green-700 text-white'
      case 'error':
        return 'bg-red-600 border-red-700 text-white'
      case 'info':
        return 'bg-blue-600 border-blue-700 text-white'
      default:
        return 'bg-gray-600 border-gray-700 text-white'
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        border-l-4 rounded-lg shadow-lg cursor-pointer
        transform transition-all duration-300 ease-in-out
        ${getToastStyles()}
        ${isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
        }
      `}
    >
      <div className="p-4">
        <div className="flex items-center space-x-3">
          {/* Icône de statut */}
          <div className="flex-shrink-0">
            {toast.type === 'success' && <span className="text-xl">✅</span>}
            {toast.type === 'error' && <span className="text-xl">❌</span>}
            {toast.type === 'info' && <span className="text-xl">ℹ️</span>}
          </div>

          {/* Contenu principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              {/* Montant formaté */}
              <span className="font-bold text-lg">
                {formatCurrencyXAF(toast.amount, { showCurrency: false })} XAF
              </span>
              
              {/* Séparateur */}
              <span className="opacity-75">·</span>
              
              {/* Catégorie avec icône */}
              <div className="flex items-center space-x-1">
                <span className="text-lg">{toast.categoryIcon}</span>
                <span className="font-medium">{toast.categoryName}</span>
              </div>
            </div>
            
            {/* Note (si présente) */}
            {toast.note && (
              <div className="mt-1">
                <span className="opacity-75">·</span>
                <span className="text-sm opacity-90 ml-1">{toast.note}</span>
              </div>
            )}
          </div>

          {/* Bouton fermer */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleClick()
            }}
            className="flex-shrink-0 opacity-75 hover:opacity-100 transition-opacity"
          >
            <span className="text-lg">×</span>
          </button>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="h-1 bg-black bg-opacity-20 overflow-hidden">
        <div
          className="h-full bg-white bg-opacity-30 transition-all ease-linear"
          style={{
            width: isVisible && !isLeaving ? '0%' : '100%',
            transitionDuration: `${duration}ms`
          }}
        />
      </div>
    </div>
  )
}
