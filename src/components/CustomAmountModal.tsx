// Budget Douala - Modal Montant Personnalisé
// Permet de saisir une dépense avec montant libre et catégorie

import { useState } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalTitle, Button, Icon, FinanceIcons } from './ui'
// import NumericInput from './NumericInput' // Remplacé par input custom avec Icon

interface CustomAmountModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (amount: number, categoryId: string, categoryName: string, note?: string) => void
}

// Catégories scientifiques disponibles pour saisie libre
const categories = [
  { id: 'logement', name: 'Logement', icon: FinanceIcons.other },
  { id: 'alimentation', name: 'Alimentation & hygiène', icon: FinanceIcons.food },
  { id: 'transport', name: 'Transport', icon: FinanceIcons.transport },
  { id: 'factures', name: 'Factures & services', icon: FinanceIcons.data },
  { id: 'sante', name: 'Santé', icon: FinanceIcons.health },
  { id: 'vie_courante', name: 'Vie courante & vêtements', icon: FinanceIcons.other },
  { id: 'couple', name: 'Partenaire & romance', icon: FinanceIcons.other },
  { id: 'loisirs', name: 'Loisirs (solo)', icon: FinanceIcons.leisure },
  { id: 'famille', name: 'Dons / famille', icon: FinanceIcons.other },
  { id: 'education', name: 'Éducation & développement', icon: FinanceIcons.other },
  { id: 'dettes', name: 'Dettes (hors logement)', icon: FinanceIcons.other },
  { id: 'imprevus', name: 'Imprévus & annuels', icon: FinanceIcons.other },
  { id: 'epargne', name: 'Épargne & investissement', icon: FinanceIcons.other }
]

export default function CustomAmountModal({ isOpen, onClose, onSubmit }: CustomAmountModalProps) {
  const [amount, setAmount] = useState<number>(0)
  const [selectedCategory, setSelectedCategory] = useState<string>('alimentation')
  const [note, setNote] = useState<string>('')

  const handleSubmit = () => {
    if (amount <= 0) return
    
    const category = categories.find(cat => cat.id === selectedCategory)
    if (!category) return

    onSubmit(amount, selectedCategory, category.name, note || undefined)
    
    // Reset form
    setAmount(0)
    setSelectedCategory('alimentation')
    setNote('')
    onClose()
  }

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory)

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader>
        <ModalTitle>Montant Personnalisé</ModalTitle>
      </ModalHeader>
      
      <ModalBody className="space-y-4">
          {/* Montant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant (XAF)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name={FinanceIcons.salary} className="text-gray-400" size="sm" />
              </div>
              <input
                type="number"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="5000"
                min={1}
                max={999999999}
                step={100}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-2 rounded-lg border-2 transition-all text-left ${
                    selectedCategory === category.id
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon name={category.icon} size="sm" />
                    <span className="text-xs font-medium">{category.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Note optionnelle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note (optionnel)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Taxi, Restaurant, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={50}
            />
          </div>

          {/* Preview */}
          {amount > 0 && selectedCategoryData && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Aperçu :</div>
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Icon name={selectedCategoryData.icon} size="sm" />
                  <span>{selectedCategoryData.name}</span>
                  {note && <span className="text-gray-500">({note})</span>}
                </span>
                <span className="font-bold">{amount.toLocaleString()} XAF</span>
              </div>
            </div>
          )}

      </ModalBody>
      
      <ModalFooter>
        <div className="flex space-x-3 w-full">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={amount <= 0}
            className="flex-1"
          >
            Ajouter
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  )
}
