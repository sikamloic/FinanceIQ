// FinanceIQ - Générateur d'IDs uniques
// Utilitaire pour créer des identifiants sécurisés

/**
 * Génère un ID unique basé sur timestamp + random
 * Format: timestamp_random (ex: 1703123456789_abc123)
 */
export function generateId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${timestamp}_${random}`
}

/**
 * Génère un ID court pour les transactions
 * Format: YYYYMMDD_HHMMSS_XXX (ex: 20241225_143022_a1b)
 */
export function generateTransactionId(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const time = now.toTimeString().slice(0, 8).replace(/:/g, '')
  const random = Math.random().toString(36).substring(2, 5)
  return `${date}_${time}_${random}`
}

/**
 * Génère un ID pour les revenus extra
 * Format: EXTRA_YYYYMMDD_XXX (ex: EXTRA_20241225_a1b)
 */
export function generateExtraIncomeId(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).substring(2, 5)
  return `EXTRA_${date}_${random}`
}

/**
 * Vérifie si un ID est valide
 */
export function isValidId(id: string): boolean {
  if (!id || typeof id !== 'string') return false
  
  // Format timestamp_random
  const timestampPattern = /^\d{13}_[a-z0-9]{6}$/
  
  // Format transaction
  const transactionPattern = /^\d{8}_\d{6}_[a-z0-9]{3}$/
  
  // Format extra income
  const extraPattern = /^EXTRA_\d{8}_[a-z0-9]{3}$/
  
  return timestampPattern.test(id) || 
         transactionPattern.test(id) || 
         extraPattern.test(id)
}
