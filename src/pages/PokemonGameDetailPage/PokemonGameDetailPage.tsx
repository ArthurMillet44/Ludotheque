import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Navbar } from '../../components/Navbar/Navbar'
import { fetchPokemonGameById, type PokemonGame } from '../../features/pokemon/pokemonApi'
import './PokemonGameDetailPage.css'

/**
 * Page de détail d'un jeu Pokémon, accessible en cliquant sur sa carte
 * depuis la page Pokémon. Volontairement absente de la Navbar : elle
 * n'est atteignable que depuis sa carte. N'affiche pour l'instant que
 * le nom du jeu.
 */
export function PokemonGameDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [game, setGame] = useState<PokemonGame | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadGame() {
      if (!id) {
        return
      }

      const { game: result, error } = await fetchPokemonGameById(id)

      if (!isMounted) {
        return
      }

      if (error) {
        setErrorMessage(error)
      } else {
        setGame(result)
      }

      setIsLoading(false)
    }

    loadGame()

    return () => {
      isMounted = false
    }
  }, [id])

  return (
    <div className="pokemon-game-detail-page">
      <Navbar />
      <main className="pokemon-game-detail-page__content">
        {isLoading && <p className="pokemon-game-detail-page__status">Chargement...</p>}
        {!isLoading && errorMessage && (
          <p
            className="pokemon-game-detail-page__status pokemon-game-detail-page__status--error"
            role="alert"
          >
            {errorMessage}
          </p>
        )}
        {!isLoading && !errorMessage && !game && (
          <p className="pokemon-game-detail-page__status">Ce jeu n'existe pas.</p>
        )}
        {!isLoading && !errorMessage && game && (
          <h1 className="pokemon-game-detail-page__title">{game.name}</h1>
        )}
      </main>
    </div>
  )
}
