// Budget Douala - Règles Budgétaires Scientifiques
// Répartition optimale basée sur recherches financières

export interface BudgetCategory {
  id: string
  name: string
  maxPercentage: number
  recommendedPercentage: number
  subcategories: BudgetSubcategory[]
  color: string
  icon: string
  isEssential: boolean
  priority: number
}

export interface BudgetSubcategory {
  id: string
  name: string
  maxPercentage: number
  parentCategoryId: string
}

// Règles budgétaires scientifiques (% du salaire)
export const BUDGET_RULES: BudgetCategory[] = [
  {
    id: 'logement',
    name: 'Logement',
    maxPercentage: 20,
    recommendedPercentage: 15,
    color: '#F97316', // Orange
    icon: 'home',
    isEssential: true,
    priority: 1,
    subcategories: [
      { id: 'loyer', name: 'Loyer / mensualité', maxPercentage: 13.0, parentCategoryId: 'logement' },
      { id: 'charges', name: 'Charges d\'immeuble', maxPercentage: 1.2, parentCategoryId: 'logement' },
      { id: 'assurance_hab', name: 'Assurance habitation', maxPercentage: 0.5, parentCategoryId: 'logement' },
      { id: 'parking_gen', name: 'Parking / groupe électrogène', maxPercentage: 0.3, parentCategoryId: 'logement' }
    ]
  },
  {
    id: 'alimentation',
    name: 'Alimentation & hygiène',
    maxPercentage: 10,
    recommendedPercentage: 8.5,
    color: '#10B981', // Green
    icon: 'utensils',
    isEssential: true,
    priority: 2,
    subcategories: [
      { id: 'courses', name: 'Courses alimentaires', maxPercentage: 7.5, parentCategoryId: 'alimentation' },
      { id: 'eau_potable', name: 'Eau potable / bonbonnes', maxPercentage: 0.7, parentCategoryId: 'alimentation' },
      { id: 'gaz', name: 'Gaz cuisine', maxPercentage: 0.8, parentCategoryId: 'alimentation' },
      { id: 'hygiene', name: 'Hygiène & entretien', maxPercentage: 1.0, parentCategoryId: 'alimentation' }
    ]
  },
  {
    id: 'transport',
    name: 'Transport',
    maxPercentage: 15,
    recommendedPercentage: 13,
    color: '#3B82F6', // Blue
    icon: 'car',
    isEssential: true,
    priority: 3,
    subcategories: [
      { id: 'carburant', name: 'Carburant / taxi / moto', maxPercentage: 4.5, parentCategoryId: 'transport' },
      { id: 'entretien', name: 'Entretien véhicule', maxPercentage: 1.5, parentCategoryId: 'transport' },
      { id: 'assurance_auto', name: 'Assurance/vignette', maxPercentage: 0.8, parentCategoryId: 'transport' },
      { id: 'parking_lavage', name: 'Parking / lavage', maxPercentage: 0.2, parentCategoryId: 'transport' }
    ]
  },
  {
    id: 'factures',
    name: 'Factures & services',
    maxPercentage: 7,
    recommendedPercentage: 6,
    color: '#8B5CF6', // Purple
    icon: 'zap',
    isEssential: true,
    priority: 4,
    subcategories: [
      { id: 'electricite', name: 'Électricité', maxPercentage: 3.0, parentCategoryId: 'factures' },
      { id: 'eau_facture', name: 'Eau (si séparée)', maxPercentage: 0.7, parentCategoryId: 'factures' },
      { id: 'internet', name: 'Internet/TV', maxPercentage: 2.0, parentCategoryId: 'factures' },
      { id: 'telephone', name: 'Téléphone / data', maxPercentage: 1.0, parentCategoryId: 'factures' },
      { id: 'abonnements', name: 'Abonnements numériques', maxPercentage: 0.3, parentCategoryId: 'factures' }
    ]
  },
  {
    id: 'sante',
    name: 'Santé',
    maxPercentage: 5,
    recommendedPercentage: 4,
    color: '#EC4899', // Pink
    icon: 'heart',
    isEssential: true,
    priority: 5,
    subcategories: [
      { id: 'mutuelle', name: 'Mutuelle/assurance santé', maxPercentage: 1.8, parentCategoryId: 'sante' },
      { id: 'consultations', name: 'Consultations/analyses', maxPercentage: 1.5, parentCategoryId: 'sante' },
      { id: 'pharmacie', name: 'Pharmacie', maxPercentage: 1.2, parentCategoryId: 'sante' },
      { id: 'dentaire', name: 'Dentaire/optique', maxPercentage: 0.5, parentCategoryId: 'sante' }
    ]
  },
  {
    id: 'vie_courante',
    name: 'Vie courante & vêtements',
    maxPercentage: 4,
    recommendedPercentage: 3.5,
    color: '#06B6D4', // Cyan
    icon: 'shirt',
    isEssential: false,
    priority: 6,
    subcategories: [
      { id: 'vetements', name: 'Vêtements/chaussures', maxPercentage: 1.5, parentCategoryId: 'vie_courante' },
      { id: 'coiffure', name: 'Coiffure/soins persos', maxPercentage: 1.0, parentCategoryId: 'vie_courante' },
      { id: 'achats_maison', name: 'Achats maison & réparations', maxPercentage: 1.3, parentCategoryId: 'vie_courante' },
      { id: 'fournitures', name: 'Fournitures diverses', maxPercentage: 0.2, parentCategoryId: 'vie_courante' }
    ]
  },
  {
    id: 'couple',
    name: 'Partenaire & romance',
    maxPercentage: 5,
    recommendedPercentage: 4,
    color: '#BE185D', // Rose
    icon: 'heart',
    isEssential: false,
    priority: 7,
    subcategories: [
      { id: 'sorties_couple', name: 'Sorties à deux', maxPercentage: 2.5, parentCategoryId: 'couple' },
      { id: 'cadeaux_couple', name: 'Cadeaux & attentions', maxPercentage: 1.5, parentCategoryId: 'couple' },
      { id: 'surprises', name: 'Surprises / mini-voyages', maxPercentage: 1.0, parentCategoryId: 'couple' }
    ]
  },
  {
    id: 'loisirs',
    name: 'Loisirs (solo)',
    maxPercentage: 2,
    recommendedPercentage: 1.5,
    color: '#F59E0B', // Amber
    icon: 'gamepad',
    isEssential: false,
    priority: 8,
    subcategories: [
      { id: 'sorties_solo', name: 'Sorties perso / hobbies', maxPercentage: 1.2, parentCategoryId: 'loisirs' },
      { id: 'livres_jeux', name: 'Livres/jeux non études', maxPercentage: 0.8, parentCategoryId: 'loisirs' }
    ]
  },
  {
    id: 'famille',
    name: 'Dons / famille',
    maxPercentage: 3,
    recommendedPercentage: 2.5,
    color: '#DC2626', // Red
    icon: 'users',
    isEssential: false,
    priority: 9,
    subcategories: [
      { id: 'aide_reguliere', name: 'Aide régulière', maxPercentage: 1.7, parentCategoryId: 'famille' },
      { id: 'ceremonies', name: 'Cérémonies / associations', maxPercentage: 0.8, parentCategoryId: 'famille' },
      { id: 'cadeaux_famille', name: 'Cadeaux famille', maxPercentage: 0.5, parentCategoryId: 'famille' }
    ]
  },
  {
    id: 'education',
    name: 'Éducation & développement',
    maxPercentage: 3,
    recommendedPercentage: 2.5,
    color: '#059669', // Emerald
    icon: 'book',
    isEssential: false,
    priority: 10,
    subcategories: [
      { id: 'formations', name: 'Formations / certifications', maxPercentage: 1.2, parentCategoryId: 'education' },
      { id: 'data_etudes', name: 'Data/logiciels d\'étude', maxPercentage: 0.6, parentCategoryId: 'education' },
      { id: 'livres_etudes', name: 'Livres études', maxPercentage: 1.2, parentCategoryId: 'education' }
    ]
  },
  {
    id: 'dettes',
    name: 'Dettes (hors logement)',
    maxPercentage: 7,
    recommendedPercentage: 5,
    color: '#7C2D12', // Brown
    icon: 'credit-card',
    isEssential: true,
    priority: 11,
    subcategories: [
      { id: 'mensualites', name: 'Mensualités crédits', maxPercentage: 6.0, parentCategoryId: 'dettes' },
      { id: 'interets', name: 'Intérêts / frais', maxPercentage: 1.0, parentCategoryId: 'dettes' }
    ]
  },
  {
    id: 'imprevus',
    name: 'Imprévus & annuels',
    maxPercentage: 4,
    recommendedPercentage: 3.5,
    color: '#6B7280', // Gray
    icon: 'wrench',
    isEssential: true,
    priority: 12,
    subcategories: [
      { id: 'pannes', name: 'Pannes & réparations', maxPercentage: 2.0, parentCategoryId: 'imprevus' },
      { id: 'assurances_annuelles', name: 'Assurances annuelles', maxPercentage: 2.0, parentCategoryId: 'imprevus' }
    ]
  },
  {
    id: 'epargne',
    name: 'Épargne & investissement',
    maxPercentage: 25, // Pas de limite haute, au contraire !
    recommendedPercentage: 20,
    color: '#16A34A', // Green foncé
    icon: 'piggy-bank',
    isEssential: true,
    priority: 0, // Priorité absolue
    subcategories: [
      { id: 'urgence', name: 'Fonds d\'urgence', maxPercentage: 12, parentCategoryId: 'epargne' },
      { id: 'projets_12m', name: 'Projets 12 mois', maxPercentage: 9, parentCategoryId: 'epargne' },
      { id: 'long_terme', name: 'Long terme', maxPercentage: 7, parentCategoryId: 'epargne' },
      { id: 'placements', name: 'Placements simples', maxPercentage: 6, parentCategoryId: 'epargne' }
    ]
  }
]

// Fonctions utilitaires
export function calculateBudgetAmount(salary: number, percentage: number): number {
  return Math.round(salary * percentage / 100)
}

export function calculateTotalRecommended(): number {
  return BUDGET_RULES.reduce((sum, cat) => sum + cat.recommendedPercentage, 0)
}

export function calculateTotalMaximum(): number {
  return BUDGET_RULES.reduce((sum, cat) => sum + cat.maxPercentage, 0)
}

export function getBudgetValidation(salary: number, categoryId: string, amount: number): {
  isValid: boolean
  level: 'success' | 'warning' | 'error'
  message: string
  percentage: number
} {
  const category = BUDGET_RULES.find(cat => cat.id === categoryId)
  if (!category) {
    return { isValid: false, level: 'error', message: 'Catégorie inconnue', percentage: 0 }
  }

  const percentage = (amount / salary) * 100
  const recommended = category.recommendedPercentage
  const maximum = category.maxPercentage

  if (percentage <= recommended) {
    return {
      isValid: true,
      level: 'success',
      message: `Optimal (${percentage.toFixed(1)}% <= ${recommended}%)`,
      percentage
    }
  } else if (percentage <= maximum) {
    return {
      isValid: true,
      level: 'warning',
      message: `Élevé (${percentage.toFixed(1)}% > ${recommended}%, max ${maximum}%)`,
      percentage
    }
  } else {
    return {
      isValid: false,
      level: 'error',
      message: `Critique (${percentage.toFixed(1)}% > ${maximum}%)`,
      percentage
    }
  }
}

// Messages éducatifs
export const BUDGET_EDUCATION = {
  logement: "Règle d'or : MAX 20% pour le logement (vs 30% souvent pratiqué). Cela libère de l'argent pour l'épargne !",
  epargne: "Priorité absolue : MIN 20-25% en épargne. C'est votre liberté financière future !",
  total: "Objectif : Dépenses courantes <= 75%, Épargne >= 25%"
}
