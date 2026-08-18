import { useEffect, useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { Navbar } from '../../components/Navbar/Navbar'
import { Modal } from '../../components/Modal/Modal'
import { FormField } from '../../components/FormField/FormField'
import { PrimaryButton } from '../../components/PrimaryButton/PrimaryButton'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog'
import { PokemonGameCard } from '../../components/PokemonGameCard/PokemonGameCard'
import {
  createPokemonGame,
  deletePokemonGame,
  fetchPokemonGames,
  updatePokemonGame,
  type PokemonGame,
} from '../../features/pokemon/pokemonApi'
import './PokemonPage.css'

type FormState = { mode: 'create' } | { mode: 'edit'; game: PokemonGame } | null

/**
 * Page de suivi des jeux Pokémon de l'utilisateur connecté. Affiche
 * les jeux existants sous forme de cartes, et permet d'en ajouter, d'en
 * renommer ou d'en supprimer avec confirmation.
 */
export function PokemonPage() {
  const [games, setGames] = useState<PokemonGame[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [formState, setFormState] = useState<FormState>(null)
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null)

  const [gameToDelete, setGameToDelete] = useState<PokemonGame | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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
  function openCreateForm() {
    setName('')
    setFormErrorMessage(null)
    setFormState({ mode: 'create' })
  }

  /**
   * Ouvre la modale de modification avec le nom actuel du jeu.
   * @param game jeu à modifier
   * @returns rien, la fonction agit uniquement par effet de bord (état de la page)
   */
  function openEditForm(game: PokemonGame) {
    setName(game.name)
    setFormErrorMessage(null)
    setFormState({ mode: 'edit', game })
  }

  /**
   * Crée ou met à jour un jeu Pokémon selon le mode actif, recharge la
   * liste, puis ferme la modale en cas de succès.
   * @param event événement de soumission du formulaire
   * @returns rien, la fonction agit uniquement par effet de bord (état, réseau)
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!formState) {
      return
    }

    setFormErrorMessage(null)
    setIsSubmitting(true)

    const trimmedName = name.trim()
    const { error } =
      formState.mode === 'create'
        ? await createPokemonGame(trimmedName)
        : await updatePokemonGame(formState.game.id, trimmedName)

    setIsSubmitting(false)

    if (error) {
      setFormErrorMessage(error)
      return
    }

    setFormState(null)
    await refreshGames()
  }

  /**
   * Confirme la suppression du jeu sélectionné, puis recharge la liste
   * et ferme la modale de confirmation en cas de succès.
   * @returns rien, la fonction agit uniquement par effet de bord (état, réseau)
   */
  async function handleConfirmDelete() {
    if (!gameToDelete) {
      return
    }

    setIsDeleting(true)

    const { error } = await deletePokemonGame(gameToDelete.id)

    setIsDeleting(false)

    if (error) {
      setErrorMessage(error)
      return
    }

    setGameToDelete(null)
    await refreshGames()
  }

  return (
    <div className="pokemon-page">
      <Navbar />
      <main className="pokemon-page__content">
        <div className="pokemon-page__header">
          <h1 className="pokemon-page__title">Pokémon</h1>
          <button type="button" className="pokemon-page__add" onClick={openCreateForm}>
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
              <PokemonGameCard
                key={game.id}
                game={game}
                onEdit={openEditForm}
                onDelete={(selectedGame) => setGameToDelete(selectedGame)}
              />
            ))}
          </div>
        )}
      </main>

      {formState && (
        <Modal
          title={formState.mode === 'create' ? 'Ajouter un jeu' : 'Modifier un jeu'}
          onClose={() => setFormState(null)}
        >
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
                onClick={() => setFormState(null)}
              >
                Annuler
              </button>
              <PrimaryButton
                type="submit"
                className="pokemon-page__form-submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Enregistrement...'
                  : formState.mode === 'create'
                    ? 'Ajouter'
                    : 'Enregistrer'}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}

      {gameToDelete && (
        <ConfirmDialog
          title="Supprimer ce jeu"
          message={`Es-tu sûr de vouloir supprimer "${gameToDelete.name}" ? Cette action est définitive.`}
          confirmLabel="Supprimer"
          isConfirming={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setGameToDelete(null)}
        />
      )}
    </div>
  )
}
