// Budget Douala - Hook Toast Management
// I3.4 - Toast Confirmation

import { useState, useCallback } from 'react'
import type { ToastData } from '../components/Toast'

interface ShowToastOptions {
  amount: number
  categoryName: string
  categoryIcon: string
  note?: string
  type?: 'success' | 'error' | 'info'
  duration?: number
}

interface UseToastReturn {
  toasts: ToastData[]
  showToast: (options: ShowToastOptions) => string
  showSuccessToast: (amount: number, categoryName: string, categoryIcon: string, note?: string) => string
  showErrorToast: (message: string) => string
  hideToast: (id: string) => void
  clearAllToasts: () => void
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastData[]>([])

  // Générer un ID unique
  const generateId = useCallback(() => {
    return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // Afficher un toast générique
  const showToast = useCallback((options: ShowToastOptions): string => {
    const id = generateId()
    
    const toast: ToastData = {
      id,
      amount: options.amount,
      categoryName: options.categoryName,
      categoryIcon: options.categoryIcon,
      note: options.note || '',
      type: options.type || 'success'
    }

    setToasts(prev => [...prev, toast])
    
    // Auto-remove après la durée (backup au cas où le composant ne se supprime pas)
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, (options.duration || 3000) + 500)

    return id
  }, [generateId])

  // Toast de succès pour transactions
  const showSuccessToast = useCallback((
    amount: number, 
    categoryName: string, 
    categoryIcon: string, 
    note?: string
  ): string => {
    return showToast({
      amount,
      categoryName,
      categoryIcon,
      note,
      type: 'success'
    })
  }, [showToast])

  // Toast d'erreur simple
  const showErrorToast = useCallback((message: string): string => {
    return showToast({
      amount: 0,
      categoryName: 'Erreur',
      categoryIcon: '❌',
      note: message,
      type: 'error'
    })
  }, [showToast])

  // Masquer un toast spécifique
  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // Vider tous les toasts
  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  return {
    toasts,
    showToast,
    showSuccessToast,
    showErrorToast,
    hideToast,
    clearAllToasts
  }
}
