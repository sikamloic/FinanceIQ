// Budget Douala - Seed Data (Categories par défaut)
// I1.3 - Categories par Défaut

import { db } from './db'
import type { Category, Settings } from '../types'
import { DEFAULT_SETTINGS } from '../types'

// Catégories scientifiques basées sur BUDGET_RULES
export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'logement',
    name: 'Logement',
    type: 'expense',
    color: '#F97316', // Orange
    isEssential: true,
    sortOrder: 1
  },
  {
    id: 'alimentation',
    name: 'Alimentation & hygiène',
    type: 'expense',
    color: '#10B981', // Green
    isEssential: true,
    sortOrder: 2
  },
  {
    id: 'transport',
    name: 'Transport',
    type: 'expense',
    color: '#3B82F6', // Blue
    isEssential: true,
    sortOrder: 3
  },
  {
    id: 'factures',
    name: 'Factures & services',
    type: 'expense',
    color: '#8B5CF6', // Purple
    isEssential: true,
    sortOrder: 4
  },
  {
    id: 'sante',
    name: 'Santé',
    type: 'expense',
    color: '#EC4899', // Pink
    isEssential: true,
    sortOrder: 5
  },
  {
    id: 'vie_courante',
    name: 'Vie courante & vêtements',
    type: 'expense',
    color: '#06B6D4', // Cyan
    isEssential: false,
    sortOrder: 6
  },
  {
    id: 'couple',
    name: 'Partenaire & romance',
    type: 'expense',
    color: '#BE185D', // Rose
    isEssential: false,
    sortOrder: 7
  },
  {
    id: 'loisirs',
    name: 'Loisirs (solo)',
    type: 'expense',
    color: '#F59E0B', // Amber
    isEssential: false,
    sortOrder: 8
  },
  {
    id: 'famille',
    name: 'Dons / famille',
    type: 'expense',
    color: '#DC2626', // Red
    isEssential: false,
    sortOrder: 9
  },
  {
    id: 'education',
    name: 'Éducation & développement',
    type: 'expense',
    color: '#059669', // Emerald
    isEssential: false,
    sortOrder: 10
  },
  {
    id: 'dettes',
    name: 'Dettes (hors logement)',
    type: 'expense',
    color: '#7C2D12', // Brown
    isEssential: true,
    sortOrder: 11
  },
  {
    id: 'imprevus',
    name: 'Imprévus & annuels',
    type: 'expense',
    color: '#6B7280', // Gray
    isEssential: true,
    sortOrder: 12
  },
  {
    id: 'epargne',
    name: 'Épargne & investissement',
    type: 'income', // L'épargne est considérée comme un "revenu" pour le futur
    color: '#16A34A', // Green foncé
    isEssential: true,
    sortOrder: 13
  }
]

// Settings par défaut
export const DEFAULT_SETTINGS_RECORD: Settings = {
  id: 'singleton',
  ...DEFAULT_SETTINGS,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

/**
 * Initialise les catégories par défaut si elles n'existent pas
 */
export async function seedCategories(): Promise<void> {
  try {
    const existingCount = await db.categories.count()
    
    if (existingCount === 0) {
      console.log('🌱 Seed: Création des catégories par défaut...')
      
      // Ajouter toutes les catégories en une transaction avec gestion des doublons
      await db.transaction('rw', db.categories, async () => {
        for (const category of DEFAULT_CATEGORIES) {
          // Utilise put() au lieu de add() pour éviter les erreurs de doublons
          await db.categories.put(category)
        }
      })
      
      console.log(`✅ Seed: ${DEFAULT_CATEGORIES.length} catégories créées`)
      
      // Log des catégories créées
      DEFAULT_CATEGORIES.forEach(cat => {
        console.log(`  📁 ${cat.name} (${cat.id}) - ${cat.budgetAmount?.toLocaleString()} XAF`)
      })
      
    } else {
      console.log(`ℹ️ Seed: ${existingCount} catégories déjà présentes, skip`)
    }
    
  } catch (error) {
    console.error('❌ Erreur seed catégories:', error)
    // Ne pas throw en cas d'erreur de doublon, continuer
    if (error instanceof Error && error.name !== 'ConstraintError') {
      throw error
    }
  }
}

/**
 * Initialise les settings par défaut s'ils n'existent pas
 */
export async function seedSettings(): Promise<void> {
  try {
    const existingSettings = await db.settings.get('singleton')
    
    if (!existingSettings) {
      console.log('🌱 Seed: Création des settings par défaut...')
      
      // Utilise put() au lieu de add() pour éviter les erreurs de doublons
      await db.settings.put(DEFAULT_SETTINGS_RECORD)
      
      console.log('✅ Seed: Settings par défaut créés')
      console.log(`  💰 Salaire: ${DEFAULT_SETTINGS.salary.toLocaleString()} XAF`)
      console.log(`  🏠 Loyer: ${DEFAULT_SETTINGS.rentMonthly.toLocaleString()} XAF`)
      console.log(`  📈 Marge loyer: ${DEFAULT_SETTINGS.rentMarginPct}%`)
      
    } else {
      console.log('ℹ️ Seed: Settings déjà présents, skip')
    }
    
  } catch (error) {
    console.error('❌ Erreur seed settings:', error)
    throw error
  }
}

/**
 * Fonction principale d'initialisation des données par défaut
 */
export async function seedDefaultData(): Promise<void> {
  console.log('🌱 Initialisation des données par défaut...')
  
  try {
    // Seed en parallèle pour optimiser
    await Promise.all([
      seedCategories(),
      seedSettings()
    ])
    
    console.log('✅ Seed complet terminé avec succès')
    
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error)
    throw error
  }
}

/**
 * Fonction utilitaire pour récupérer une catégorie par nom
 */
export function getCategoryIdByName(name: string): string | null {
  const category = DEFAULT_CATEGORIES.find(
    cat => cat.name.toLowerCase() === name.toLowerCase()
  )
  return category?.id || null
}

/**
 * Mapping pour compatibilité avec les anciens IDs
 */
export const CATEGORY_ID_MAPPING: Record<string, string> = {
  'transport': 'cat_transport',
  'food': 'cat_alimentation',
  'alimentation': 'cat_alimentation',
  'data': 'cat_data',
  'loyer': 'cat_loyer',
  'epargne': 'cat_epargne',
  'savings': 'cat_epargne'
}
