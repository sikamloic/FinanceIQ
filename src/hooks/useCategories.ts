// Budget Douala - Hook Categories
// I1.3 - Categories par Défaut

import { useState, useEffect, useCallback } from 'react'
import { db } from '../data/db'
import type { Category } from '../types'

interface UseCategoriesReturn {
  categories: Category[]
  isLoading: boolean
  error: string | null
  getCategoryById: (id: string) => Category | undefined
  getCategoriesByType: (type: 'expense' | 'income') => Category[]
  refreshCategories: () => Promise<void>
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger toutes les catégories
  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const allCategories = await db.categories
        .orderBy('sortOrder')
        .toArray()
      
      setCategories(allCategories)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Récupérer une catégorie par ID
  const getCategoryById = useCallback((id: string): Category | undefined => {
    return categories.find(cat => cat.id === id)
  }, [categories])

  // Filtrer par type
  const getCategoriesByType = useCallback((type: 'expense' | 'income'): Category[] => {
    return categories.filter(cat => cat.type === type)
  }, [categories])

  // Rafraîchir manuellement
  const refreshCategories = useCallback(async (): Promise<void> => {
    await loadCategories()
  }, [loadCategories])

  // Charger au montage
  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  return {
    categories,
    isLoading,
    error,
    getCategoryById,
    getCategoriesByType,
    refreshCategories
  }
}
