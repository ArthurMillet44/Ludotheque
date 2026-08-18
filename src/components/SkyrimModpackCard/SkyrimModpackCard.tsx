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
 * rapides pour modifier ou supprimer le modpack.
 */
export function SkyrimModpackCard({ modpack, onEdit, onDelete }: SkyrimModpackCardProps) {
  return (
    <div className="skyrim-modpack-card">
      <div className="skyrim-modpack-card__glow" aria-hidden="true" />
      <div className="skyrim-modpack-card__inner">
        <span className="skyrim-modpack-card__name">{modpack.name}</span>
        <div className="skyrim-modpack-card__actions">
          <button
            type="button"
            className="skyrim-modpack-card__action"
            aria-label={`Modifier ${modpack.name}`}
            onClick={() => onEdit(modpack)}
          >
            <Pencil aria-hidden="true" />
          </button>
          <button
            type="button"
            className="skyrim-modpack-card__action skyrim-modpack-card__action--danger"
            aria-label={`Supprimer ${modpack.name}`}
            onClick={() => onDelete(modpack)}
          >
            <Trash2 aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
