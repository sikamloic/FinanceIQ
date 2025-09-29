// Migration des catégories vers le système scientifique

import { db } from '../data/db'
import { DEFAULT_CATEGORIES } from '../data/seed'

export async function migrateToScientificCategories(): Promise<void> {
  console.log('🔄 Migration vers les catégories scientifiques...')
  
  try {
    // Vider les anciennes catégories
    await db.categories.clear()
    
    // Insérer les nouvelles catégories scientifiques
    await db.categories.bulkAdd(DEFAULT_CATEGORIES)
    
    console.log('✅ Migration terminée - 13 catégories scientifiques créées')
    
    // Afficher les nouvelles catégories
    const categories = await db.categories.orderBy('sortOrder').toArray()
    console.log('📊 Nouvelles catégories:', categories.map(c => `${c.name} (${c.id})`))
    
  } catch (error) {
    console.error('❌ Erreur migration:', error)
    throw error
  }
}

// Fonction pour vérifier si la migration est nécessaire
export async function needsMigration(): Promise<boolean> {
  try {
    const categories = await db.categories.toArray()
    
    // Si pas de catégories ou si on trouve encore les anciennes (cat_*)
    if (categories.length === 0) return true
    
    const hasOldCategories = categories.some(cat => cat.id.startsWith('cat_'))
    const hasNewCategories = categories.some(cat => ['logement', 'alimentation', 'transport'].includes(cat.id))
    
    return hasOldCategories && !hasNewCategories
  } catch (error) {
    console.error('Erreur vérification migration:', error)
    return false
  }
}
