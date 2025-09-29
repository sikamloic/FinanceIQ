// Budget Douala - Utilitaire Reset Database
// Vider toutes les données locales pour tests réels

import { db } from '../data/db'

/**
 * Vide complètement la base de données locale
 */
export async function resetDatabase(): Promise<void> {
  try {
    console.log('🧹 Début du reset de la base de données...')
    
    // Vider toutes les tables
    await db.transaction('rw', [db.transactions, db.categories, db.settings], async () => {
      await db.transactions.clear()
      await db.categories.clear() 
      await db.settings.clear()
    })
    
    console.log('✅ Base de données vidée avec succès')
    
    // Statistiques après reset
    const stats = {
      transactions: await db.transactions.count(),
      categories: await db.categories.count(),
      settings: await db.settings.count()
    }
    
    console.log('📊 Statistiques après reset:', stats)
    
    // Réinitialiser les données par défaut
    console.log('🌱 Réinitialisation des données par défaut...')
    const { seedDefaultData } = await import('../data/seed')
    await seedDefaultData()
    
    console.log('✅ Reset complet terminé - Prêt pour tests réels !')
    
  } catch (error) {
    console.error('❌ Erreur lors du reset:', error)
    throw error
  }
}

/**
 * Vide uniquement les transactions (garde settings et catégories)
 */
export async function resetTransactionsOnly(): Promise<void> {
  try {
    console.log('🧹 Reset des transactions uniquement...')
    
    await db.transactions.clear()
    
    const count = await db.transactions.count()
    console.log(`✅ ${count} transactions supprimées`)
    
  } catch (error) {
    console.error('❌ Erreur reset transactions:', error)
    throw error
  }
}

/**
 * Affiche les statistiques actuelles de la DB
 */
export async function showDatabaseStats(): Promise<{ transactions: number; categories: number; settings: number }> {
  try {
    const stats = {
      transactions: await db.transactions.count(),
      categories: await db.categories.count(),
      settings: await db.settings.count()
    }
    
    console.log('📊 Statistiques actuelles de la DB:', stats)
    
    // Afficher quelques exemples de transactions
    const sampleTransactions = await db.transactions.limit(3).toArray()
    if (sampleTransactions.length > 0) {
      console.log('📝 Exemples de transactions:')
      sampleTransactions.forEach(tx => {
        console.log(`  - ${tx.date}: ${tx.amount} XAF (${tx.categoryId})`)
      })
    }
    
    return stats
  } catch (error) {
    console.error('❌ Erreur stats DB:', error)
    throw error
  }
}

/**
 * Fonction utilitaire pour les tests - à appeler depuis la console
 */
export function setupResetUtils() {
  // Exposer les fonctions dans window pour utilisation console
  if (typeof window !== 'undefined') {
    (window as any).resetDB = resetDatabase;
    (window as any).resetTransactions = resetTransactionsOnly;
    (window as any).showDBStats = showDatabaseStats;
    
    console.log('🔧 Utilitaires de reset disponibles:')
    console.log('  - resetDB() : Vider toute la DB')
    console.log('  - resetTransactions() : Vider que les transactions')
    console.log('  - showDBStats() : Afficher les stats')
  }
}
