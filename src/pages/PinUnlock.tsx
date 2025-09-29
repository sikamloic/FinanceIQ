// Budget Douala - Page Déverrouillage PIN
// I5.3 - Écran PIN Unlock au lancement

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui'
import NumericKeypad from '../components/NumericKeypad'
import PinDisplay from '../components/PinDisplay'
import { verifyPin } from '../utils/crypto'

interface PinUnlockProps {
  storedPinHash: string
  onUnlock: () => void
  onForgotPin?: () => void
  maxAttempts?: number
}

export default function PinUnlock({
  storedPinHash,
  onUnlock,
  onForgotPin,
  maxAttempts = 3
}: PinUnlockProps) {
  const [pin, setPin] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockTimeLeft, setBlockTimeLeft] = useState(0)

  // Gestion du blocage temporaire
  useEffect(() => {
    if (blockTimeLeft > 0) {
      const timer = setTimeout(() => {
        setBlockTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (isBlocked && blockTimeLeft === 0) {
      setIsBlocked(false)
      setAttempts(0)
      setError('')
    }
  }, [blockTimeLeft, isBlocked])

  // Ajouter un chiffre
  const handleNumberPress = (number: string) => {
    if (pin.length >= 4 || isBlocked || isVerifying) return
    
    const newPin = pin + number
    setPin(newPin)
    setError('')

    // Auto-vérification quand PIN complet
    if (newPin.length === 4) {
      setTimeout(() => verifyPinCode(newPin), 300)
    }
  }

  // Supprimer le dernier chiffre
  const handleBackspace = () => {
    if (isBlocked || isVerifying) return
    setPin(prev => prev.slice(0, -1))
    setError('')
  }

  // Effacer tout
  const handleClear = () => {
    if (isBlocked || isVerifying) return
    setPin('')
    setError('')
  }

  // Vérifier le PIN
  const verifyPinCode = async (pinToVerify: string) => {
    setIsVerifying(true)
    setError('')

    try {
      const isValid = await verifyPin(pinToVerify, storedPinHash)
      
      if (isValid) {
        // PIN correct - déverrouiller
        onUnlock()
      } else {
        // PIN incorrect
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        
        if (newAttempts >= maxAttempts) {
          // Bloquer temporairement (30 secondes)
          setIsBlocked(true)
          setBlockTimeLeft(30)
          setError(`Trop de tentatives. Réessayez dans 30 secondes.`)
        } else {
          const remaining = maxAttempts - newAttempts
          setError(`Code PIN incorrect. ${remaining} tentative${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}.`)
        }
        
        setPin('')
      }
    } catch (err) {
      setError('Erreur lors de la vérification du PIN')
      setPin('')
    } finally {
      setIsVerifying(false)
    }
  }

  // Retry manuel
  const handleRetry = () => {
    setPin('')
    setError('')
  }

  const getTitle = () => {
    if (isBlocked) return 'Accès temporairement bloqué'
    if (attempts > 0) return 'Code PIN incorrect'
    return 'Déverrouiller Budget Douala'
  }

  const getDescription = () => {
    if (isBlocked) return `Réessayez dans ${blockTimeLeft} secondes`
    if (attempts > 0) return 'Vérifiez votre code PIN et réessayez'
    return 'Saisissez votre code PIN pour accéder à l\'application'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">
              {isBlocked ? '🔒' : attempts > 0 ? '⚠️' : '🔓'}
            </span>
          </div>
          <CardTitle className={`text-xl ${
            isBlocked ? 'text-red-700' : 
            attempts > 0 ? 'text-orange-700' : 'text-gray-900'
          }`}>
            {getTitle()}
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            {getDescription()}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Affichage PIN */}
          <div className="text-center">
            <PinDisplay
              pin={pin}
              error={!!error && !isBlocked}
              className="mb-4"
            />
            
            {error && (
              <div className={`text-sm ${
                isBlocked ? 'text-red-600' : 'text-orange-600'
              }`}>
                {error}
              </div>
            )}
          </div>

          {/* Pavé numérique */}
          <NumericKeypad
            onNumberPress={handleNumberPress}
            onBackspace={handleBackspace}
            onClear={handleClear}
            disabled={isBlocked || isVerifying}
          />

          {/* Actions */}
          <div className="space-y-3">
            {error && !isBlocked && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleRetry}
                disabled={isVerifying}
              >
                🔄 Réessayer
              </Button>
            )}

            {onForgotPin && (
              <Button
                variant="outline"
                className="w-full text-sm"
                onClick={onForgotPin}
                disabled={isVerifying}
              >
                PIN oublié ?
              </Button>
            )}
          </div>

          {/* Indicateurs */}
          <div className="flex justify-center space-x-4 text-xs text-gray-500">
            <div>
              Tentatives: {attempts}/{maxAttempts}
            </div>
            {isBlocked && (
              <div className="text-red-600 font-medium">
                Bloqué: {blockTimeLeft}s
              </div>
            )}
          </div>

          {/* Loading */}
          {isVerifying && (
            <div className="text-center">
              <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              <div className="text-sm text-gray-600">Vérification...</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
