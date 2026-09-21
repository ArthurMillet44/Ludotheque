import type { KeyboardEvent, MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import type { MinecraftGame } from '../../features/minecraft/minecraftApi'
import './MinecraftGameCard.css'

interface MinecraftGameCardProps {
  game: MinecraftGame
  onEdit: (game: MinecraftGame) => void
  onDelete: (game: MinecraftGame) => void
}

/**
 * Affiche une carte représentant une partie Minecraft random suivie par
 * l'utilisateur, avec un effet de lueur en coin et des actions rapides pour
 * la renommer ou la supprimer. La carte est cliquable et mène à la page de
 * détail de la partie (son historique de crafts et loots).
 */
export function MinecraftGameCard({ game, onEdit, onDelete }: MinecraftGameCardProps) {
  const navigate = useNavigate()

  /**
   * Ouvre la page de détail de la partie représentée par cette carte.
   * @returns rien, la fonction agit uniquement par effet de bord (navigation)
   */
  function openDetailPage() {
    navigate(`/minecraft/${game.id}`)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openDetailPage()
    }
  }

  function handleEditClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    onEdit(game)
  }

  function handleDeleteClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    onDelete(game)
  }

  return (
    <div
      className="minecraft-game-card"
      role="link"
      tabIndex={0}
      aria-label={`Voir ${game.name}`}
      onClick={openDetailPage}
      onKeyDown={handleKeyDown}
    >
      <div className="minecraft-game-card__glow" aria-hidden="true" />
      <div className="minecraft-game-card__inner">
        <span className="minecraft-game-card__name">{game.name}</span>
        <div className="minecraft-game-card__actions">
          <button
            type="button"
            className="minecraft-game-card__action"
            aria-label={`Modifier ${game.name}`}
            onClick={handleEditClick}
          >
            <Pencil aria-hidden="true" />
          </button>
          <button
            type="button"
            className="minecraft-game-card__action minecraft-game-card__action--danger"
            aria-label={`Supprimer ${game.name}`}
            onClick={handleDeleteClick}
          >
            <Trash2 aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
