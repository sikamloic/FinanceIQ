// Budget Douala - Tests Format XAF Utility
// I2.3 - Format XAF Utility

import { describe, it, expect } from 'vitest'
import { formatCurrencyXAF, formatCurrencyWithType, parseCurrencyXAF } from './format'

describe('formatCurrencyXAF', () => {
  describe('Formatage standard', () => {
    it('formate les montants simples', () => {
      expect(formatCurrencyXAF(0)).toBe('0\u00A0XAF')
      expect(formatCurrencyXAF(100)).toBe('100\u00A0XAF')
      expect(formatCurrencyXAF(1500)).toBe('1\u00A0500\u00A0XAF')
      expect(formatCurrencyXAF(38500)).toBe('38\u00A0500\u00A0XAF')
    })

    it('formate les grands montants', () => {
      expect(formatCurrencyXAF(250000)).toBe('250\u00A0000\u00A0XAF')
      expect(formatCurrencyXAF(1000000)).toBe('1\u00A0000\u00A0000\u00A0XAF')
      expect(formatCurrencyXAF(2500000)).toBe('2\u00A0500\u00A0000\u00A0XAF')
    })

    it('gère les nombres négatifs', () => {
      expect(formatCurrencyXAF(-1500)).toBe('-1\u00A0500\u00A0XAF')
      expect(formatCurrencyXAF(-38500)).toBe('-38\u00A0500\u00A0XAF')
    })

    it('arrondit les décimales', () => {
      expect(formatCurrencyXAF(1500.4)).toBe('1\u00A0500\u00A0XAF')
      expect(formatCurrencyXAF(1500.6)).toBe('1\u00A0501\u00A0XAF')
      expect(formatCurrencyXAF(38500.99)).toBe('38\u00A0501\u00A0XAF')
    })
  })

  describe('Options de formatage', () => {
    it('cache la devise avec showCurrency: false', () => {
      expect(formatCurrencyXAF(38500, { showCurrency: false })).toBe('38\u00A0500')
      expect(formatCurrencyXAF(1500, { showCurrency: false })).toBe('1\u00A0500')
    })

    it('affiche le signe avec sign: true', () => {
      expect(formatCurrencyXAF(1500, { sign: true })).toBe('+1\u00A0500\u00A0XAF')
      expect(formatCurrencyXAF(-1500, { sign: true })).toBe('-1\u00A0500\u00A0XAF')
      expect(formatCurrencyXAF(0, { sign: true })).toBe('0\u00A0XAF')
    })

    it('format compact pour grands nombres', () => {
      expect(formatCurrencyXAF(1500000, { compact: true })).toBe('1,5M XAF')
      expect(formatCurrencyXAF(2000000, { compact: true })).toBe('2,0M XAF')
      expect(formatCurrencyXAF(1500, { compact: true })).toBe('2k XAF')
      expect(formatCurrencyXAF(500, { compact: true })).toBe('500\u00A0XAF')
    })

    it('combine les options', () => {
      expect(formatCurrencyXAF(1500000, { 
        compact: true, 
        showCurrency: false 
      })).toBe('1,5M')
      
      expect(formatCurrencyXAF(1500, { 
        sign: true, 
        showCurrency: false 
      })).toBe('+1\u00A0500')
    })
  })

  describe('Cas limites', () => {
    it('gère les valeurs invalides', () => {
      expect(formatCurrencyXAF(NaN)).toBe('0\u00A0XAF')
      expect(formatCurrencyXAF(Infinity)).toBe('0\u00A0XAF')
      expect(formatCurrencyXAF(-Infinity)).toBe('0\u00A0XAF')
    })

    it('gère les très grands nombres', () => {
      expect(formatCurrencyXAF(999999999)).toBe('999\u00A0999\u00A0999\u00A0XAF')
    })
  })
})

describe('formatCurrencyWithType', () => {
  it('formate les revenus avec signe positif', () => {
    const result = formatCurrencyWithType(1500, 'income')
    expect(result.formatted).toBe('+1\u00A0500\u00A0XAF')
    expect(result.className).toBe('text-green-600')
  })

  it('formate les dépenses avec signe négatif', () => {
    const result = formatCurrencyWithType(1500, 'expense')
    expect(result.formatted).toBe('-1\u00A0500\u00A0XAF')
    expect(result.className).toBe('text-red-600')
  })

  it('gère les montants négatifs en entrée', () => {
    const result = formatCurrencyWithType(-1500, 'income')
    expect(result.formatted).toBe('+1\u00A0500\u00A0XAF')
    expect(result.className).toBe('text-green-600')
  })
})

describe('parseCurrencyXAF', () => {
  it('parse les formats XAF standards', () => {
    expect(parseCurrencyXAF('38 500 XAF')).toBe(38500)
    expect(parseCurrencyXAF('1 500 XAF')).toBe(1500)
    expect(parseCurrencyXAF('250 000 XAF')).toBe(250000)
  })

  it('parse les formats sans devise', () => {
    expect(parseCurrencyXAF('38500')).toBe(38500)
    expect(parseCurrencyXAF('1 500')).toBe(1500)
    expect(parseCurrencyXAF('38 500')).toBe(38500)
  })

  it('parse avec espaces insécables', () => {
    expect(parseCurrencyXAF('38\u00A0500\u00A0XAF')).toBe(38500)
    expect(parseCurrencyXAF('1\u00A0500\u00A0XAF')).toBe(1500)
  })

  it('parse les nombres négatifs', () => {
    expect(parseCurrencyXAF('-1 500 XAF')).toBe(-1500)
    expect(parseCurrencyXAF('-38500')).toBe(-38500)
  })

  it('gère les formats avec virgules décimales', () => {
    expect(parseCurrencyXAF('1 500,50 XAF')).toBe(1501) // Arrondi
    expect(parseCurrencyXAF('38 500,99')).toBe(38501)
  })

  it('retourne null pour les valeurs invalides', () => {
    expect(parseCurrencyXAF('')).toBe(null)
    expect(parseCurrencyXAF('abc')).toBe(null)
    expect(parseCurrencyXAF('XAF')).toBe(null)
    // @ts-expect-error - Test avec type incorrect
    expect(parseCurrencyXAF(null)).toBe(null)
    // @ts-expect-error - Test avec type incorrect
    expect(parseCurrencyXAF(undefined)).toBe(null)
  })

  it('nettoie les caractères parasites', () => {
    expect(parseCurrencyXAF('€38 500 XAF$')).toBe(38500)
    expect(parseCurrencyXAF('+ 1 500 XAF')).toBe(1500)
    expect(parseCurrencyXAF('1.500,00 XAF')).toBe(1500)
  })
})

describe('Cas d\'usage réels Budget Douala', () => {
  it('formate les montants typiques camerounais', () => {
    // Salaire moyen
    expect(formatCurrencyXAF(250000)).toBe('250\u00A0000\u00A0XAF')
    
    // Loyer Douala
    expect(formatCurrencyXAF(35000)).toBe('35\u00A0000\u00A0XAF')
    
    // Transport quotidien
    expect(formatCurrencyXAF(1500)).toBe('1\u00A0500\u00A0XAF')
    
    // Repas
    expect(formatCurrencyXAF(2500)).toBe('2\u00A0500\u00A0XAF')
    
    // Data mobile
    expect(formatCurrencyXAF(5000)).toBe('5\u00A0000\u00A0XAF')
  })

  it('parse les saisies utilisateur typiques', () => {
    expect(parseCurrencyXAF('1500')).toBe(1500)
    expect(parseCurrencyXAF('1 500')).toBe(1500)
    expect(parseCurrencyXAF('1500 XAF')).toBe(1500)
    expect(parseCurrencyXAF('1 500 XAF')).toBe(1500)
  })

  it('gère les calculs de budget', () => {
    const salaire = 250000
    const loyer = 35000
    const transport = 1500 * 22 // 22 jours ouvrés
    
    expect(formatCurrencyXAF(salaire)).toBe('250\u00A0000\u00A0XAF')
    expect(formatCurrencyXAF(loyer)).toBe('35\u00A0000\u00A0XAF')
    expect(formatCurrencyXAF(transport)).toBe('33\u00A0000\u00A0XAF')
    
    const reste = salaire - loyer - transport
    expect(formatCurrencyXAF(reste)).toBe('182\u00A0000\u00A0XAF')
  })
})
