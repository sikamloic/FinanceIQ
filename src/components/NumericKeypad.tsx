// Budget Douala - Pavé Numérique
// I5.2 - Composant pavé numérique pour saisie PIN

import { Button } from './ui'

interface NumericKeypadProps {
  onNumberPress: (number: string) => void
  onBackspace: () => void
  onClear: () => void
  disabled?: boolean
  className?: string
}

export default function NumericKeypad({
  onNumberPress,
  onBackspace,
  onClear,
  disabled = false,
  className = ''
}: NumericKeypadProps) {
  
  const numbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['clear', '0', 'backspace']
  ]

  const handlePress = (key: string) => {
    if (disabled) return

    if (key === 'backspace') {
      onBackspace()
    } else if (key === 'clear') {
      onClear()
    } else {
      onNumberPress(key)
    }
  }

  const getButtonContent = (key: string) => {
    switch (key) {
      case 'backspace':
        return '⌫'
      case 'clear':
        return 'C'
      default:
        return key
    }
  }

  const getButtonVariant = (key: string) => {
    if (key === 'clear') return 'outline'
    if (key === 'backspace') return 'outline'
    return 'primary'
  }

  return (
    <div className={`grid grid-cols-3 gap-3 max-w-xs mx-auto ${className}`}>
      {numbers.flat().map((key, index) => (
        <Button
          key={index}
          variant={getButtonVariant(key)}
          size="lg"
          className={`
            h-16 text-xl font-semibold
            ${key === 'clear' || key === 'backspace' ? 'text-gray-600' : 'text-white'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
            transition-all duration-150
          `}
          onClick={() => handlePress(key)}
          disabled={disabled}
        >
          {getButtonContent(key)}
        </Button>
      ))}
    </div>
  )
}
