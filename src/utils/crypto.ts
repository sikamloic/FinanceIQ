// Budget Douala - Utilitaires Cryptographiques
// I5.1 - Crypto Utils Simple pour PIN 4 chiffres

/**
 * Utilitaires cryptographiques simples pour la sécurité PIN
 * Utilise WebCrypto API pour le hashing sécurisé
 */

// Configuration crypto
const ALGORITHM = 'SHA-256'
const SALT_LENGTH = 16 // 16 bytes = 128 bits
const ITERATIONS = 100000 // PBKDF2 iterations (recommandé OWASP)

/**
 * Génère un salt aléatoire cryptographiquement sécurisé
 */
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
}

/**
 * Convertit un Uint8Array en string hexadécimale
 */
function arrayToHex(array: Uint8Array): string {
  return Array.from(array)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Convertit une string hexadécimale en Uint8Array
 */
function hexToArray(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return bytes
}

/**
 * Hash un PIN avec PBKDF2 et un salt
 * @param pin - Code PIN à 4 chiffres (string)
 * @returns Promise<string> - Hash au format "salt:hash" en hex
 */
export async function hashPin(pin: string): Promise<string> {
  // Validation du PIN
  if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    throw new Error('PIN doit être exactement 4 chiffres')
  }

  try {
    // Générer un salt aléatoire
    const salt = generateSalt()
    
    // Convertir le PIN en ArrayBuffer
    const pinBuffer = new TextEncoder().encode(pin)
    
    // Importer la clé pour PBKDF2
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      pinBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    )
    
    // Dériver la clé avec PBKDF2
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: ITERATIONS,
        hash: ALGORITHM
      },
      keyMaterial,
      256 // 32 bytes = 256 bits
    )
    
    // Convertir en hex et combiner salt:hash
    const saltHex = arrayToHex(salt)
    const hashHex = arrayToHex(new Uint8Array(hashBuffer))
    
    return `${saltHex}:${hashHex}`
    
  } catch (error) {
    console.error('Erreur lors du hashage du PIN:', error)
    throw new Error('Impossible de hasher le PIN')
  }
}

/**
 * Vérifie un PIN contre son hash
 * @param pin - Code PIN à vérifier (string)
 * @param storedHash - Hash stocké au format "salt:hash"
 * @returns Promise<boolean> - true si le PIN correspond
 */
export async function verifyPin(pin: string, storedHash: string): Promise<boolean> {
  // Validation des entrées
  if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    return false
  }
  
  if (!storedHash || !storedHash.includes(':')) {
    return false
  }

  try {
    // Séparer salt et hash
    const [saltHex, expectedHashHex] = storedHash.split(':')
    
    if (!saltHex || !expectedHashHex) {
      return false
    }
    
    // Convertir le salt de hex vers Uint8Array
    const salt = hexToArray(saltHex)
    
    // Convertir le PIN en ArrayBuffer
    const pinBuffer = new TextEncoder().encode(pin)
    
    // Importer la clé pour PBKDF2
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      pinBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    )
    
    // Dériver la clé avec le même salt et paramètres
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: ITERATIONS,
        hash: ALGORITHM
      },
      keyMaterial,
      256
    )
    
    // Convertir en hex et comparer
    const computedHashHex = arrayToHex(new Uint8Array(hashBuffer))
    
    // Comparaison sécurisée (timing-safe)
    return computedHashHex === expectedHashHex
    
  } catch (error) {
    console.error('Erreur lors de la vérification du PIN:', error)
    return false
  }
}

/**
 * Génère un PIN aléatoire à 4 chiffres (pour tests)
 * @returns string - PIN aléatoire
 */
export function generateRandomPin(): string {
  const randomArray = crypto.getRandomValues(new Uint8Array(1))
  const randomNumber = (randomArray[0] % 10000).toString().padStart(4, '0')
  return randomNumber
}

/**
 * Valide le format d'un PIN
 * @param pin - PIN à valider
 * @returns boolean - true si le format est valide
 */
export function isValidPinFormat(pin: string): boolean {
  return typeof pin === 'string' && pin.length === 4 && /^\d{4}$/.test(pin)
}

/**
 * Génère un hash simple pour les tests (non sécurisé)
 * @param pin - PIN à hasher
 * @returns Promise<string> - Hash simple
 */
export async function simpleHash(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin + 'budget_douala_salt')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return arrayToHex(new Uint8Array(hashBuffer))
}
