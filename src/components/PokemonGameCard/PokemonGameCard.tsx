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
 * pour modifier ou supprimer le jeu.
 */
export function PokemonGameCard({ game, onEdit, onDelete }: PokemonGameCardProps) {
  return (
    <div className="pokemon-game-card">
      <div className="pokemon-game-card__glow" aria-hidden="true" />
      <div className="pokemon-game-card__inner">
        <span className="pokemon-game-card__name">{game.name}</span>
        <div className="pokemon-game-card__actions">
          <button
            type="button"
            className="pokemon-game-card__action"
            aria-label={`Modifier ${game.name}`}
            onClick={() => onEdit(game)}
          >
            <Pencil aria-hidden="true" />
          </button>
          <button
            type="button"
            className="pokemon-game-card__action pokemon-game-card__action--danger"
            aria-label={`Supprimer ${game.name}`}
            onClick={() => onDelete(game)}
          >
            <Trash2 aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
