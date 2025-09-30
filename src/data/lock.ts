// FinanceIQ - Gestion Session et Verrouillage
// Auto-verrouillage après 5 min d'inactivité selon spécifications

import { encryptWithPin, decryptWithPin, generatePinTestData, verifyPin } from './crypto'

// Type pour les données chiffrées (dupliqué depuis crypto.ts)
interface EncryptedData {
  data: string
  iv: string
  salt: string
  version: number
}

/**
 * Configuration du système de verrouillage
 */
const LOCK_CONFIG = {
  // Délai d'inactivité avant verrouillage automatique (5 min selon specs)
  inactivityTimeout: 5 * 60 * 1000, // 5 minutes en ms
  
  // Clés de stockage local
  storageKeys: {
    pinTest: 'financeiq_pin_test',
    sessionActive: 'financeiq_session_active',
    lastActivity: 'financeiq_last_activity'
  },
  
  // Événements à surveiller pour détecter l'activité
  activityEvents: [
    'mousedown', 'mousemove', 'keypress', 'scroll', 
    'touchstart', 'click', 'focus'
  ] as const
} as const

/**
 * État de la session de sécurité
 */
interface SecuritySession {
  isUnlocked: boolean
  lastActivity: number
  pinHash?: string
  autoLockTimer?: number
}

/**
 * Gestionnaire de session sécurisée
 */
class SecurityManager {
  private session: SecuritySession = {
    isUnlocked: false,
    lastActivity: Date.now()
  }
  
  private activityListeners: (() => void)[] = []
  private onLockCallbacks: (() => void)[] = []

  /**
   * Initialise le gestionnaire de sécurité
   */
  async initialize(): Promise<void> {
    // Vérifier si un PIN existe déjà
    const hasExistingPin = await this.hasStoredPin()
    
    if (hasExistingPin) {
      // PIN existe, session verrouillée par défaut
      this.session.isUnlocked = false
    } else {
      // Première utilisation, pas de PIN configuré
      this.session.isUnlocked = true
    }

    // Démarrer la surveillance d'activité
    this.startActivityMonitoring()
    
    // Vérifier le verrouillage au chargement
    this.checkAutoLock()
  }

  /**
   * Configure un nouveau PIN (première utilisation)
   */
  async setupPin(pin: string): Promise<void> {
    try {
      // Valider le PIN
      if (!/^\d{4,6}$/.test(pin)) {
        throw new Error('PIN doit contenir 4 à 6 chiffres')
      }

      // Générer des données test chiffrées
      const testData = await generatePinTestData(pin)
      
      // Stocker les données test
      localStorage.setItem(
        LOCK_CONFIG.storageKeys.pinTest, 
        JSON.stringify(testData)
      )

      // Déverrouiller la session
      this.session.isUnlocked = true
      this.session.lastActivity = Date.now()
      
      // Démarrer le timer d'auto-verrouillage
      this.resetAutoLockTimer()
      
      console.log('✅ PIN configuré avec succès')
    } catch (error) {
      throw new Error(`Erreur configuration PIN: ${error instanceof Error ? error.message : 'Inconnue'}`)
    }
  }

  /**
   * Déverrouille la session avec un PIN
   */
  async unlock(pin: string): Promise<boolean> {
    try {
      const testDataJson = localStorage.getItem(LOCK_CONFIG.storageKeys.pinTest)
      
      if (!testDataJson) {
        throw new Error('Aucun PIN configuré')
      }

      const testData: EncryptedData = JSON.parse(testDataJson)
      
      // Vérifier le PIN
      const isValid = await verifyPin(pin, testData)
      
      if (isValid) {
        this.session.isUnlocked = true
        this.session.lastActivity = Date.now()
        this.resetAutoLockTimer()
        
        console.log('✅ Session déverrouillée')
        return true
      } else {
        console.log('❌ PIN incorrect')
        return false
      }
    } catch (error) {
      console.error('Erreur déverrouillage:', error)
      return false
    }
  }

  /**
   * Verrouille immédiatement la session
   */
  lock(): void {
    this.session.isUnlocked = false
    this.clearAutoLockTimer()
    
    // Notifier les callbacks
    this.onLockCallbacks.forEach(callback => callback())
    
    console.log('🔒 Session verrouillée')
  }

  /**
   * Vérifie si la session est déverrouillée
   */
  isUnlocked(): boolean {
    return this.session.isUnlocked
  }

  /**
   * Vérifie si un PIN est déjà configuré
   */
  async hasStoredPin(): Promise<boolean> {
    const testData = localStorage.getItem(LOCK_CONFIG.storageKeys.pinTest)
    return testData !== null
  }

  /**
   * Enregistre un callback appelé lors du verrouillage
   */
  onLock(callback: () => void): void {
    this.onLockCallbacks.push(callback)
  }

  /**
   * Supprime tous les callbacks de verrouillage
   */
  clearLockCallbacks(): void {
    this.onLockCallbacks = []
  }

  /**
   * Reset complet - efface PIN et données
   */
  async resetComplete(): Promise<void> {
    // Effacer les données de sécurité
    localStorage.removeItem(LOCK_CONFIG.storageKeys.pinTest)
    localStorage.removeItem(LOCK_CONFIG.storageKeys.sessionActive)
    localStorage.removeItem(LOCK_CONFIG.storageKeys.lastActivity)
    
    // Réinitialiser la session
    this.session = {
      isUnlocked: true, // Pas de PIN = déverrouillé
      lastActivity: Date.now()
    }
    
    this.clearAutoLockTimer()
    
    console.log('🗑️ Reset sécurité complet effectué')
  }

  /**
   * Démarre la surveillance d'activité utilisateur
   */
  private startActivityMonitoring(): void {
    const updateActivity = () => {
      if (this.session.isUnlocked) {
        this.session.lastActivity = Date.now()
        this.resetAutoLockTimer()
      }
    }

    // Ajouter les listeners d'événements
    LOCK_CONFIG.activityEvents.forEach(eventType => {
      const listener = () => updateActivity()
      document.addEventListener(eventType, listener, { passive: true })
      this.activityListeners.push(() => {
        document.removeEventListener(eventType, listener)
      })
    })
  }

  /**
   * Arrête la surveillance d'activité
   */
  private stopActivityMonitoring(): void {
    this.activityListeners.forEach(removeListener => removeListener())
    this.activityListeners = []
  }

  /**
   * Remet à zéro le timer d'auto-verrouillage
   */
  private resetAutoLockTimer(): void {
    this.clearAutoLockTimer()
    
    if (this.session.isUnlocked) {
      this.session.autoLockTimer = window.setTimeout(() => {
        this.lock()
      }, LOCK_CONFIG.inactivityTimeout)
    }
  }

  /**
   * Efface le timer d'auto-verrouillage
   */
  private clearAutoLockTimer(): void {
    if (this.session.autoLockTimer) {
      clearTimeout(this.session.autoLockTimer)
      this.session.autoLockTimer = undefined
    }
  }

  /**
   * Vérifie si la session doit être verrouillée au chargement
   */
  private checkAutoLock(): void {
    const lastActivityStr = localStorage.getItem(LOCK_CONFIG.storageKeys.lastActivity)
    
    if (lastActivityStr) {
      const lastActivity = parseInt(lastActivityStr, 10)
      const timeSinceActivity = Date.now() - lastActivity
      
      if (timeSinceActivity > LOCK_CONFIG.inactivityTimeout) {
        // Trop de temps écoulé, verrouiller
        this.lock()
      }
    }
  }

  /**
   * Nettoyage lors de la fermeture
   */
  destroy(): void {
    this.stopActivityMonitoring()
    this.clearAutoLockTimer()
    this.clearLockCallbacks()
  }
}

// Instance singleton
export const securityManager = new SecurityManager()

/**
 * Hook React pour utiliser le gestionnaire de sécurité
 */
export function useSecurityManager() {
  return {
    initialize: () => securityManager.initialize(),
    setupPin: (pin: string) => securityManager.setupPin(pin),
    unlock: (pin: string) => securityManager.unlock(pin),
    lock: () => securityManager.lock(),
    isUnlocked: () => securityManager.isUnlocked(),
    hasStoredPin: () => securityManager.hasStoredPin(),
    onLock: (callback: () => void) => securityManager.onLock(callback),
    resetComplete: () => securityManager.resetComplete()
  }
}

/**
 * Utilitaires pour tests
 */
export const SecurityUtils = {
  LOCK_CONFIG,
  SecurityManager
}
