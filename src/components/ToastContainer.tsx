// Budget Douala - Container Toast
// I3.4 - Toast Confirmation

import Toast, { type ToastData } from './Toast'

interface ToastContainerProps {
  toasts: ToastData[]
  onClose: (id: string) => void
}

export default function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2 pointer-events-none">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="pointer-events-auto"
          style={{
            // Décaler légèrement chaque toast pour l'effet de pile
            transform: `translateY(${index * 4}px) scale(${1 - index * 0.02})`,
            zIndex: 1000 - index
          }}
        >
          <Toast
            toast={toast}
            onClose={onClose}
            duration={3000}
          />
        </div>
      ))}
    </div>
  )
}
