// FinanceIQ - Sélecteur de Date pour Transactions
// Composant critique pour saisie rétroactive

import { useState } from 'react'
import { Button, Icon, FinanceIcons } from './ui'

interface DateSelectorProps {
  selectedDate: string // Format YYYY-MM-DD
  onDateChange: (date: string) => void
  maxPastDays?: number // Limite jours dans le passé (défaut: 30)
  className?: string
}

export default function DateSelector({ 
  selectedDate, 
  onDateChange, 
  maxPastDays = 30,
  className = '' 
}: DateSelectorProps) {
  const [showCalendar, setShowCalendar] = useState(false)
  
  // Calculer les dates limites
  const today = new Date()
  const minDate = new Date(today)
  minDate.setDate(today.getDate() - maxPastDays)
  
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }
  
  const formatDateForDisplay = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00')
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    
    if (dateStr === formatDateForInput(today)) {
      return "Aujourd'hui"
    } else if (dateStr === formatDateForInput(yesterday)) {
      return "Hier"
    } else {
      return date.toLocaleDateString('fr-FR', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      })
    }
  }
  
  // Boutons rapides pour les jours récents
  const getQuickDates = () => {
    const dates = []
    for (let i = 0; i < Math.min(4, maxPastDays + 1); i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      dates.push({
        value: formatDateForInput(date),
        label: i === 0 ? "Aujourd'hui" : 
               i === 1 ? "Hier" : 
               i === 2 ? "Avant-hier" : 
               `Il y a ${i} jours`
      })
    }
    return dates
  }
  
  const quickDates = getQuickDates()
  
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        Date de la dépense
      </label>
      
      {/* Boutons rapides */}
      <div className="grid grid-cols-2 gap-2">
        {quickDates.map((dateOption) => (
          <Button
            key={dateOption.value}
            variant={selectedDate === dateOption.value ? "primary" : "outline"}
            size="sm"
            onClick={() => onDateChange(dateOption.value)}
            className="text-xs"
          >
            {dateOption.label}
          </Button>
        ))}
      </div>
      
      {/* Sélecteur calendrier */}
      <div className="relative">
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <div 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-gray-400 transition-colors"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-900">
                  {formatDateForDisplay(selectedDate)}
                </span>
                <Icon 
                  name={FinanceIcons.other} 
                  size="sm" 
                  className="text-gray-400"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Input date natif (caché mais fonctionnel) */}
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          min={formatDateForInput(minDate)}
          max={formatDateForInput(today)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      
      {/* Avertissement si date ancienne */}
      {(() => {
        const daysDiff = Math.floor(
          (today.getTime() - new Date(selectedDate + 'T00:00:00').getTime()) / 
          (1000 * 60 * 60 * 24)
        )
        
        if (daysDiff > 7) {
          return (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
              <div className="flex items-center space-x-2">
                <Icon name={FinanceIcons.other} size="sm" className="text-amber-600" />
                <span className="text-xs text-amber-800">
                  Transaction d'il y a {daysDiff} jours - Vérifiez la date
                </span>
              </div>
            </div>
          )
        }
        return null
      })()}
    </div>
  )
}
