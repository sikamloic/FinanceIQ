// Budget Douala - Composant Badge Réutilisable
// I2.2 - Design System Basique

import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'income' | 'expense' | 'budget' | 'savings' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'neutral', size = 'md', children, ...props }, ref) => {
    
    // Classes de base
    const baseClasses = 'inline-flex items-center font-medium border'
    
    // Variantes métier Budget Douala
    const variantClasses = {
      income: 'text-green-700 bg-green-50 border-green-200',
      expense: 'text-red-700 bg-red-50 border-red-200',
      budget: 'text-purple-700 bg-purple-50 border-purple-200',
      savings: 'text-orange-700 bg-orange-50 border-orange-200',
      neutral: 'text-gray-700 bg-gray-50 border-gray-200'
    }
    
    // Tailles
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs rounded-md',
      md: 'px-3 py-1.5 text-sm rounded-lg',
      lg: 'px-4 py-2 text-base rounded-xl'
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
export type { BadgeProps }
