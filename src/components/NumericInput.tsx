// Budget Douala - Input Numérique
// I6.1 - Composant input pour montants XAF

import { useState, useEffect } from 'react'
import { formatCurrencyXAF, parseCurrencyXAF } from '../utils/format'

interface NumericInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  placeholder?: string
  min?: number
  max?: number
  step?: number
  icon?: string
  suffix?: string
  error?: string
  warning?: string
  disabled?: boolean
  className?: string
}

export default function NumericInput({
  label,
  value,
  onChange,
  placeholder = '0',
  min = 0,
  max = 999999999,
  step = 1000,
  icon,
  suffix = 'XAF',
  error,
  warning,
  disabled = false,
  className = ''
}: NumericInputProps) {
  const [displayValue, setDisplayValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  // Synchroniser avec la valeur externe
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value > 0 ? formatCurrencyXAF(value, { showCurrency: false }) : '')
    }
  }, [value, isFocused])

  // Gérer le changement de valeur
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    setDisplayValue(rawValue)

    // Parser et valider
    const numericValue = parseCurrencyXAF(rawValue)
    if (numericValue !== null && !isNaN(numericValue)) {
      // Toujours appeler onChange, même si hors limites
      // La validation se fera au niveau parent
      onChange(numericValue)
    }
  }

  // Gérer le focus
  const handleFocus = () => {
    setIsFocused(true)
    // Afficher la valeur brute pour l'édition
    setDisplayValue(value > 0 ? value.toString() : '')
  }

  // Gérer la perte de focus
  const handleBlur = () => {
    setIsFocused(false)
    // Reformater la valeur
    if (value > 0) {
      setDisplayValue(formatCurrencyXAF(value, { showCurrency: false }))
    } else {
      setDisplayValue('')
    }
  }

  // Incrémenter/décrémenter avec les boutons
  const handleIncrement = () => {
    const newValue = value + step
    // Respecter le max pour les boutons seulement
    if (newValue <= max) {
      onChange(newValue)
    }
  }

  const handleDecrement = () => {
    const newValue = Math.max(value - step, min)
    onChange(newValue)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </label>

      {/* Input Container */}
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 pr-20 text-lg font-medium text-right
            border rounded-lg transition-all duration-200
            ${error 
              ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-200' 
              : warning
              ? 'border-orange-300 bg-orange-50 text-orange-900 focus:border-orange-500 focus:ring-orange-200'
              : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
            focus:outline-none focus:ring-2
          `}
        />

        {/* Suffix */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <span className="text-sm font-medium text-gray-500">{suffix}</span>
        </div>

        {/* Boutons +/- */}
        {!disabled && (
          <div className="absolute inset-y-0 right-12 flex flex-col">
            <button
              type="button"
              onClick={handleIncrement}
              className="flex-1 px-2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <span className="text-xs">▲</span>
            </button>
            <button
              type="button"
              onClick={handleDecrement}
              className="flex-1 px-2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <span className="text-xs">▼</span>
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Warning Message */}
      {!error && warning && (
        <div className="text-sm text-orange-600">
          {warning}
        </div>
      )}

      {/* Helper Text - Supprimé car plus de limites restrictives */}
    </div>
  )
}
