// FinanceIQ - Tests Cryptographie
// Tests unitaires pour vérifier la sécurité selon spécifications

import { describe, it, expect } from 'vitest'
import { 
  encryptWithPin, 
  decryptWithPin, 
  verifyPin, 
  generatePinTestData,
  CryptoUtils 
} from './crypto'

describe('Cryptographie FinanceIQ', () => {
  const testPin = '123456'
  const testData = { 
    test: 'données sensibles', 
    amount: 50000, 
    category: 'Transport' 
  }

  it('devrait chiffrer et déchiffrer des données correctement', async () => {
    // Chiffrer
    const encrypted = await encryptWithPin(testData, testPin)
    
    // Vérifier la structure
    expect(encrypted).toHaveProperty('data')
    expect(encrypted).toHaveProperty('iv')
    expect(encrypted).toHaveProperty('salt')
    expect(encrypted.version).toBe(1)
    
    // Déchiffrer
    const decrypted = await decryptWithPin(encrypted, testPin)
    
    // Vérifier l'intégrité
    expect(decrypted).toEqual(testData)
  })

  it('devrait échouer avec un mauvais PIN', async () => {
    const encrypted = await encryptWithPin(testData, testPin)
    
    await expect(
      decryptWithPin(encrypted, '654321')
    ).rejects.toThrow()
  })

  it('devrait valider un PIN correct', async () => {
    const testData = await generatePinTestData(testPin)
    
    const isValid = await verifyPin(testPin, testData)
    expect(isValid).toBe(true)
    
    const isInvalid = await verifyPin('000000', testData)
    expect(isInvalid).toBe(false)
  })

  it('devrait accepter des PIN de 4 à 6 chiffres', async () => {
    const pins = ['1234', '12345', '123456']
    
    for (const pin of pins) {
      const encrypted = await encryptWithPin(testData, pin)
      const decrypted = await decryptWithPin(encrypted, pin)
      expect(decrypted).toEqual(testData)
    }
  })

  it('devrait rejeter des PIN invalides', async () => {
    const invalidPins = ['123', '1234567', 'abcd', '12a4']
    
    for (const pin of invalidPins) {
      await expect(
        encryptWithPin(testData, pin)
      ).rejects.toThrow('PIN doit contenir 4 à 6 chiffres')
    }
  })

  it('devrait générer des salts et IV aléatoires', async () => {
    const encrypted1 = await encryptWithPin(testData, testPin)
    const encrypted2 = await encryptWithPin(testData, testPin)
    
    // Même données, même PIN, mais différents salt/IV
    expect(encrypted1.salt).not.toBe(encrypted2.salt)
    expect(encrypted1.iv).not.toBe(encrypted2.iv)
    expect(encrypted1.data).not.toBe(encrypted2.data)
    
    // Mais déchiffrement identique
    const decrypted1 = await decryptWithPin(encrypted1, testPin)
    const decrypted2 = await decryptWithPin(encrypted2, testPin)
    expect(decrypted1).toEqual(decrypted2)
  })

  it('devrait respecter la configuration cryptographique', () => {
    const config = CryptoUtils.CRYPTO_CONFIG
    
    // Vérifier les paramètres selon spécifications
    expect(config.pbkdf2.iterations).toBeGreaterThanOrEqual(200000)
    expect(config.pbkdf2.hash).toBe('SHA-256')
    expect(config.aes.algorithm).toBe('AES-GCM')
    expect(config.aes.keyLength).toBe(256)
  })
})
