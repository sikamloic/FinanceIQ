// Budget Douala - Types TypeScript MVP
// I0.3 - TypeScript Types Foundation

export interface Transaction {
  id: string
  date: string // ISO format (YYYY-MM-DD)
  amount: number // XAF entier (pas de décimales)
  categoryId: string
  note?: string
  type: 'expense' | 'income'
  createdAt: string // ISO timestamp
}

export interface Category {
  id: string
  name: string
  type: 'expense' | 'income'
  budgetAmount?: number // Montant budgété mensuel en XAF
  color: string // Couleur hex pour l'UI
  isEssential: boolean // Pour calcul coussin d'urgence
  sortOrder: number
}

export interface Settings {
  id: 'singleton' // Une seule instance
  salary: number // Salaire mensuel en XAF (défaut: 250000)
  rentMonthly: number // Loyer mensuel en XAF (défaut: 35000)
  rentMarginPct: 5 | 10 // Marge loyer 5% ou 10% (défaut: 10)
  salarySavePct: number // % épargne sur salaire (défaut: 10)
  
  // Budgets par catégorie (montants mensuels en XAF)
  nutritionBudget: number // Nutrition/Alimentation (défaut: 50000)
  transportBudget: number // Transport (défaut: 32550)
  utilitiesBudget: number // Eau & Électricité (défaut: 25000)
  healthBeautyBudget: number // Santé & Beauté (défaut: 15000)
  phoneInternetBudget: number // Téléphone & Internet (défaut: 12500)
  leisureBudget: number // Loisirs (défaut: 20000)
  diversBudget: number // Divers (défaut: 15000)
  pocketMonsieurBudget: number // Poche Monsieur (défaut: 25000)
  pocketMadameBudget: number // Poche Madame (défaut: 25000)
  familyAidBudget: number // Aide à la famille (défaut: 30000)
  
  // Nouvelles catégories scientifiques
  scientificBudgets?: Record<string, number> // Budgets par catégorie scientifique
  
  pinHash?: string // Hash du PIN pour sécurité
  createdAt: string
  updatedAt: string
}

export interface Budget {
  categoryId: string
  month: string // Format YYYY-MM
  budgeted: number // Montant budgété
  spent: number // Montant dépensé
  remaining: number // Reste disponible
  percentUsed: number // Pourcentage utilisé
}

// Types utilitaires
export type TransactionType = Transaction['type']
export type CategoryType = Category['type']
export type RentMargin = Settings['rentMarginPct']

// Constantes
export const DEFAULT_SETTINGS: Omit<Settings, 'id' | 'createdAt' | 'updatedAt'> = {
  salary: 250000, // 250k XAF
  rentMonthly: 35000, // 35k XAF
  rentMarginPct: 10, // 10%
  salarySavePct: 10, // 10%
  
  // Budgets par catégorie (montants mensuels en XAF)
  nutritionBudget: 50000, // Nutrition/Alimentation
  transportBudget: 32550, // Transport (1500 × 21.7 jours)
  utilitiesBudget: 25000, // Eau & Électricité
  healthBeautyBudget: 15000, // Santé & Beauté
  phoneInternetBudget: 12500, // Téléphone & Internet
  leisureBudget: 20000, // Loisirs
  diversBudget: 15000, // Divers
  pocketMonsieurBudget: 25000, // Poche Monsieur
  pocketMadameBudget: 25000, // Poche Madame
  familyAidBudget: 30000 // Aide à la famille
}

export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  {
    name: 'Transport',
    type: 'expense',
    color: '#3B82F6', // Blue
    isEssential: true,
    sortOrder: 1
  },
  {
    name: 'Alimentation',
    type: 'expense',
    budgetAmount: 50000,
    color: '#10B981', // Green
    isEssential: true,
    sortOrder: 2
  },
  {
    name: 'Data/Communication',
    type: 'expense',
    budgetAmount: 12500,
    color: '#8B5CF6', // Purple
    isEssential: true,
    sortOrder: 3
  },
  {
    name: 'Fonds Loyer',
    type: 'expense',
    color: '#F59E0B', // Amber
    isEssential: true,
    sortOrder: 4
  },
  {
    name: 'Épargne d\'urgence',
    type: 'expense',
    color: '#EF4444', // Red
    isEssential: false,
    sortOrder: 5
  }
]
