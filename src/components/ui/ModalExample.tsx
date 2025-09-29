// Budget Douala - Exemples d'utilisation du Modal
// Démonstration des différentes tailles et configurations

import { useState } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalTitle, Button } from './index'

export default function ModalExample() {
  const [showSmall, setShowSmall] = useState(false)
  const [showMedium, setShowMedium] = useState(false)
  const [showLarge, setShowLarge] = useState(false)
  const [showCustom, setShowCustom] = useState(false)

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-xl font-bold">Exemples de Modal</h2>
      
      <div className="flex space-x-4">
        <Button onClick={() => setShowSmall(true)}>Modal Small</Button>
        <Button onClick={() => setShowMedium(true)}>Modal Medium</Button>
        <Button onClick={() => setShowLarge(true)}>Modal Large</Button>
        <Button onClick={() => setShowCustom(true)}>Modal Custom</Button>
      </div>

      {/* Modal Small */}
      <Modal isOpen={showSmall} onClose={() => setShowSmall(false)} size="sm">
        <ModalHeader>
          <ModalTitle>Modal Small</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p>Ceci est un modal de taille small (max-w-sm).</p>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setShowSmall(false)}>Fermer</Button>
        </ModalFooter>
      </Modal>

      {/* Modal Medium */}
      <Modal isOpen={showMedium} onClose={() => setShowMedium(false)} size="md">
        <ModalHeader>
          <ModalTitle>Modal Medium</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p>Ceci est un modal de taille medium (max-w-md).</p>
          <p>Il peut contenir plus de contenu que le small.</p>
        </ModalBody>
        <ModalFooter>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowMedium(false)}>
              Annuler
            </Button>
            <Button onClick={() => setShowMedium(false)}>
              Confirmer
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Modal Large */}
      <Modal isOpen={showLarge} onClose={() => setShowLarge(false)} size="lg">
        <ModalHeader>
          <ModalTitle>Modal Large</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p>Ceci est un modal de taille large (max-w-lg).</p>
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h4 className="font-semibold">Contenu additionnel</h4>
            <p>Plus d'espace pour des formulaires complexes ou du contenu riche.</p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setShowLarge(false)}>Fermer</Button>
        </ModalFooter>
      </Modal>

      {/* Modal Custom */}
      <Modal 
        isOpen={showCustom} 
        onClose={() => setShowCustom(false)} 
        size="md"
        closeOnOverlay={false}
        closeOnEscape={false}
        showCloseButton={false}
      >
        <ModalHeader>
          <ModalTitle>Modal Personnalisé</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p>Ce modal ne peut être fermé qu'avec le bouton.</p>
          <ul className="mt-2 text-sm text-gray-600">
            <li>• closeOnOverlay: false</li>
            <li>• closeOnEscape: false</li>
            <li>• showCloseButton: false</li>
          </ul>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setShowCustom(false)} className="w-full">
            Fermer manuellement
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
