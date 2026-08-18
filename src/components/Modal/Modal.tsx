import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import './Modal.css'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}

/**
 * Fenêtre modale générique avec superposition, titre et bouton de
 * fermeture. Se ferme via la touche Échap ou un clic sur le fond.
 * Réutilisable pour n'importe quel contenu (formulaire, confirmation).
 */
export function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div className="modal__backdrop" onClick={onClose}>
      <div
        className="modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button type="button" className="modal__close" aria-label="Fermer" onClick={onClose}>
            <X aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
