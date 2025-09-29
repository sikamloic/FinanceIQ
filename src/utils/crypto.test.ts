// Budget Douala - Tests Crypto Utils
// I5.1 - Tests pour les utilitaires cryptographiques

import { describe, it, expect } from 'vitest'
import { hashPin, verifyPin, generateRandomPin, isValidPinFormat, simpleHash } from './crypto'

describe('Crypto Utils', () => {
  describe('hashPin', () => {
    it('hash un PIN valide à 4 chiffres', async () => {
      const pin = '1234'
      const hash = await hashPin(pin)
      
      expect(hash).toBeDefined()
      expect(typeof hash).toBe('string')
      expect(hash).toContain(':') // Format salt:hash
      
      const [salt, hashPart] = hash.split(':')
      expect(salt).toHaveLength(32) // 16 bytes = 32 hex chars
      expect(hashPart).toHaveLength(64) // 32 bytes = 64 hex chars
    })

    it('génère des hashs différents pour le même PIN (salt unique)', async () => {
      const pin = '1234'
      const hash1 = await hashPin(pin)
      const hash2 = await hashPin(pin)
      
      expect(hash1).not.toBe(hash2) // Différents à cause du salt
    })

    it('rejette les PIN invalides', async () => {
      await expect(hashPin('')).rejects.toThrow('PIN doit être exactement 4 chiffres')
      await expect(hashPin('123')).rejects.toThrow('PIN doit être exactement 4 chiffres')
      await expect(hashPin('12345')).rejects.toThrow('PIN doit être exactement 4 chiffres')
      await expect(hashPin('abcd')).rejects.toThrow('PIN doit être exactement 4 chiffres')
      await expect(hashPin('12a4')).rejects.toThrow('PIN doit être exactement 4 chiffres')
    })
  })

  describe('verifyPin', () => {
    it('vérifie correctement un PIN valide', async () => {
      const pin = '5678'
      const hash = await hashPin(pin)
      
      const isValid = await verifyPin(pin, hash)
      expect(isValid).toBe(true)
    })

    it('rejette un PIN incorrect', async () => {
      const correctPin = '5678'
      const wrongPin = '1234'
      const hash = await hashPin(correctPin)
      
      const isValid = await verifyPin(wrongPin, hash)
      expect(isValid).toBe(false)
    })

    it('rejette les PIN invalides', async () => {
      const hash = await hashPin('1234')
      
      expect(await verifyPin('', hash)).toBe(false)
      expect(await verifyPin('123', hash)).toBe(false)
      expect(await verifyPin('12345', hash)).toBe(false)
      expect(await verifyPin('abcd', hash)).toBe(false)
    })

    it('rejette les hash malformés', async () => {
      const pin = '1234'
      
      expect(await verifyPin(pin, '')).toBe(false)
      expect(await verifyPin(pin, 'invalid')).toBe(false)
      expect(await verifyPin(pin, 'salt')).toBe(false)
      expect(await verifyPin(pin, ':hash')).toBe(false)
      expect(await verifyPin(pin, 'salt:')).toBe(false)
    })
  })

  describe('Cycle complet hash/verify', () => {
    it('fonctionne avec différents PIN', async () => {
      const pins = ['0000', '1234', '5678', '9999', '0123', '9876']
      
      for (const pin of pins) {
        const hash = await hashPin(pin)
        const isValid = await verifyPin(pin, hash)
        expect(isValid).toBe(true)
        
        // Vérifier qu'un autre PIN ne fonctionne pas
        const wrongPin = pin === '0000' ? '1111' : '0000'
        const isWrong = await verifyPin(wrongPin, hash)
        expect(isWrong).toBe(false)
      }
    })

    it('maintient la sécurité avec des PIN similaires', async () => {
      const pin1 = '1234'
      const pin2 = '1235' // Très similaire
      
      const hash1 = await hashPin(pin1)
      const hash2 = await hashPin(pin2)
      
      expect(hash1).not.toBe(hash2)
      expect(await verifyPin(pin1, hash1)).toBe(true)
      expect(await verifyPin(pin2, hash2)).toBe(true)
      expect(await verifyPin(pin1, hash2)).toBe(false)
      expect(await verifyPin(pin2, hash1)).toBe(false)
    })
  })

  describe('generateRandomPin', () => {
    it('génère un PIN à 4 chiffres', () => {
      const pin = generateRandomPin()
      expect(pin).toHaveLength(4)
      expect(/^\d{4}$/.test(pin)).toBe(true)
    })

    it('génère des PIN différents', () => {
      const pins = Array.from({ length: 10 }, () => generateRandomPin())
      const uniquePins = new Set(pins)
      
      // Il devrait y avoir plusieurs PIN différents (probabilité très élevée)
      expect(uniquePins.size).toBeGreaterThan(1)
    })
  })

  describe('isValidPinFormat', () => {
    it('valide les PIN corrects', () => {
      expect(isValidPinFormat('0000')).toBe(true)
      expect(isValidPinFormat('1234')).toBe(true)
      expect(isValidPinFormat('9999')).toBe(true)
      expect(isValidPinFormat('0123')).toBe(true)
    })

    it('rejette les PIN incorrects', () => {
      expect(isValidPinFormat('')).toBe(false)
      expect(isValidPinFormat('123')).toBe(false)
      expect(isValidPinFormat('12345')).toBe(false)
      expect(isValidPinFormat('abcd')).toBe(false)
      expect(isValidPinFormat('12a4')).toBe(false)
      expect(isValidPinFormat('12.4')).toBe(false)
      expect(isValidPinFormat(' 1234')).toBe(false)
      expect(isValidPinFormat('1234 ')).toBe(false)
    })
  })

  describe('simpleHash', () => {
    it('génère un hash simple', async () => {
      const pin = '1234'
      const hash = await simpleHash(pin)
      
      expect(hash).toBeDefined()
      expect(typeof hash).toBe('string')
      expect(hash).toHaveLength(64) // SHA-256 = 64 hex chars
    })

    it('génère le même hash pour le même PIN', async () => {
      const pin = '1234'
      const hash1 = await simpleHash(pin)
      const hash2 = await simpleHash(pin)
      
      expect(hash1).toBe(hash2)
    })

    it('génère des hash différents pour des PIN différents', async () => {
      const hash1 = await simpleHash('1234')
      const hash2 = await simpleHash('5678')
      
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('Performance et sécurité', () => {
    it('hash et vérifie rapidement', async () => {
      const pin = '1234'
      
      const startTime = performance.now()
      const hash = await hashPin(pin)
      const hashTime = performance.now() - startTime
      
      const verifyStartTime = performance.now()
      const isValid = await verifyPin(pin, hash)
      const verifyTime = performance.now() - verifyStartTime
      
      expect(isValid).toBe(true)
      expect(hashTime).toBeLessThan(1000) // < 1 seconde
      expect(verifyTime).toBeLessThan(1000) // < 1 seconde
    })

    it('utilise un salt de longueur appropriée', async () => {
      const pin = '1234'
      const hash = await hashPin(pin)
      const [salt] = hash.split(':')
      
      expect(salt).toHaveLength(32) // 16 bytes = 32 hex chars
    })
  })
})
