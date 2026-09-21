import { useEffect, useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { Navbar } from '../../components/Navbar/Navbar'
import { Modal } from '../../components/Modal/Modal'
import { FormField } from '../../components/FormField/FormField'
import { PrimaryButton } from '../../components/PrimaryButton/PrimaryButton'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog'
import { MinecraftGameCard } from '../../components/MinecraftGameCard/MinecraftGameCard'
import {
  createMinecraftGame,
  deleteMinecraftGame,
  fetchMinecraftGames,
  updateMinecraftGame,
  type MinecraftGame,
} from '../../features/minecraft/minecraftApi'
import './MinecraftPage.css'

type FormState = { mode: 'create' } | { mode: 'edit'; game: MinecraftGame } | null

/**
 * Page de suivi des parties Minecraft random (craft et loots randomisés) de
 * l'utilisateur connecté. Affiche les parties existantes sous forme de
 * cartes, et permet d'en ajouter, d'en renommer ou d'en supprimer avec
 * confirmation. Chaque carte mène à l'historique détaillé de la partie.
 */
export function MinecraftPage() {
  const [games, setGames] = useState<MinecraftGame[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [formState, setFormState] = useState<FormState>(null)
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null)

  const [gameToDelete, setGameToDelete] = useState<MinecraftGame | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  /**
   * Recharge la liste des parties Minecraft depuis Supabase et met à jour
   * l'état de la page en conséquence.
   * @returns rien, la fonction agit uniquement par effet de bord (état de la page)
   */
  async function refreshGames() {
    const { games: result, error } = await fetchMinecraftGames()

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
   * Ouvre la modale de modification avec le nom actuel de la partie.
   * @param game partie à modifier
   * @returns rien, la fonction agit uniquement par effet de bord (état de la page)
   */
  function openEditForm(game: MinecraftGame) {
    setName(game.name)
    setFormErrorMessage(null)
    setFormState({ mode: 'edit', game })
  }

  /**
   * Crée ou met à jour une partie Minecraft selon le mode actif, recharge
   * la liste, puis ferme la modale en cas de succès.
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
        ? await createMinecraftGame(trimmedName)
        : await updateMinecraftGame(formState.game.id, trimmedName)

    setIsSubmitting(false)

    if (error) {
      setFormErrorMessage(error)
      return
    }

    setFormState(null)
    await refreshGames()
  }

  /**
   * Confirme la suppression de la partie sélectionnée, puis recharge la
   * liste et ferme la modale de confirmation en cas de succès.
   * @returns rien, la fonction agit uniquement par effet de bord (état, réseau)
   */
  async function handleConfirmDelete() {
    if (!gameToDelete) {
      return
    }

    setIsDeleting(true)

    const { error } = await deleteMinecraftGame(gameToDelete.id)

    setIsDeleting(false)

    if (error) {
      setErrorMessage(error)
      return
    }

    setGameToDelete(null)
    await refreshGames()
  }

  return (
    <div className="minecraft-page">
      <Navbar />
      <main className="minecraft-page__content">
        <div className="minecraft-page__header">
          <h1 className="minecraft-page__title">Minecraft</h1>
          <button type="button" className="minecraft-page__add" onClick={openCreateForm}>
            <Plus aria-hidden="true" />
            Ajouter une partie
          </button>
        </div>
        {isLoading && <p className="minecraft-page__status">Chargement...</p>}
        {!isLoading && errorMessage && (
          <p className="minecraft-page__status minecraft-page__status--error" role="alert">
            {errorMessage}
          </p>
        )}
        {!isLoading && !errorMessage && games.length === 0 && (
          <EmptyState message="Aucune partie n'existe pour le moment." />
        )}
        {!isLoading && !errorMessage && games.length > 0 && (
          <div className="minecraft-page__grid">
            {games.map((game) => (
              <MinecraftGameCard
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
          title={formState.mode === 'create' ? 'Ajouter une partie' : 'Modifier une partie'}
          onClose={() => setFormState(null)}
        >
          <form className="minecraft-page__form" onSubmit={handleSubmit}>
            <FormField
              id="minecraft-game-name"
              label="Nom de la partie"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            {formErrorMessage && (
              <p className="minecraft-page__form-error" role="alert">
                {formErrorMessage}
              </p>
            )}
            <div className="minecraft-page__form-actions">
              <button
                type="button"
                className="minecraft-page__form-cancel"
                onClick={() => setFormState(null)}
              >
                Annuler
              </button>
              <PrimaryButton
                type="submit"
                className="minecraft-page__form-submit"
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
          title="Supprimer cette partie"
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
