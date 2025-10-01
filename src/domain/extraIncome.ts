// FinanceIQ - Gestion Revenus Extra
// Répartition automatique selon spécifications : 60% Épargne / 30% Projets / 10% Loisirs

/**
 * Configuration de répartition des revenus extra selon spécifications
 */
const EXTRA_INCOME_SPLIT = {
  savings: 60,    // 60% → Épargne (renforcer le coussin)
  projects: 30,   // 30% → Projets (objectifs moyen terme)
  leisure: 10     // 10% → Loisirs (récompense immédiate)
} as const

/**
 * Types de revenus extra reconnus
 */
export const EXTRA_INCOME_TYPES = {
  bonus: 'Prime/Bonus',
  freelance: 'Travail freelance',
  gift: 'Cadeau/Don reçu',
  refund: 'Remboursement',
  sale: 'Vente (objet, service)',
  investment: 'Gain investissement',
  other: 'Autre revenu'
} as const

export type ExtraIncomeType = keyof typeof EXTRA_INCOME_TYPES

/**
 * Proposition de répartition d'un revenu extra
 */
export interface ExtraIncomeSplit {
  totalAmount: number
  splits: {
    savings: number      // Montant pour épargne
    projects: number     // Montant pour projets
    leisure: number      // Montant pour loisirs
  }
  percentages: typeof EXTRA_INCOME_SPLIT
}

/**
 * Calcule la répartition optimale d'un revenu extra
 * Gère les arrondis pour que la somme soit exacte
 */
export function calculateExtraIncomeSplit(amount: number): ExtraIncomeSplit {
  if (amount <= 0) {
    return {
      totalAmount: 0,
      splits: { savings: 0, projects: 0, leisure: 0 },
      percentages: EXTRA_INCOME_SPLIT
    }
  }

  // Calculs de base
  const savingsBase = Math.floor(amount * EXTRA_INCOME_SPLIT.savings / 100)
  const projectsBase = Math.floor(amount * EXTRA_INCOME_SPLIT.projects / 100)
  const leisureBase = Math.floor(amount * EXTRA_INCOME_SPLIT.leisure / 100)
  
  // Calculer le reste dû aux arrondis
  const totalCalculated = savingsBase + projectsBase + leisureBase
  const remainder = amount - totalCalculated
  
  // Répartir le reste (priorité : Épargne > Projets > Loisirs)
  let savings = savingsBase
  let projects = projectsBase
  let leisure = leisureBase
  
  if (remainder > 0) {
    if (remainder >= 2) {
      savings += Math.floor(remainder * 0.6)
      projects += Math.floor(remainder * 0.3)
      leisure += remainder - Math.floor(remainder * 0.6) - Math.floor(remainder * 0.3)
    } else if (remainder === 1) {
      savings += 1 // Priorité à l'épargne
    }
  }

  return {
    totalAmount: amount,
    splits: { savings, projects, leisure },
    percentages: EXTRA_INCOME_SPLIT
  }
}

/**
 * Génère des suggestions personnalisées selon le montant
 */
export function generateExtraIncomeAdvice(amount: number): string[] {
  const advice: string[] = []
  
  if (amount >= 100000) {
    advice.push('💰 Gros montant ! Parfait pour renforcer votre épargne d\'urgence')
    advice.push('🎯 Considérez investir la partie "Projets" dans un placement')
  } else if (amount >= 50000) {
    advice.push('📈 Montant intéressant pour accélérer vos objectifs')
    advice.push('🎁 La partie "Loisirs" peut financer une sortie spéciale')
  } else if (amount >= 10000) {
    advice.push('✨ Chaque petit extra compte pour votre liberté financière')
    advice.push('🏦 Même 6 000 XAF en épargne font la différence')
  } else {
    advice.push('🌟 Tout revenu extra est une victoire !')
    advice.push('💪 Continuez à optimiser vos finances')
  }

  return advice
}

/**
 * Valide et formate un montant de revenu extra
 */
export function validateExtraIncomeAmount(input: string | number): {
  isValid: boolean
  amount: number
  error?: string
} {
  const numAmount = typeof input === 'string' ? parseInt(input.replace(/\s/g, ''), 10) : input
  
  if (isNaN(numAmount)) {
    return { isValid: false, amount: 0, error: 'Montant invalide' }
  }
  
  if (numAmount <= 0) {
    return { isValid: false, amount: 0, error: 'Le montant doit être positif' }
  }
  
  if (numAmount > 10000000) { // 10M XAF max
    return { isValid: false, amount: 0, error: 'Montant trop élevé' }
  }
  
  return { isValid: true, amount: numAmount }
}

/**
 * Crée les transactions automatiques pour la répartition
 */
export function createExtraIncomeTransactions(
  split: ExtraIncomeSplit,
  incomeType: ExtraIncomeType,
  description: string = ''
) {
  const baseDescription = description || EXTRA_INCOME_TYPES[incomeType]
  const transactions = []

  // Transaction de revenu (entrée)
  transactions.push({
    type: 'income' as const,
    amount: split.totalAmount,
    categoryId: 'extra_income',
    note: `${baseDescription} - Revenu extra`,
    date: new Date().toISOString()
  })

  // Répartition automatique (sorties vers enveloppes)
  if (split.splits.savings > 0) {
    transactions.push({
      type: 'expense' as const,
      amount: split.splits.savings,
      categoryId: 'savings_emergency',
      note: `${baseDescription} - Épargne (${EXTRA_INCOME_SPLIT.savings}%)`,
      date: new Date().toISOString()
    })
  }

  if (split.splits.projects > 0) {
    transactions.push({
      type: 'expense' as const,
      amount: split.splits.projects,
      categoryId: 'savings_projects',
      note: `${baseDescription} - Projets (${EXTRA_INCOME_SPLIT.projects}%)`,
      date: new Date().toISOString()
    })
  }

  if (split.splits.leisure > 0) {
    transactions.push({
      type: 'expense' as const,
      amount: split.splits.leisure,
      categoryId: 'leisure',
      note: `${baseDescription} - Loisirs (${EXTRA_INCOME_SPLIT.leisure}%)`,
      date: new Date().toISOString()
    })
  }

  return transactions
}

/**
 * Statistiques des revenus extra sur une période
 */
export interface ExtraIncomeStats {
  totalAmount: number
  count: number
  averageAmount: number
  totalSavings: number
  totalProjects: number
  totalLeisure: number
  topSource: ExtraIncomeType | null
}

/**
 * Calcule les statistiques des revenus extra
 */
export function calculateExtraIncomeStats(
  extraIncomes: Array<{ amount: number; type: ExtraIncomeType; date: string }>
): ExtraIncomeStats {
  if (extraIncomes.length === 0) {
    return {
      totalAmount: 0,
      count: 0,
      averageAmount: 0,
      totalSavings: 0,
      totalProjects: 0,
      totalLeisure: 0,
      topSource: null
    }
  }

  const totalAmount = extraIncomes.reduce((sum, income) => sum + income.amount, 0)
  const count = extraIncomes.length
  const averageAmount = Math.round(totalAmount / count)

  // Calcul des totaux par catégorie
  let totalSavings = 0
  let totalProjects = 0
  let totalLeisure = 0

  extraIncomes.forEach(income => {
    const split = calculateExtraIncomeSplit(income.amount)
    totalSavings += split.splits.savings
    totalProjects += split.splits.projects
    totalLeisure += split.splits.leisure
  })

  // Source la plus fréquente
  const sourceCount = extraIncomes.reduce((acc, income) => {
    acc[income.type] = (acc[income.type] || 0) + 1
    return acc
  }, {} as Record<ExtraIncomeType, number>)

  const topSource = Object.entries(sourceCount).reduce((a, b) => 
    sourceCount[a[0] as ExtraIncomeType] > sourceCount[b[0] as ExtraIncomeType] ? a : b
  )[0] as ExtraIncomeType

  return {
    totalAmount,
    count,
    averageAmount,
    totalSavings,
    totalProjects,
    totalLeisure,
    topSource
  }
}
