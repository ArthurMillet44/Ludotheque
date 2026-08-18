import { useEffect, useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { Navbar } from '../../components/Navbar/Navbar'
import { Modal } from '../../components/Modal/Modal'
import { FormField } from '../../components/FormField/FormField'
import { PrimaryButton } from '../../components/PrimaryButton/PrimaryButton'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { PokemonGameCard } from '../../components/PokemonGameCard/PokemonGameCard'
import {
  createPokemonGame,
  fetchPokemonGames,
  type PokemonGame,
} from '../../features/pokemon/pokemonApi'
import './PokemonPage.css'

/**
 * Page de suivi des jeux Pokémon de l'utilisateur connecté. Affiche
 * les jeux existants sous forme de cartes, et permet d'en ajouter un
 * nouveau par son nom.
 */
export function PokemonPage() {
  const [games, setGames] = useState<PokemonGame[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null)

  /**
   * Recharge la liste des jeux Pokémon depuis Supabase et met à jour
   * l'état de la page en conséquence.
   * @returns rien, la fonction agit uniquement par effet de bord (état de la page)
   */
  async function refreshGames() {
    const { games: result, error } = await fetchPokemonGames()

    if (error) {
      setErrorMessage(error)
    } else {
      setGames(result)
      setErrorMessage(null)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    refreshGames()
  }, [])

  /**
   * Ouvre la modale d'ajout avec un champ nom vide.
   * @returns rien, la fonction agit uniquement par effet de bord (état de la page)
   */
  function openForm() {
    setName('')
    setFormErrorMessage(null)
    setIsFormOpen(true)
  }

  /**
   * Crée un nouveau jeu Pokémon avec le nom saisi, recharge la liste,
   * puis ferme la modale en cas de succès.
   * @param event événement de soumission du formulaire
   * @returns rien, la fonction agit uniquement par effet de bord (état, réseau)
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setFormErrorMessage(null)
    setIsSubmitting(true)

    const { error } = await createPokemonGame(name.trim())

    setIsSubmitting(false)

    if (error) {
      setFormErrorMessage(error)
      return
    }

    setIsFormOpen(false)
    await refreshGames()
  }

  return (
    <div className="pokemon-page">
      <Navbar />
      <main className="pokemon-page__content">
        <div className="pokemon-page__header">
          <h1 className="pokemon-page__title">Pokémon</h1>
          <button type="button" className="pokemon-page__add" onClick={openForm}>
            <Plus aria-hidden="true" />
            Ajouter un jeu
          </button>
        </div>
        {isLoading && <p className="pokemon-page__status">Chargement...</p>}
        {!isLoading && errorMessage && (
          <p className="pokemon-page__status pokemon-page__status--error" role="alert">
            {errorMessage}
          </p>
        )}
        {!isLoading && !errorMessage && games.length === 0 && (
          <EmptyState message="Aucun jeu n'existe pour le moment." />
        )}
        {!isLoading && !errorMessage && games.length > 0 && (
          <div className="pokemon-page__grid">
            {games.map((game) => (
              <PokemonGameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </main>

      {isFormOpen && (
        <Modal title="Ajouter un jeu" onClose={() => setIsFormOpen(false)}>
          <form className="pokemon-page__form" onSubmit={handleSubmit}>
            <FormField
              id="pokemon-game-name"
              label="Nom du jeu"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            {formErrorMessage && (
              <p className="pokemon-page__form-error" role="alert">
                {formErrorMessage}
              </p>
            )}
            <div className="pokemon-page__form-actions">
              <button
                type="button"
                className="pokemon-page__form-cancel"
                onClick={() => setIsFormOpen(false)}
              >
                Annuler
              </button>
              <PrimaryButton
                type="submit"
                className="pokemon-page__form-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Ajout...' : 'Ajouter'}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
