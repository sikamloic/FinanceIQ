// FinanceIQ - Modal Confidentialité des Données
// Information sur le stockage et la sécurité des données

import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from './ui/Modal'
import { Button } from './ui'

interface DataPrivacyModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
}

export default function DataPrivacyModal({ isOpen, onClose, onAccept }: DataPrivacyModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" closeOnOverlay={false}>
      <ModalHeader>
        <ModalTitle>🔒 Confidentialité et Sécurité de vos Données</ModalTitle>
      </ModalHeader>
      
      <ModalBody>
        <div className="space-y-4 text-sm">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">✅ Vos données restent chez vous</h3>
            <p className="text-blue-800">
              FinanceIQ utilise le <strong>stockage local</strong> de votre navigateur (IndexedDB). 
              Aucune donnée n'est envoyée sur internet ou stockée sur nos serveurs.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">📊 Quelles données sont stockées ?</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-green-600 font-bold">•</span>
                <span><strong>Salaire et budgets</strong> : Pour calculer vos budgets optimaux</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600 font-bold">•</span>
                <span><strong>Transactions</strong> : Vos dépenses et revenus pour le suivi</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600 font-bold">•</span>
                <span><strong>Code PIN</strong> : Haché et sécurisé pour protéger l'accès</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600 font-bold">•</span>
                <span><strong>Préférences</strong> : Configuration de l'interface</span>
              </li>
            </ul>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h3 className="font-semibold text-orange-900 mb-2">⚠️ Important à savoir</h3>
            <ul className="space-y-1 text-orange-800 text-sm">
              <li>• <strong>Données locales</strong> : Liées à ce navigateur sur cet appareil</li>
              <li>• <strong>Pas de synchronisation</strong> : Pas de sauvegarde automatique cloud</li>
              <li>• <strong>Suppression navigateur</strong> : Vider le cache = perte des données</li>
              <li>• <strong>Changement d'appareil</strong> : Pas de transfert automatique</li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">🛡️ Sécurité et Confidentialité</h3>
            <ul className="space-y-1 text-green-800 text-sm">
              <li>• <strong>100% privé</strong> : Aucun accès externe à vos données</li>
              <li>• <strong>Pas de tracking</strong> : Aucun suivi publicitaire</li>
              <li>• <strong>Pas de cookies</strong> : Utilisation sans cookies tiers</li>
              <li>• <strong>Code PIN</strong> : Protection par code d'accès personnel</li>
              <li>• <strong>Open source</strong> : Code transparent et vérifiable</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">💡 Recommandations</h3>
            <ul className="space-y-1 text-gray-700 text-sm">
              <li>• <strong>Sauvegarde manuelle</strong> : Notez vos données importantes</li>
              <li>• <strong>Navigateur principal</strong> : Utilisez toujours le même navigateur</li>
              <li>• <strong>Pas de mode privé</strong> : Évitez la navigation privée pour FinanceIQ</li>
              <li>• <strong>Mise à jour navigateur</strong> : Gardez votre navigateur à jour</li>
            </ul>
          </div>
        </div>
      </ModalBody>
      
      <ModalFooter>
        <div className="flex space-x-3 w-full">
          <Button 
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Plus tard
          </Button>
          <Button 
            onClick={onAccept}
            variant="primary"
            className="flex-1"
          >
            J'ai compris, continuer
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  )
}
