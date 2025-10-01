// Budget Douala - Format Utilities
// I2.3 - Format XAF Utility

/**
 * Formate un montant en XAF avec espaces comme séparateurs de milliers
 * Standard Cameroun : "38 500 XAF" (espaces insécables)
 * @param amount Montant en XAF (entier)
 * @param options Options de formatage
 * @returns Chaîne formatée "38 500 XAF"
 */
export function formatCurrencyXAF(
  amount: number, 
  options: {
    showCurrency?: boolean
    compact?: boolean
    sign?: boolean
  } = {}
): string {
  const { showCurrency = true, compact = false, sign = false } = options
  
  // Gestion des cas limites
  if (!Number.isFinite(amount)) {
    return showCurrency ? '0\u00A0XAF' : '0'
  }
  
  // Arrondit à l'entier (XAF n'a pas de centimes)
  const roundedAmount = Math.round(amount)
  
  // Format compact pour grands nombres (optionnel)
  if (compact && Math.abs(roundedAmount) >= 1000000) {
    const millions = roundedAmount / 1000000
    const formatted = millions.toFixed(1).replace('.', ',')
    return showCurrency ? `${formatted}M XAF` : `${formatted}M`
  }
  
  if (compact && Math.abs(roundedAmount) >= 1000) {
    const thousands = roundedAmount / 1000
    const formatted = thousands.toFixed(0)
    return showCurrency ? `${formatted}k XAF` : `${formatted}k`
  }
  
  // Formatage standard avec espaces insécables
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.abs(roundedAmount))
  
  // Remplace les espaces par des espaces insécables (U+00A0)
  const withSpaces = formatted.replace(/\s/g, '\u00A0')
  
  // Gestion du signe
  let result = withSpaces
  if (roundedAmount < 0) {
    result = `-${withSpaces}`
  } else if (sign && roundedAmount > 0) {
    result = `+${withSpaces}`
  }
  
  // Ajoute la devise
  return showCurrency ? `${result}\u00A0XAF` : result
}

/**
 * Formate un montant avec couleur selon le type (revenus/dépenses)
 * @param amount Montant en XAF
 * @param type Type de transaction
 * @returns Objet avec montant formaté et classe CSS
 */
export function formatCurrencyWithType(
  amount: number, 
  type: 'income' | 'expense'
): { formatted: string; className: string } {
  const isNegative = type === 'expense'
  const displayAmount = isNegative ? -Math.abs(amount) : Math.abs(amount)
  
  return {
    formatted: formatCurrencyXAF(displayAmount, { sign: true }),
    className: type === 'income' ? 'text-green-600' : 'text-red-600'
  }
}

/**
 * Parse une chaîne XAF vers un nombre
 * @param xafString Chaîne "38 500 XAF" ou "38500"
 * @returns Nombre ou null si invalide
 */
export function parseCurrencyXAF(xafString: string): number | null {
  if (!xafString || typeof xafString !== 'string') {
    return null
  }
  
  // Nettoie la chaîne
  const cleaned = xafString
    .replace(/XAF/gi, '')
    .replace(/\s/g, '') // Tous types d'espaces
    .replace(/[^\d,-]/g, '')
    .replace(',', '.')
  
  const parsed = parseFloat(cleaned)
  return Number.isFinite(parsed) ? Math.round(parsed) : null
}

/**
 * Formate une date au fuseau Africa/Douala
 * @param date Date ISO string ou Date object
 * @returns Date formatée pour Douala
 */
export function formatDateDouala(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return dateObj.toLocaleDateString('fr-FR', {
    timeZone: 'Africa/Douala',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Formate une date en français lisible
 * @param date Date ISO string (YYYY-MM-DD) ou Date object
 * @returns Date formatée "25 déc. 2024"
 */
export function formatDateFR(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date + 'T00:00:00') : date
  
  return dateObj.toLocaleDateString('fr-FR', {
    timeZone: 'Africa/Douala',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

/**
 * Obtient la date actuelle au fuseau Africa/Douala
 * @returns Date ISO string (YYYY-MM-DD)
 */
export function getCurrentDateDouala(): string {
  const now = new Date()
  
  // Convertit au fuseau Africa/Douala
  const doualaDate = new Date(now.toLocaleString('en-US', {
    timeZone: 'Africa/Douala'
  }))
  
  // Retourne au format ISO YYYY-MM-DD
  return doualaDate.toISOString().split('T')[0]
}

/**
 * Obtient le mois courant au format YYYY-MM
 * @returns Mois courant "2025-09"
 */
export function getCurrentMonthDouala(): string {
  return getCurrentDateDouala().slice(0, 7) // YYYY-MM
}
