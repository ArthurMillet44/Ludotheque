import type { KeyboardEvent, MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import type { PokemonGame } from '../../features/pokemon/pokemonApi'
import './PokemonGameCard.css'

interface PokemonGameCardProps {
  game: PokemonGame
  onEdit: (game: PokemonGame) => void
  onDelete: (game: PokemonGame) => void
}

/**
 * Affiche une carte représentant un jeu Pokémon suivi par
 * l'utilisateur, avec un effet de lueur en coin et des actions rapides
 * pour modifier ou supprimer le jeu. La carte est cliquable et mène à
 * la page de détail du jeu.
 */
export function PokemonGameCard({ game, onEdit, onDelete }: PokemonGameCardProps) {
  const navigate = useNavigate()

  /**
   * Ouvre la page de détail du jeu représenté par cette carte.
   * @returns rien, la fonction agit uniquement par effet de bord (navigation)
   */
  function openDetailPage() {
    navigate(`/pokemon/${game.id}`)
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
      className="pokemon-game-card"
      role="link"
      tabIndex={0}
      aria-label={`Voir ${game.name}`}
      onClick={openDetailPage}
      onKeyDown={handleKeyDown}
    >
      <div className="pokemon-game-card__glow" aria-hidden="true" />
      <div className="pokemon-game-card__inner">
        <span className="pokemon-game-card__name">{game.name}</span>
        <div className="pokemon-game-card__actions">
          <button
            type="button"
            className="pokemon-game-card__action"
            aria-label={`Modifier ${game.name}`}
            onClick={handleEditClick}
          >
            <Pencil aria-hidden="true" />
          </button>
          <button
            type="button"
            className="pokemon-game-card__action pokemon-game-card__action--danger"
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
