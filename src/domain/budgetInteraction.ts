// FinanceIQ - Interaction Budget Salarial & Revenus Extra
// Logique d'intégration sans perturbation du budget de base

import type { ExtraIncomeSplit } from './extraIncome'

/**
 * Impact des revenus extra sur les objectifs budgétaires
 */
export interface BudgetImpact {
  // Coussin d'urgence
  emergencyFund: {
    currentAmount: number
    targetAmount: number        // 3x dépenses essentielles
    monthsToTarget: number      // Sans revenus extra
    monthsToTargetWithExtra: number  // Avec revenus extra
    accelerationMonths: number  // Gain de temps
  }
  
  // Projets moyen terme
  projects: {
    totalSaved: number
    monthlyFromSalary: number   // Épargne projets du salaire
    monthlyFromExtra: number    // Moyenne revenus extra
    accelerationFactor: number  // % d'accélération
  }
  
  // Liberté financière
  financialFreedom: {
    monthlyExpenses: number
    targetMultiplier: number    // Ex: 25x dépenses annuelles
    yearsToTarget: number
    yearsToTargetWithExtra: number
    accelerationYears: number
  }
}

/**
 * Calcule l'impact des revenus extra sur les objectifs budgétaires
 */
export function calculateBudgetImpact(
  salaryBudget: {
    monthlySalary: number
    monthlyExpenses: number
    monthlySavings: number
    emergencyTarget: number
  },
  extraIncomeHistory: Array<{
    amount: number
    date: string
    split: ExtraIncomeSplit
  }>
): BudgetImpact {
  
  // Calcul moyennes revenus extra pour l'impact
  const avgExtraSavings = extraIncomeHistory.length > 0
    ? extraIncomeHistory.reduce((sum, income) => sum + income.split.splits.savings, 0) / extraIncomeHistory.length
    : 0
    
  const avgExtraProjects = extraIncomeHistory.length > 0
    ? extraIncomeHistory.reduce((sum, income) => sum + income.split.splits.projects, 0) / extraIncomeHistory.length
    : 0

  // Impact sur le coussin d'urgence
  const monthsToEmergencyTarget = Math.max(0, 
    (salaryBudget.emergencyTarget - 0) / salaryBudget.monthlySavings
  )
  
  const monthsToEmergencyTargetWithExtra = avgExtraSavings > 0 
    ? Math.max(0, (salaryBudget.emergencyTarget - 0) / (salaryBudget.monthlySavings + avgExtraSavings))
    : monthsToEmergencyTarget

  // Impact sur les projets
  const accelerationFactor = avgExtraProjects > 0 
    ? ((salaryBudget.monthlySavings * 0.3 + avgExtraProjects) / (salaryBudget.monthlySavings * 0.3)) - 1
    : 0

  // Impact sur la liberté financière (règle 25x)
  const annualExpenses = salaryBudget.monthlyExpenses * 12
  const targetLiberteFin = annualExpenses * 25
  const totalMonthlySavings = salaryBudget.monthlySavings + avgExtraSavings
  
  const yearsToTarget = (targetLiberteFin / (salaryBudget.monthlySavings * 12))
  const yearsToTargetWithExtra = totalMonthlySavings > 0 
    ? (targetLiberteFin / (totalMonthlySavings * 12))
    : yearsToTarget

  return {
    emergencyFund: {
      currentAmount: 0, // À récupérer depuis la base
      targetAmount: salaryBudget.emergencyTarget,
      monthsToTarget: monthsToEmergencyTarget,
      monthsToTargetWithExtra: monthsToEmergencyTargetWithExtra,
      accelerationMonths: monthsToEmergencyTarget - monthsToEmergencyTargetWithExtra
    },
    
    projects: {
      totalSaved: 0, // À récupérer depuis la base
      monthlyFromSalary: salaryBudget.monthlySavings * 0.3, // 30% épargne → projets
      monthlyFromExtra: avgExtraProjects,
      accelerationFactor: accelerationFactor * 100 // En pourcentage
    },
    
    financialFreedom: {
      monthlyExpenses: salaryBudget.monthlyExpenses,
      targetMultiplier: 25,
      yearsToTarget: yearsToTarget,
      yearsToTargetWithExtra: yearsToTargetWithExtra,
      accelerationYears: yearsToTarget - yearsToTargetWithExtra
    }
  }
}

/**
 * Recommandations intelligentes selon l'historique des revenus extra
 */
export function generateSmartRecommendations(
  impact: BudgetImpact,
  extraIncomeFrequency: 'rare' | 'occasional' | 'regular'
): string[] {
  const recommendations: string[] = []

  // Coussin d'urgence
  if (impact.emergencyFund.accelerationMonths > 3) {
    recommendations.push(
      `🚀 Vos revenus extra accélèrent votre coussin d'urgence de ${Math.round(impact.emergencyFund.accelerationMonths)} mois !`
    )
  }

  // Projets
  if (impact.projects.accelerationFactor > 20) {
    recommendations.push(
      `🎯 Vos projets avancent ${Math.round(impact.projects.accelerationFactor)}% plus vite grâce aux revenus extra`
    )
  }

  // Liberté financière
  if (impact.financialFreedom.accelerationYears > 1) {
    recommendations.push(
      `💎 Liberté financière atteinte ${Math.round(impact.financialFreedom.accelerationYears)} ans plus tôt !`
    )
  }

  // Conseils selon fréquence
  switch (extraIncomeFrequency) {
    case 'regular':
      recommendations.push(
        '📈 Revenus extra réguliers détectés. Considérez augmenter vos objectifs d\'épargne de base.'
      )
      break
    case 'occasional':
      recommendations.push(
        '⚡ Bonne fréquence de revenus extra ! Maintenez cette dynamique pour accélérer vos objectifs.'
      )
      break
    case 'rare':
      recommendations.push(
        '💡 Cherchez des opportunités de revenus complémentaires pour booster votre épargne.'
      )
      break
  }

  return recommendations
}

/**
 * Vérifie si les revenus extra perturbent l'équilibre budgétaire
 */
export function checkBudgetBalance(
  salaryBudget: { monthlySalary: number; monthlyExpenses: number },
  recentExtraIncome: number
): {
  isBalanced: boolean
  warnings: string[]
  suggestions: string[]
} {
  const warnings: string[] = []
  const suggestions: string[] = []
  
  // Vérifier si les revenus extra deviennent une dépendance
  const extraToSalaryRatio = recentExtraIncome / salaryBudget.monthlySalary
  
  if (extraToSalaryRatio > 0.3) {
    warnings.push(
      '⚠️ Les revenus extra représentent >30% du salaire. Attention à la dépendance !'
    )
    suggestions.push(
      '💼 Considérez négocier une augmentation de salaire ou un poste mieux rémunéré'
    )
  }
  
  // Vérifier l'inflation du style de vie
  const expenseToSalaryRatio = salaryBudget.monthlyExpenses / salaryBudget.monthlySalary
  
  if (expenseToSalaryRatio > 0.75) {
    warnings.push(
      '📊 Dépenses >75% du salaire. Les revenus extra ne doivent pas masquer ce déséquilibre.'
    )
    suggestions.push(
      '✂️ Optimisez d\'abord vos dépenses courantes avant de compter sur les revenus extra'
    )
  }

  return {
    isBalanced: warnings.length === 0,
    warnings,
    suggestions
  }
}

/**
 * Stratégies d'optimisation selon le profil de revenus extra
 */
export function getOptimizationStrategies(
  extraIncomePattern: {
    averageAmount: number
    frequency: number // revenus par mois
    seasonality: 'stable' | 'seasonal' | 'unpredictable'
  }
): {
  strategy: string
  actions: string[]
  riskLevel: 'low' | 'medium' | 'high'
} {
  
  if (extraIncomePattern.frequency >= 2 && extraIncomePattern.seasonality === 'stable') {
    return {
      strategy: 'Intégration Progressive',
      actions: [
        '📈 Augmentez progressivement vos objectifs d\'épargne de base',
        '🎯 Planifiez des projets plus ambitieux',
        '💰 Considérez des investissements à plus long terme'
      ],
      riskLevel: 'low'
    }
  }
  
  if (extraIncomePattern.seasonality === 'seasonal') {
    return {
      strategy: 'Lissage Temporel',
      actions: [
        '📅 Constituez une réserve pendant les bonnes périodes',
        '⚖️ Lissez vos dépenses sur l\'année',
        '🎯 Planifiez les gros achats pendant les pics de revenus'
      ],
      riskLevel: 'medium'
    }
  }
  
  return {
    strategy: 'Prudence Maximale',
    actions: [
      '🛡️ Traitez les revenus extra comme des bonus purs',
      '💎 Renforcez prioritairement votre coussin d\'urgence',
      '❌ Ne modifiez jamais votre budget de base'
    ],
    riskLevel: 'high'
  }
}
