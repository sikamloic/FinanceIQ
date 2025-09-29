// FinanceIQ - Historique des Transactions
// Suivi intelligent de toutes vos dépenses et revenus enregistrées

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Icon, ActionIcons, StatusIcons, FinanceIcons } from '../components/ui'
import { useTransactions } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import { formatCurrencyXAF, getCurrentDateDouala } from '../utils/format'

interface FilterState {
  month: string
  category: string
  sortBy: 'date' | 'amount' | 'category'
  sortOrder: 'asc' | 'desc'
}

export default function Transactions() {
  const { transactions, isLoading, deleteTransaction } = useTransactions()
  const { categories, getCategoryById } = useCategories()
  const [filters, setFilters] = useState<FilterState>({
    month: getCurrentDateDouala().slice(0, 7), // YYYY-MM
    category: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  })
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])

  // Filtrer et trier les transactions
  const filteredTransactions = transactions
    .filter(tx => {
      // Filtre par mois
      if (filters.month !== 'all' && !tx.date.startsWith(filters.month)) {
        return false
      }
      // Filtre par catégorie
      if (filters.category !== 'all' && tx.categoryId !== filters.category) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (filters.sortBy) {
        case 'date':
          comparison = a.date.localeCompare(b.date)
          break
        case 'amount':
          comparison = a.amount - b.amount
          break
        case 'category':
          const catA = getCategoryById(a.categoryId)?.name || ''
          const catB = getCategoryById(b.categoryId)?.name || ''
          comparison = catA.localeCompare(catB)
          break
      }
      
      return filters.sortOrder === 'asc' ? comparison : -comparison
    })

  // Statistiques des transactions filtrées
  const stats = {
    count: filteredTransactions.length,
    total: filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0),
    average: filteredTransactions.length > 0 
      ? Math.round(filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0) / filteredTransactions.length)
      : 0
  }

  // Supprimer une transaction
  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
      try {
        await deleteTransaction(id)
      } catch (error) {
        console.error('Erreur suppression:', error)
      }
    }
  }

  // Supprimer les transactions sélectionnées
  const handleBulkDelete = async () => {
    if (selectedTransactions.length === 0) return
    
    if (confirm(`Supprimer ${selectedTransactions.length} transaction(s) sélectionnée(s) ?`)) {
      try {
        await Promise.all(selectedTransactions.map(id => deleteTransaction(id)))
        setSelectedTransactions([])
      } catch (error) {
        console.error('Erreur suppression groupée:', error)
      }
    }
  }

  // Toggle sélection transaction
  const toggleSelection = (id: string) => {
    setSelectedTransactions(prev => 
      prev.includes(id) 
        ? prev.filter(txId => txId !== id)
        : [...prev, id]
    )
  }

  // Sélectionner/désélectionner tout
  const toggleSelectAll = () => {
    if (selectedTransactions.length === filteredTransactions.length) {
      setSelectedTransactions([])
    } else {
      setSelectedTransactions(filteredTransactions.map(tx => tx.id))
    }
  }

  // Obtenir l'icône de catégorie
  const getCategoryIcon = (categoryId: string) => {
    const iconMap: Record<string, keyof typeof FinanceIcons> = {
      'cat_transport': 'transport',
      'cat_alimentation': 'food',
      'cat_data': 'data',
      'cat_sante': 'health',
      'cat_loisirs': 'leisure',
      'cat_loyer': 'rent',
      'cat_epargne': 'savings',
      'cat_autres': 'other'
    }
    return iconMap[categoryId] || 'other'
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
            <div className="text-gray-600">Chargement des transactions...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">Historique complet de vos dépenses</p>
        </div>
        
        {selectedTransactions.length > 0 && (
          <div className="flex items-center space-x-3">
            <Badge variant="neutral">
              {selectedTransactions.length} sélectionnée(s)
            </Badge>
            <Button 
              variant="danger" 
              size="sm"
              onClick={handleBulkDelete}
            >
              <Icon name={ActionIcons.delete} size="sm" />
              Supprimer
            </Button>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.count}</div>
              <div className="text-sm text-gray-600">Transaction(s)</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrencyXAF(stats.total, { showCurrency: false })} XAF
              </div>
              <div className="text-sm text-gray-600">Total Dépensé</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrencyXAF(stats.average, { showCurrency: false })} XAF
              </div>
              <div className="text-sm text-gray-600">Moyenne</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Filtre mois */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mois
              </label>
              <select
                value={filters.month}
                onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les mois</option>
                <option value={getCurrentDateDouala().slice(0, 7)}>Ce mois</option>
                <option value="2024-12">Décembre 2024</option>
                <option value="2024-11">Novembre 2024</option>
                <option value="2024-10">Octobre 2024</option>
              </select>
            </div>

            {/* Filtre catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Tri */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trier par
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as FilterState['sortBy'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date">Date</option>
                <option value="amount">Montant</option>
                <option value="category">Catégorie</option>
              </select>
            </div>

            {/* Ordre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordre
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as FilterState['sortOrder'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="desc">Décroissant</option>
                <option value="asc">Croissant</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transactions ({filteredTransactions.length})</span>
            {filteredTransactions.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
              >
                {selectedTransactions.length === filteredTransactions.length ? 'Désélectionner' : 'Sélectionner'} tout
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <Icon name={StatusIcons.info} className="text-gray-400 mx-auto mb-3" size="xl" />
              <div className="text-gray-700 font-medium">Aucune transaction trouvée</div>
              <div className="text-sm text-gray-500">
                Modifiez vos filtres ou ajoutez des transactions
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map((tx) => {
                const category = getCategoryById(tx.categoryId)
                const isSelected = selectedTransactions.includes(tx.id)
                
                return (
                  <div
                    key={tx.id}
                    className={`flex items-center p-4 rounded-lg border transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelection(tx.id)}
                      className="mr-4 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />

                    {/* Icône catégorie */}
                    <div className="mr-4">
                      <Icon 
                        name={FinanceIcons[getCategoryIcon(tx.categoryId)]} 
                        className="text-gray-600" 
                        size="lg" 
                      />
                    </div>

                    {/* Détails transaction */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {formatCurrencyXAF(tx.amount)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {category?.name || tx.categoryId}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-900">{tx.date}</div>
                          {tx.note && (
                            <div className="text-xs text-gray-500">{tx.note}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(tx.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Icon name={ActionIcons.delete} size="sm" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
