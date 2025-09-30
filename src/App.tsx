// FinanceIQ - Application Principale Sécurisée
// I3.1 - Routing et Layout avec React Router + Sécurité

import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import LockScreen from './components/LockScreen'
import Dashboard from './pages/Dashboard'
import QuickAdd from './pages/QuickAdd'
import Transactions from './pages/Transactions'
import Budgets from './pages/Budgets'
import Settings from './pages/Settings'
import { useSecurityManager } from './data/lock'

function App() {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const security = useSecurityManager()

  // Initialiser le système de sécurité
  useEffect(() => {
    const initSecurity = async () => {
      try {
        await security.initialize()
        
        // Vérifier si déjà déverrouillé
        setIsUnlocked(security.isUnlocked())
        
        // Écouter les verrouillages
        security.onLock(() => {
          setIsUnlocked(false)
        })
        
        setIsInitialized(true)
      } catch (error) {
        console.error('Erreur initialisation sécurité:', error)
        setIsInitialized(true)
      }
    }

    initSecurity()
  }, [])

  // Gérer le déverrouillage
  const handleUnlock = () => {
    setIsUnlocked(true)
  }

  // Gérer la configuration initiale
  const handleSetupComplete = () => {
    setIsUnlocked(true)
  }

  // Afficher un loader pendant l'initialisation
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-gray-600">Initialisation FinanceIQ...</div>
        </div>
      </div>
    )
  }

  // Afficher l'écran de verrouillage si nécessaire
  if (!isUnlocked) {
    return (
      <LockScreen 
        onUnlock={handleUnlock}
        onSetupComplete={handleSetupComplete}
      />
    )
  }

  // Application déverrouillée
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="quick-add" element={<QuickAdd />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
