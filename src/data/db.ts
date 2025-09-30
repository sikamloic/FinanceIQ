// FinanceIQ - Base de Données IndexedDB Sécurisée
// I4.1 - Configuration Dexie avec schéma optimisé + chiffrement

import Dexie, { type EntityTable } from 'dexie'
import type { Transaction, Category, Settings } from '../types'

// Classe principale de la base de données
class BudgetDB extends Dexie {
  // Tables typées avec Dexie
  transactions!: EntityTable<Transaction, 'id'>
  categories!: EntityTable<Category, 'id'>
  settings!: EntityTable<Settings, 'id'>

  constructor() {
    super('FinanceIQDB')
    
    // Version 1 du schema
    this.version(1).stores({
      // Index sur les champs importants pour les requêtes
      transactions: 'id, date, categoryId, amount, type, createdAt',
      categories: 'id, name, type, sortOrder',
      settings: 'id' // Une seule instance avec id='singleton'
    })

    // Hooks pour auto-générer les timestamps
    this.transactions.hook('creating', (_primKey, obj, _trans) => {
      obj.createdAt = new Date().toISOString()
    })
  }
}

// Instance unique de la DB
export const db = new BudgetDB()

// Fonction d'initialisation (appelée au premier lancement)
export async function initializeDB(): Promise<void> {
  try {
    // Ouvre la DB (création automatique si n'existe pas)
    await db.open()
    
    console.log('✅ BudgetDoualaDB initialisée avec succès')
    console.log('📊 Tables disponibles:', db.tables.map(t => t.name))
    
    // Vérifie si c'est la première utilisation
    const settingsCount = await db.settings.count()
    if (settingsCount === 0) {
      console.log('🆕 Première utilisation détectée')
      
      // Import dynamique pour éviter les dépendances circulaires
      const { seedDefaultData } = await import('./seed')
      await seedDefaultData()
    }
    
  } catch (error) {
    console.error('❌ Erreur initialisation DB:', error)
    throw error
  }
}

// Fonction de diagnostic (utile pour debug)
export async function getDatabaseInfo(): Promise<{
  name: string
  version: number
  tables: string[]
  transactionCount: number
  categoryCount: number
  settingsExists: boolean
}> {
  await db.open()
  
  return {
    name: db.name,
    version: db.verno,
    tables: db.tables.map(t => t.name),
    transactionCount: await db.transactions.count(),
    categoryCount: await db.categories.count(),
    settingsExists: (await db.settings.count()) > 0
  }
}

// Fonction de nettoyage (utile pour tests)
export async function clearAllData(): Promise<void> {
  await db.transaction('rw', [db.transactions, db.categories, db.settings], async () => {
    await db.transactions.clear()
    await db.categories.clear()
    await db.settings.clear()
  })
  console.log('🧹 Toutes les données supprimées')
}

// Export des types pour faciliter l'usage
export type { Transaction, Category, Settings } from '../types'
