// Budget Douala - Layout Mobile Moderne
// I2.1 - Layout Mobile + Navigation

import { Outlet, Link, useLocation } from 'react-router-dom'
import { 
  HomeIcon, 
  PlusCircleIcon, 
  BanknotesIcon,
  ChartBarIcon, 
  Cog6ToothIcon,
  CurrencyDollarIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'

export default function Layout() {
  const location = useLocation()
  const { logout } = useAuth()

  // Navigation avec vraies icônes professionnelles
  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Accueil', color: 'blue' },
    { path: '/quick-add', icon: PlusCircleIcon, label: 'Saisie', color: 'green' },
    { path: '/transactions', icon: BanknotesIcon, label: 'Transactions', color: 'orange' },
    { path: '/budgets', icon: ChartBarIcon, label: 'Budgets', color: 'purple' },
    { path: '/settings', icon: Cog6ToothIcon, label: 'Réglages', color: 'gray' }
  ]

  // Titre dynamique selon la page
  const getPageTitle = () => {
    const currentItem = navItems.find(item => item.path === location.pathname)
    return currentItem?.label || 'Budget Douala'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header moderne avec charte - Fixe */}
      <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600/95 to-blue-700/95 backdrop-blur-sm text-white shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">{getPageTitle()}</h1>
              <p className="text-blue-100 text-sm">Douala, Cameroun</p>
            </div>
            <div className="flex items-center space-x-3">
              <CurrencyDollarIcon className="w-8 h-8 text-blue-100" />
              <button
                onClick={logout}
                className="p-2 text-blue-100 hover:text-white hover:bg-blue-500 rounded-lg transition-colors"
                title="Se déconnecter"
              >
                <LockClosedIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full px-4 pt-24 py-6 pb-20 max-w-7xl mx-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation avec charte - Fixe */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t shadow-lg pb-safe z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-around">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              
              // Couleurs dynamiques avec classes TailwindCSS standard
              const getColors = () => {
                if (isActive) {
                  switch (item.color) {
                    case 'green': return 'text-green-600 bg-green-50'
                    case 'orange': return 'text-orange-600 bg-orange-50'
                    case 'purple': return 'text-purple-600 bg-purple-50'
                    case 'gray': return 'text-gray-600 bg-gray-50'
                    default: return 'text-blue-600 bg-blue-50'
                  }
                }
                return 'text-gray-500 hover:text-gray-700'
              }
              
              const IconComponent = item.icon
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center py-3 px-4 transition-all duration-200 ${getColors()}`}
                >
                  <div className={`mb-1 transition-transform ${isActive ? 'scale-110' : ''}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="w-1 h-1 bg-current rounded-full mt-1"></div>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}
