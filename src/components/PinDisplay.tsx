// Budget Douala - Affichage PIN
// I5.2 - Composant d'affichage des points PIN

interface PinDisplayProps {
  pin: string
  maxLength?: number
  showPin?: boolean
  className?: string
  error?: boolean
}

export default function PinDisplay({
  pin,
  maxLength = 4,
  showPin = false,
  className = '',
  error = false
}: PinDisplayProps) {
  
  const dots = Array.from({ length: maxLength }, (_, index) => {
    const hasValue = index < pin.length
    const isActive = index === pin.length && pin.length < maxLength
    
    return (
      <div
        key={index}
        className={`
          w-4 h-4 rounded-full border-2 transition-all duration-200
          ${hasValue 
            ? (error ? 'bg-red-500 border-red-500' : 'bg-blue-500 border-blue-500')
            : (error ? 'border-red-300' : 'border-gray-300')
          }
          ${isActive ? 'ring-2 ring-blue-300 ring-opacity-50' : ''}
          ${error ? 'animate-pulse' : ''}
        `}
      >
        {showPin && hasValue && (
          <span className="flex items-center justify-center w-full h-full text-xs font-bold text-white">
            {pin[index]}
          </span>
        )}
      </div>
    )
  })

  return (
    <div className={`flex items-center justify-center space-x-4 ${className}`}>
      {dots}
    </div>
  )
}
