import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Navbar } from '../../components/Navbar/Navbar'
import { Modal } from '../../components/Modal/Modal'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog'
import { PokemonCaptureTable } from '../../components/PokemonCaptureTable/PokemonCaptureTable'
import { PokemonCaptureForm } from '../../components/PokemonCaptureForm/PokemonCaptureForm'
import { fetchPokemonGameById, type PokemonGame } from '../../features/pokemon/pokemonApi'
import {
  createPokemonCapture,
  deletePokemonCapture,
  fetchPokemonCaptures,
  updatePokemonCapture,
  type PokemonCapture,
  type PokemonCaptureInput,
} from '../../features/pokemon/pokemonCapturesApi'
import './PokemonGameDetailPage.css'

type FormState = { mode: 'create' } | { mode: 'edit'; capture: PokemonCapture } | null

/**
 * Page de détail d'un jeu Pokémon, accessible en cliquant sur sa carte
 * depuis la page Pokémon. Volontairement absente de la Navbar : elle
 * n'est atteignable que depuis sa carte. Affiche les Pokémon capturés
 * pour ce jeu, et permet d'en ajouter, d'en modifier ou d'en supprimer
 * avec confirmation.
 */
export function PokemonGameDetailPage() {
  const { id } = useParams<{ id: string }>()

  const [game, setGame] = useState<PokemonGame | null>(null)
  const [isLoadingGame, setIsLoadingGame] = useState(true)
  const [gameErrorMessage, setGameErrorMessage] = useState<string | null>(null)

  const [captures, setCaptures] = useState<PokemonCapture[]>([])
  const [isLoadingCaptures, setIsLoadingCaptures] = useState(true)
  const [capturesErrorMessage, setCapturesErrorMessage] = useState<string | null>(null)

  const [formState, setFormState] = useState<FormState>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null)

  const [captureToDelete, setCaptureToDelete] = useState<PokemonCapture | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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
        setGameErrorMessage(error)
      } else {
        setGame(result)
      }

      setIsLoadingGame(false)
    }

    loadGame()

    return () => {
      isMounted = false
    }
  }, [id])

  /**
   * Recharge la liste des Pokémon capturés pour ce jeu depuis Supabase
   * et met à jour l'état de la page en conséquence.
   * @returns rien, la fonction agit uniquement par effet de bord (état de la page)
   */
  async function refreshCaptures() {
    if (!id) {
      return
    }

    const { captures: result, error } = await fetchPokemonCaptures(id)

    if (error) {
      setCapturesErrorMessage(error)
    } else {
      setCaptures(result)
      setCapturesErrorMessage(null)
    }

    setIsLoadingCaptures(false)
  }

  useEffect(() => {
    refreshCaptures()
  }, [id])

  /**
   * Ouvre la modale d'ajout d'un Pokémon capturé.
   * @returns rien, la fonction agit uniquement par effet de bord (état de la page)
   */
  function openCreateForm() {
    setFormErrorMessage(null)
    setFormState({ mode: 'create' })
  }

  /**
   * Ouvre la modale de modification d'une capture existante.
   * @param capture capture à modifier
   * @returns rien, la fonction agit uniquement par effet de bord (état de la page)
   */
  function openEditForm(capture: PokemonCapture) {
    setFormErrorMessage(null)
    setFormState({ mode: 'edit', capture })
  }

  /**
   * Crée ou met à jour une capture selon le mode actif, recharge la
   * liste, puis ferme la modale en cas de succès.
   * @param input valeurs saisies dans le formulaire (zone, Pokémon capturé, statut)
   * @returns rien, la fonction agit uniquement par effet de bord (état, réseau)
   */
  async function handleSubmit(input: PokemonCaptureInput) {
    if (!id || !formState) {
      return
    }

    setFormErrorMessage(null)
    setIsSubmitting(true)

    const { error } =
      formState.mode === 'create'
        ? await createPokemonCapture(id, input)
        : await updatePokemonCapture(formState.capture.id, input)

    setIsSubmitting(false)

    if (error) {
      setFormErrorMessage(error)
      return
    }

    setFormState(null)
    await refreshCaptures()
  }

  /**
   * Confirme la suppression de la capture sélectionnée, puis recharge
   * la liste et ferme la modale de confirmation en cas de succès.
   * @returns rien, la fonction agit uniquement par effet de bord (état, réseau)
   */
  async function handleConfirmDelete() {
    if (!captureToDelete) {
      return
    }

    setIsDeleting(true)

    const { error } = await deletePokemonCapture(captureToDelete.id)

    setIsDeleting(false)

    if (error) {
      setCapturesErrorMessage(error)
      return
    }

    setCaptureToDelete(null)
    await refreshCaptures()
  }

  return (
    <div className="pokemon-game-detail-page">
      <Navbar />
      <main className="pokemon-game-detail-page__content">
        {isLoadingGame && <p className="pokemon-game-detail-page__status">Chargement...</p>}
        {!isLoadingGame && gameErrorMessage && (
          <p
            className="pokemon-game-detail-page__status pokemon-game-detail-page__status--error"
            role="alert"
          >
            {gameErrorMessage}
          </p>
        )}
        {!isLoadingGame && !gameErrorMessage && !game && (
          <p className="pokemon-game-detail-page__status">Ce jeu n'existe pas.</p>
        )}
        {!isLoadingGame && !gameErrorMessage && game && (
          <>
            <div className="pokemon-game-detail-page__header">
              <h1 className="pokemon-game-detail-page__title">{game.name}</h1>
              <button
                type="button"
                className="pokemon-game-detail-page__add"
                onClick={openCreateForm}
              >
                <Plus aria-hidden="true" />
                Ajouter un Pokémon
              </button>
            </div>
            {isLoadingCaptures && (
              <p className="pokemon-game-detail-page__status">Chargement...</p>
            )}
            {!isLoadingCaptures && capturesErrorMessage && (
              <p
                className="pokemon-game-detail-page__status pokemon-game-detail-page__status--error"
                role="alert"
              >
                {capturesErrorMessage}
              </p>
            )}
            {!isLoadingCaptures && !capturesErrorMessage && captures.length === 0 && (
              <EmptyState message="Aucun Pokémon capturé pour l'instant." />
            )}
            {!isLoadingCaptures && !capturesErrorMessage && captures.length > 0 && (
              <PokemonCaptureTable
                captures={captures}
                onEdit={openEditForm}
                onDelete={(capture) => setCaptureToDelete(capture)}
              />
            )}
          </>
        )}
      </main>

      {formState && (
        <Modal
          title={formState.mode === 'create' ? 'Ajouter un Pokémon' : 'Modifier ce Pokémon'}
          onClose={() => setFormState(null)}
        >
          <PokemonCaptureForm
            initialCapture={formState.mode === 'edit' ? formState.capture : null}
            onSubmit={handleSubmit}
            onCancel={() => setFormState(null)}
            isSubmitting={isSubmitting}
            errorMessage={formErrorMessage}
          />
        </Modal>
      )}

      {captureToDelete && (
        <ConfirmDialog
          title="Supprimer cette capture"
          message={`Es-tu sûr de vouloir supprimer "${captureToDelete.capturedPokemon}" (${captureToDelete.zone}) ? Cette action est définitive.`}
          confirmLabel="Supprimer"
          isConfirming={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setCaptureToDelete(null)}
        />
      )}
    </div>
  )
}
