import type { KeyboardEvent, MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import type { SkyrimModpack } from '../../features/skyrim/skyrimApi'
import './SkyrimModpackCard.css'

interface SkyrimModpackCardProps {
  modpack: SkyrimModpack
  onEdit: (modpack: SkyrimModpack) => void
  onDelete: (modpack: SkyrimModpack) => void
}

/**
 * Affiche une carte représentant un modpack Skyrim suivi par
 * l'utilisateur, avec un effet de lueur en coin et des actions
 * rapides pour modifier ou supprimer le modpack. La carte est
 * cliquable et mène à la page de détail du modpack.
 */
export function SkyrimModpackCard({ modpack, onEdit, onDelete }: SkyrimModpackCardProps) {
  const navigate = useNavigate()

  /**
   * Ouvre la page de détail du modpack représenté par cette carte.
   * @returns rien, la fonction agit uniquement par effet de bord (navigation)
   */
  function openDetailPage() {
    navigate(`/skyrim/${modpack.id}`)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openDetailPage()
    }
  }

  function handleEditClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    onEdit(modpack)
  }

  function handleDeleteClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    onDelete(modpack)
  }

  return (
    <div
      className="skyrim-modpack-card"
      role="link"
      tabIndex={0}
      aria-label={`Voir ${modpack.name}`}
      onClick={openDetailPage}
      onKeyDown={handleKeyDown}
    >
      <div className="skyrim-modpack-card__glow" aria-hidden="true" />
      <div className="skyrim-modpack-card__inner">
        <span className="skyrim-modpack-card__name">{modpack.name}</span>
        <div className="skyrim-modpack-card__actions">
          <button
            type="button"
            className="skyrim-modpack-card__action"
            aria-label={`Modifier ${modpack.name}`}
            onClick={handleEditClick}
          >
            <Pencil aria-hidden="true" />
          </button>
          <button
            type="button"
            className="skyrim-modpack-card__action skyrim-modpack-card__action--danger"
            aria-label={`Supprimer ${modpack.name}`}
            onClick={handleDeleteClick}
          >
            <Trash2 aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
