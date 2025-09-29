// Budget Douala - Setup Tests
// I2.3 - Format XAF Utility

import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Configuration globale pour les tests
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock pour IndexedDB si nécessaire
Object.defineProperty(window, 'indexedDB', {
  writable: true,
  value: {
    open: vi.fn(),
    deleteDatabase: vi.fn(),
  },
})

// Mock pour les modules CSS
vi.mock('*.css', () => ({}))
