// Budget Douala - Composant Modal UI
// Modal réutilisable pour le design system

import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnOverlay?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  className?: string
}

interface ModalHeaderProps {
  children: ReactNode
  className?: string
}

interface ModalBodyProps {
  children: ReactNode
  className?: string
}

interface ModalFooterProps {
  children: ReactNode
  className?: string
}

// Composant Modal principal
export function Modal({
  isOpen,
  onClose,
  children,
  size = 'md',
  closeOnOverlay = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = ''
}: ModalProps) {
  // Gestion de l'échappement
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeOnEscape, onClose])

  // Bloquer le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  // Tailles du modal
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4'
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlay) {
      onClose()
    }
  }

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div 
        className={`
          relative w-full ${sizeClasses[size]} 
          max-h-[90vh] flex flex-col
          bg-white rounded-lg shadow-xl 
          transform transition-all duration-200 ease-out
          animate-in fade-in-0 zoom-in-95
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton de fermeture */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        {children}
      </div>
    </div>
  )

  // Utiliser un portal pour rendre le modal au niveau du body
  return createPortal(modalContent, document.body)
}

// Composant Header du modal
export function ModalHeader({ children, className = '' }: ModalHeaderProps) {
  return (
    <div className={`flex-shrink-0 px-6 py-4 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  )
}

// Composant Body du modal
export function ModalBody({ children, className = '' }: ModalBodyProps) {
  return (
    <div className={`flex-1 px-6 py-4 overflow-y-auto ${className}`}>
      {children}
    </div>
  )
}

// Composant Footer du modal
export function ModalFooter({ children, className = '' }: ModalFooterProps) {
  return (
    <div className={`flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg ${className}`}>
      {children}
    </div>
  )
}

// Composant Title pour le header
export function ModalTitle({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <h2 className={`text-lg font-semibold text-gray-900 pr-8 ${className}`}>
      {children}
    </h2>
  )
}

// Export par défaut du Modal principal
export default Modal
