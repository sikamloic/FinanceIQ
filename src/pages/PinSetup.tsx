// Budget Douala - Page Configuration PIN
// I5.2 - Écran PIN Setup avec pavé numérique

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui'
import NumericKeypad from '../components/NumericKeypad'
import PinDisplay from '../components/PinDisplay'
import { hashPin } from '../utils/crypto'
// import { useSettings } from '../hooks/useSettings' // Pour future intégration

type SetupStep = 'enter' | 'confirm' | 'success' | 'error'

interface PinSetupProps {
  onComplete?: (pinHash: string) => void
}

export default function PinSetup({ onComplete }: PinSetupProps = {}) {
  const [step, setStep] = useState<SetupStep>('enter')
  const [firstPin, setFirstPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // const { settings } = useSettings() // Pour future intégration sauvegarde
  // PIN actuel selon l'étape
  const currentPin = step === 'enter' ? firstPin : confirmPin
  const isComplete = currentPin.length === 4

  // Ajouter un chiffre
  const handleNumberPress = (number: string) => {
    if (currentPin.length >= 4) return

    if (step === 'enter') {
      setFirstPin(prev => prev + number)
    } else if (step === 'confirm') {
      setConfirmPin(prev => prev + number)
    }
    
    setError('')
  }

  // Supprimer le dernier chiffre
  const handleBackspace = () => {
    if (step === 'enter') {
      setFirstPin(prev => prev.slice(0, -1))
    } else if (step === 'confirm') {
      setConfirmPin(prev => prev.slice(0, -1))
    }
    
    setError('')
  }

  // Effacer tout
  const handleClear = () => {
    if (step === 'enter') {
      setFirstPin('')
    } else if (step === 'confirm') {
      setConfirmPin('')
    }
    
    setError('')
  }

  // Continuer vers la confirmation
  const handleContinue = () => {
    if (step === 'enter' && firstPin.length === 4) {
      setStep('confirm')
      setConfirmPin('')
    }
  }

  // Retour à la première étape
  const handleBack = () => {
    if (step === 'confirm') {
      setStep('enter')
      setConfirmPin('')
      setError('')
    }
  }

  // Sauvegarder le PIN
  const handleSave = async () => {
    if (firstPin !== confirmPin) {
      setError('Les codes PIN ne correspondent pas')
      setStep('enter')
      setFirstPin('')
      setConfirmPin('')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Hasher le PIN
      const hashedPin = await hashPin(firstPin)
      
      // Sauvegarder en settings IndexedDB
      try {
        const { db } = await import('../data/db')
        
        // Récupérer ou créer les settings
        let settings = await db.settings.get('singleton')
        if (!settings) {
          const { DEFAULT_SETTINGS } = await import('../types')
          settings = {
            id: 'singleton',
            ...DEFAULT_SETTINGS,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
        
        // Ajouter le hash PIN
        await db.settings.put({
          ...settings,
          pinHash: hashedPin,
          updatedAt: new Date().toISOString()
        })
        
        console.log('PIN hashé sauvegardé en settings IndexedDB')
      } catch (error) {
        console.error('Erreur sauvegarde settings:', error)
        // Fallback localStorage
        localStorage.setItem('budget_douala_pin_hash', hashedPin)
      }
      
      // Callback pour notifier la completion
      if (onComplete) {
        onComplete(hashedPin)
      }
      
      // Succès
      setStep('success')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
      setStep('error')
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-continue quand PIN complet
  const handlePinComplete = () => {
    if (step === 'enter' && firstPin.length === 4) {
      setTimeout(() => handleContinue(), 300)
    } else if (step === 'confirm' && confirmPin.length === 4) {
      setTimeout(() => handleSave(), 300)
    }
  }

  // Effet pour auto-continue
  if (isComplete && !isLoading) {
    handlePinComplete()
  }

  const getStepTitle = () => {
    switch (step) {
      case 'enter':
        return 'Créer votre code PIN'
      case 'confirm':
        return 'Confirmer votre code PIN'
      case 'success':
        return 'PIN configuré avec succès !'
      case 'error':
        return 'Erreur de configuration'
      default:
        return 'Configuration PIN'
    }
  }

  const getStepDescription = () => {
    switch (step) {
      case 'enter':
        return 'Choisissez un code PIN à 4 chiffres pour sécuriser votre application'
      case 'confirm':
        return 'Saisissez à nouveau votre code PIN pour le confirmer'
      case 'success':
        return 'Votre code PIN a été configuré. Vous pouvez maintenant accéder à l\'application.'
      case 'error':
        return 'Une erreur s\'est produite lors de la configuration du PIN.'
      default:
        return ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <CardTitle className="text-xl">{getStepTitle()}</CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            {getStepDescription()}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Affichage PIN */}
          <div className="text-center">
            <PinDisplay
              pin={currentPin}
              error={!!error}
              className="mb-4"
            />
            
            {error && (
              <div className="text-red-600 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Pavé numérique */}
          {(step === 'enter' || step === 'confirm') && (
            <NumericKeypad
              onNumberPress={handleNumberPress}
              onBackspace={handleBackspace}
              onClear={handleClear}
              disabled={isLoading}
            />
          )}

          {/* Actions */}
          <div className="space-y-3">
            {step === 'confirm' && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleBack}
                disabled={isLoading}
              >
                ← Retour
              </Button>
            )}

            {step === 'success' && (
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  // Navigation vers l'app (à implémenter)
                  console.log('Navigation vers l\'application')
                }}
              >
                Accéder à l'application →
              </Button>
            )}

            {step === 'error' && (
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  setStep('enter')
                  setFirstPin('')
                  setConfirmPin('')
                  setError('')
                }}
              >
                Réessayer
              </Button>
            )}
          </div>

          {/* Indicateur de progression */}
          <div className="flex justify-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              step === 'enter' ? 'bg-blue-500' : 'bg-gray-300'
            }`} />
            <div className={`w-2 h-2 rounded-full ${
              step === 'confirm' ? 'bg-blue-500' : 'bg-gray-300'
            }`} />
            <div className={`w-2 h-2 rounded-full ${
              step === 'success' ? 'bg-green-500' : 'bg-gray-300'
            }`} />
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="text-center">
              <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              <div className="text-sm text-gray-600">Configuration en cours...</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
