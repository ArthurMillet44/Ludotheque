import { Modal } from '../Modal/Modal'
import { PrimaryButton } from '../PrimaryButton/PrimaryButton'
import './ConfirmDialog.css'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel: string
  isConfirming: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Boîte de dialogue de confirmation générique, à utiliser avant toute
 * action destructive. Ne contient aucune logique métier : elle se
 * contente de demander confirmation via onConfirm ou onCancel.
 */
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  isConfirming,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="confirm-dialog__message">{message}</p>
      <div className="confirm-dialog__actions">
        <button type="button" className="confirm-dialog__cancel" onClick={onCancel}>
          Annuler
        </button>
        <PrimaryButton
          type="button"
          className="confirm-dialog__confirm"
          onClick={onConfirm}
          disabled={isConfirming}
        >
          {isConfirming ? 'Suppression...' : confirmLabel}
        </PrimaryButton>
      </div>
    </Modal>
  )
}
