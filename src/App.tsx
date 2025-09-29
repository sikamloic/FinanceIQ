import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import RouteGuard from './components/RouteGuard'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import QuickAdd from './pages/QuickAdd'
import Transactions from './pages/Transactions'
import Budgets from './pages/Budgets'
import Settings from './pages/SettingsScientific'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <RouteGuard>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="quick-add" element={<QuickAdd />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="budgets" element={<Budgets />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </RouteGuard>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
