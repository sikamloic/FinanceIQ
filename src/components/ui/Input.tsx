// Budget Douala - Composant Input Réutilisable
// I2.2 - Design System Basique

import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error' | 'success'
  inputSize?: 'sm' | 'md' | 'lg'
  label?: string
  error?: string
  helper?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant = 'default', 
    inputSize = 'md', 
    type = 'text',
    label,
    error,
    helper,
    id,
    ...props 
  }, ref) => {
    
    // Classes de base
    const baseClasses = 'w-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0'
    
    // Variantes
    const variantClasses = {
      default: 'border-gray-200 focus:border-blue-500 focus:ring-blue-100',
      error: 'border-red-300 focus:border-red-500 focus:ring-red-100',
      success: 'border-green-300 focus:border-green-500 focus:ring-green-100'
    }
    
    // Tailles
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm rounded-lg',
      md: 'px-4 py-3 text-base rounded-xl',
      lg: 'px-5 py-4 text-lg rounded-xl'
    }
    
    // Générer un ID unique si pas fourni
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        
        <input
          ref={ref}
          type={type}
          id={inputId}
          className={cn(
            baseClasses,
            variantClasses[error ? 'error' : variant],
            sizeClasses[inputSize],
            className
          )}
          {...props}
        />
        
        {error && (
          <p className="text-sm text-red-600 flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </p>
        )}
        
        {helper && !error && (
          <p className="text-sm text-gray-500">{helper}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
export type { InputProps }
