import type { PokemonGame } from '../../features/pokemon/pokemonApi'
import './PokemonGameCard.css'

interface PokemonGameCardProps {
  game: PokemonGame
}

/**
 * Affiche une carte représentant un jeu Pokémon suivi par
 * l'utilisateur, avec un effet de lueur en coin. Ne contient pour
 * l'instant que le nom du jeu.
 */
export function PokemonGameCard({ game }: PokemonGameCardProps) {
  return (
    <div className="pokemon-game-card">
      <div className="pokemon-game-card__glow" aria-hidden="true" />
      <div className="pokemon-game-card__inner">
        <span className="pokemon-game-card__name">{game.name}</span>
      </div>
    </div>
  )
}
