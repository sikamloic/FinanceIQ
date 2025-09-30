// FinanceIQ - Écran de Verrouillage Sécurisé
// Interface PIN selon spécifications sécurité

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button } from './ui'
import NumericKeypad from './NumericKeypad'
import PinDisplay from './PinDisplay'
import { useSecurityManager } from '../data/lock'

interface LockScreenProps {
  onUnlock?: () => void
  onSetupComplete?: () => void
}

export default function LockScreen({ onUnlock, onSetupComplete }: LockScreenProps) {
  const [pin, setPin] = useState('')
  const [isSetupMode, setIsSetupMode] = useState(false)
  const [confirmPin, setConfirmPin] = useState('')
  const [step, setStep] = useState<'enter' | 'confirm'>('enter')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const security = useSecurityManager()

  // Vérifier si c'est la première utilisation
  useEffect(() => {
    const checkSetupMode = async () => {
      const hasPin = await security.hasStoredPin()
      setIsSetupMode(!hasPin)
    }
    
    checkSetupMode()
  }, [])

  // Ajouter un chiffre au PIN
  const addDigit = (digit: string) => {
    if (step === 'enter') {
      if (pin.length < 6) {
        setPin(prev => prev + digit)
        setError('')
      }
    } else {
      if (confirmPin.length < 6) {
        setConfirmPin(prev => prev + digit)
        setError('')
      }
    }
  }

  // Supprimer le dernier chiffre
  const removeDigit = () => {
    if (step === 'enter') {
      setPin(prev => prev.slice(0, -1))
    } else {
      setConfirmPin(prev => prev.slice(0, -1))
    }
    setError('')
  }

  // Effacer complètement
  const clearPin = () => {
    if (step === 'enter') {
      setPin('')
    } else {
      setConfirmPin('')
    }
    setError('')
  }

  // Valider le PIN
  const validatePin = async () => {
    if (isLoading) return

    setIsLoading(true)
    setError('')

    try {
      if (isSetupMode) {
        // Mode configuration
        if (step === 'enter') {
          // Première saisie
          if (pin.length < 4) {
            setError('PIN doit contenir au moins 4 chiffres')
            setIsLoading(false)
            return
          }
          
          setStep('confirm')
          setIsLoading(false)
          return
        } else {
          // Confirmation
          if (pin !== confirmPin) {
            setError('Les PIN ne correspondent pas')
            setStep('enter')
            setPin('')
            setConfirmPin('')
            setIsLoading(false)
            return
          }

          // Configurer le PIN
          await security.setupPin(pin)
          onSetupComplete?.()
        }
      } else {
        // Mode déverrouillage
        if (pin.length < 4) {
          setError('PIN trop court')
          setIsLoading(false)
          return
        }

        const success = await security.unlock(pin)
        
        if (success) {
          onUnlock?.()
        } else {
          setError('PIN incorrect')
          setPin('')
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur inconnue')
      setPin('')
      setConfirmPin('')
      if (isSetupMode) {
        setStep('enter')
      }
    }

    setIsLoading(false)
  }

  // PIN actuel selon l'étape
  const currentPin = step === 'enter' ? pin : confirmPin
  const isComplete = currentPin.length >= 4

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {isSetupMode ? 'Configuration Sécurité' : 'FinanceIQ'}
          </CardTitle>
          <p className="text-gray-600 mt-2">
            {isSetupMode 
              ? (step === 'enter' 
                  ? 'Créez votre PIN de sécurité (4-6 chiffres)'
                  : 'Confirmez votre PIN'
                )
              : 'Entrez votre PIN pour continuer'
            }
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Affichage PIN */}
          <div className="flex justify-center">
            <PinDisplay 
              pin={currentPin} 
              maxLength={6}
              error={!!error}
            />
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="text-center">
              <div className="text-red-600 text-sm font-medium bg-red-50 px-4 py-2 rounded-lg">
                {error}
              </div>
            </div>
          )}

          {/* Pavé numérique */}
          <NumericKeypad
            onNumberPress={addDigit}
            onBackspace={removeDigit}
            onClear={clearPin}
            disabled={isLoading}
          />

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={validatePin}
              disabled={!isComplete || isLoading}
              variant="primary"
              className="w-full"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Vérification...</span>
                </div>
              ) : (
                isSetupMode 
                  ? (step === 'enter' ? 'Continuer' : 'Confirmer PIN')
                  : 'Déverrouiller'
              )}
            </Button>

            {/* Bouton retour en mode confirmation */}
            {isSetupMode && step === 'confirm' && (
              <Button
                onClick={() => {
                  setStep('enter')
                  setConfirmPin('')
                  setError('')
                }}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                ← Modifier le PIN
              </Button>
            )}
          </div>

          {/* Informations sécurité */}
          <div className="text-center text-xs text-gray-500 space-y-1">
            <div>🔒 Données chiffrées localement</div>
            <div>⏱️ Verrouillage auto après 5 min d'inactivité</div>
            {!isSetupMode && (
              <div>🔄 Oubli PIN = Reset complet nécessaire</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
