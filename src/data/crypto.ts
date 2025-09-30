// FinanceIQ - Cryptographie Locale
// Implémentation sécurisée selon spécifications : AES-GCM 256 + PBKDF2

/**
 * Configuration cryptographique selon spécifications
 */
const CRYPTO_CONFIG = {
  // PBKDF2 pour dérivation de clé depuis PIN
  pbkdf2: {
    algorithm: 'PBKDF2',
    hash: 'SHA-256',
    iterations: 200000, // ≥200k selon specs
    keyLength: 256 // bits
  },
  
  // AES-GCM pour chiffrement symétrique
  aes: {
    algorithm: 'AES-GCM',
    keyLength: 256, // bits
    ivLength: 12,   // bytes (96 bits recommandé pour GCM)
    tagLength: 128  // bits
  }
} as const

/**
 * Structure des données chiffrées
 */
interface EncryptedData {
  data: string      // Base64 des données chiffrées
  iv: string        // Base64 de l'IV
  salt: string      // Base64 du salt PBKDF2
  version: number   // Version du schéma de chiffrement
}

/**
 * Génère un salt cryptographiquement sécurisé
 */
function generateSalt(length: number = 32): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length))
}

/**
 * Génère un IV (Initialization Vector) pour AES-GCM
 */
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(CRYPTO_CONFIG.aes.ivLength))
}

/**
 * Dérive une clé cryptographique depuis un PIN 6 chiffres
 * Utilise PBKDF2 avec SHA-256 et ≥200k itérations
 */
async function deriveKeyFromPin(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  // Validation PIN 6 chiffres
  if (!/^\d{4,6}$/.test(pin)) {
    throw new Error('PIN doit contenir 4 à 6 chiffres')
  }

  // Encoder le PIN en UTF-8
  const pinBuffer = new TextEncoder().encode(pin)
  
  // Importer le PIN comme clé de base
  const baseKey = await crypto.subtle.importKey(
    'raw',
    pinBuffer,
    CRYPTO_CONFIG.pbkdf2.algorithm,
    false,
    ['deriveKey']
  )

  // Dériver la clé finale avec PBKDF2
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: CRYPTO_CONFIG.pbkdf2.algorithm,
      salt: salt,
      iterations: CRYPTO_CONFIG.pbkdf2.iterations,
      hash: CRYPTO_CONFIG.pbkdf2.hash
    },
    baseKey,
    {
      name: CRYPTO_CONFIG.aes.algorithm,
      length: CRYPTO_CONFIG.aes.keyLength
    },
    false, // Non extractible pour sécurité
    ['encrypt', 'decrypt']
  )

  return derivedKey
}

/**
 * Chiffre des données JSON avec AES-GCM
 */
async function encryptJSON<T>(data: T, key: CryptoKey): Promise<EncryptedData> {
  try {
    // Sérialiser les données
    const jsonString = JSON.stringify(data)
    const dataBuffer = new TextEncoder().encode(jsonString)
    
    // Générer IV aléatoire
    const iv = generateIV()
    
    // Chiffrer avec AES-GCM
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: CRYPTO_CONFIG.aes.algorithm,
        iv: iv,
        tagLength: CRYPTO_CONFIG.aes.tagLength
      },
      key,
      dataBuffer
    )

    // Encoder en Base64 pour stockage
    const encryptedData = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)))
    const ivBase64 = btoa(String.fromCharCode(...iv))
    
    return {
      data: encryptedData,
      iv: ivBase64,
      salt: '', // Sera rempli par la fonction appelante
      version: 1
    }
  } catch (error) {
    throw new Error(`Erreur de chiffrement: ${error instanceof Error ? error.message : 'Inconnue'}`)
  }
}

/**
 * Déchiffre des données JSON avec AES-GCM
 */
async function decryptJSON<T>(encryptedData: EncryptedData, key: CryptoKey): Promise<T> {
  try {
    // Décoder depuis Base64
    const dataBuffer = Uint8Array.from(atob(encryptedData.data), c => c.charCodeAt(0))
    const iv = Uint8Array.from(atob(encryptedData.iv), c => c.charCodeAt(0))
    
    // Déchiffrer avec AES-GCM
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: CRYPTO_CONFIG.aes.algorithm,
        iv: iv,
        tagLength: CRYPTO_CONFIG.aes.tagLength
      },
      key,
      dataBuffer
    )

    // Désérialiser JSON
    const jsonString = new TextDecoder().decode(decryptedBuffer)
    return JSON.parse(jsonString) as T
  } catch (error) {
    throw new Error(`Erreur de déchiffrement: ${error instanceof Error ? error.message : 'Données corrompues'}`)
  }
}

/**
 * Chiffre des données avec un PIN (fonction complète)
 */
export async function encryptWithPin<T>(data: T, pin: string): Promise<EncryptedData> {
  const salt = generateSalt()
  const key = await deriveKeyFromPin(pin, salt)
  const encrypted = await encryptJSON(data, key)
  
  // Ajouter le salt à la structure
  encrypted.salt = btoa(String.fromCharCode(...salt))
  
  return encrypted
}

/**
 * Déchiffre des données avec un PIN (fonction complète)
 */
export async function decryptWithPin<T>(encryptedData: EncryptedData, pin: string): Promise<T> {
  const salt = Uint8Array.from(atob(encryptedData.salt), c => c.charCodeAt(0))
  const key = await deriveKeyFromPin(pin, salt)
  
  return await decryptJSON<T>(encryptedData, key)
}

/**
 * Vérifie si un PIN est correct en tentant de déchiffrer des données test
 */
export async function verifyPin(pin: string, testData: EncryptedData): Promise<boolean> {
  try {
    await decryptWithPin(testData, pin)
    return true
  } catch {
    return false
  }
}

/**
 * Génère des données test chiffrées pour validation PIN
 */
export async function generatePinTestData(pin: string): Promise<EncryptedData> {
  const testPayload = { 
    test: 'financeiq_pin_validation', 
    timestamp: Date.now() 
  }
  
  return await encryptWithPin(testPayload, pin)
}

/**
 * Efface de manière sécurisée une clé de la mémoire
 * Note: JavaScript ne permet pas l'effacement sécurisé complet
 */
export function secureWipe(data: any): void {
  if (typeof data === 'string') {
    // Tentative d'overwrite (limité en JS)
    data = '0'.repeat(data.length)
  }
  // En production, considérer des techniques additionnelles
}

/**
 * Utilitaires pour tests et debug
 */
export const CryptoUtils = {
  generateSalt,
  generateIV,
  deriveKeyFromPin,
  encryptJSON,
  decryptJSON,
  CRYPTO_CONFIG
}
