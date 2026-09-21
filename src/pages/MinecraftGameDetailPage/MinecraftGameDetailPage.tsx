import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Navbar } from '../../components/Navbar/Navbar'
import { Modal } from '../../components/Modal/Modal'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog'
import { SelectField } from '../../components/SelectField/SelectField'
import { MinecraftHistoryTimeline } from '../../components/MinecraftHistoryTimeline/MinecraftHistoryTimeline'
import { MinecraftHistoryForm } from '../../components/MinecraftHistoryForm/MinecraftHistoryForm'
import { fetchMinecraftGameById, type MinecraftGame } from '../../features/minecraft/minecraftApi'
import {
  createMinecraftHistoryEntry,
  deleteMinecraftHistoryEntry,
  fetchMinecraftHistory,
  filterMinecraftHistoryEntriesByCategory,
  updateMinecraftHistoryEntry,
  type MinecraftHistoryCategory,
  type MinecraftHistoryEntry,
  type MinecraftHistoryInput,
} from '../../features/minecraft/minecraftHistoryApi'
import './MinecraftGameDetailPage.css'

type FormState =
  | { mode: 'create'; parentEntry: MinecraftHistoryEntry | null }
  | { mode: 'edit'; entry: MinecraftHistoryEntry }
  | null

const CATEGORY_FILTER_OPTIONS: { value: MinecraftHistoryCategory; label: string }[] = [
  { value: 'armure', label: 'Armure' },
  { value: 'outil', label: 'Outil' },
  { value: 'potion', label: 'Potion' },
  { value: 'nourriture', label: 'Nourriture' },
  { value: 'bloc', label: 'Bloc' },
  { value: 'autre', label: 'Autre' },
]

/**
 * Page de détail d'une partie Minecraft random, accessible en cliquant sur
 * sa carte depuis la page Minecraft. Volontairement absente de la Navbar :
 * elle n'est atteignable que depuis sa carte. Affiche l'historique des
 * crafts et loots de cette partie sous forme d'arbre (une entrée peut avoir
 * des sous-entrées, représentant de nouvelles actions réalisées à partir de
 * l'item obtenu), et permet d'ajouter une entrée de premier niveau ou une
 * sous-entrée, d'en modifier ou d'en supprimer avec confirmation. Un filtre
 * par catégorie permet de ne voir que les chaînes de premier niveau d'une
 * catégorie donnée (avec toutes leurs sous-entrées), les catégories étant
 * réservées aux entrées de premier niveau (voir MinecraftHistoryForm).
 */
export function MinecraftGameDetailPage() {
  const { id } = useParams<{ id: string }>()

  const [game, setGame] = useState<MinecraftGame | null>(null)
  const [isLoadingGame, setIsLoadingGame] = useState(true)
  const [gameErrorMessage, setGameErrorMessage] = useState<string | null>(null)

  const [entries, setEntries] = useState<MinecraftHistoryEntry[]>([])
  const [isLoadingEntries, setIsLoadingEntries] = useState(true)
  const [entriesErrorMessage, setEntriesErrorMessage] = useState<string | null>(null)

  const [formState, setFormState] = useState<FormState>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null)

  const [entryToDelete, setEntryToDelete] = useState<MinecraftHistoryEntry | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [categoryFilter, setCategoryFilter] = useState<MinecraftHistoryCategory | 'all'>('all')

  const filteredEntries = useMemo(
    () => filterMinecraftHistoryEntriesByCategory(entries, categoryFilter === 'all' ? null : categoryFilter),
    [entries, categoryFilter],
  )

  useEffect(() => {
    let isMounted = true

    async function loadGame() {
      if (!id) {
        return
      }

      const { game: result, error } = await fetchMinecraftGameById(id)

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
   * Recharge l'historique de cette partie depuis Supabase et met à jour
   * l'état de la page en conséquence.
   * @returns rien, la fonction agit uniquement par effet de bord (état de la page)
   */
  async function refreshEntries() {
    if (!id) {
      return
    }

    const { entries: result, error } = await fetchMinecraftHistory(id)

    if (error) {
      setEntriesErrorMessage(error)
    } else {
      setEntries(result)
      setEntriesErrorMessage(null)
    }

    setIsLoadingEntries(false)
  }

  useEffect(() => {
    refreshEntries()
  }, [id])

  /**
   * Ouvre la modale d'ajout d'une entrée d'historique. Si parentEntry est
   * renseigné, la nouvelle entrée sera créée comme sous-entrée de celle-ci
   * (nouvelle action réalisée à partir de l'item qu'elle a permis d'obtenir).
   * @param parentEntry entrée parente, ou null pour ajouter une entrée de premier niveau
   * @returns rien, la fonction agit uniquement par effet de bord (état de la page)
   */
  function openCreateForm(parentEntry: MinecraftHistoryEntry | null) {
    setFormErrorMessage(null)
    setFormState({ mode: 'create', parentEntry })
  }

  /**
   * Ouvre la modale de modification d'une entrée d'historique existante.
   * @param entry entrée à modifier
   * @returns rien, la fonction agit uniquement par effet de bord (état de la page)
   */
  function openEditForm(entry: MinecraftHistoryEntry) {
    setFormErrorMessage(null)
    setFormState({ mode: 'edit', entry })
  }

  /**
   * Crée ou met à jour une entrée d'historique selon le mode actif,
   * recharge la liste, puis ferme la modale en cas de succès. En
   * modification, le rattachement à une entrée parente (input.parentEntryId)
   * est ignoré : seuls le type et les deux items sont mis à jour.
   * @param input valeurs saisies dans le formulaire (entrée parente, type, item d'entrée, item de sortie)
   * @returns rien, la fonction agit uniquement par effet de bord (état, réseau)
   */
  async function handleSubmit(input: MinecraftHistoryInput) {
    if (!id || !formState) {
      return
    }

    setFormErrorMessage(null)
    setIsSubmitting(true)

    const { error } =
      formState.mode === 'create'
        ? await createMinecraftHistoryEntry(id, input)
        : await updateMinecraftHistoryEntry(formState.entry.id, input)

    setIsSubmitting(false)

    if (error) {
      setFormErrorMessage(error)
      return
    }

    setFormState(null)
    await refreshEntries()
  }

  /**
   * Confirme la suppression de l'entrée sélectionnée, puis recharge la
   * liste et ferme la modale de confirmation en cas de succès.
   * @returns rien, la fonction agit uniquement par effet de bord (état, réseau)
   */
  async function handleConfirmDelete() {
    if (!entryToDelete) {
      return
    }

    setIsDeleting(true)

    const { error } = await deleteMinecraftHistoryEntry(entryToDelete.id)

    setIsDeleting(false)

    if (error) {
      setEntriesErrorMessage(error)
      return
    }

    setEntryToDelete(null)
    await refreshEntries()
  }

  return (
    <div className="minecraft-game-detail-page">
      <Navbar />
      <main className="minecraft-game-detail-page__content">
        {isLoadingGame && <p className="minecraft-game-detail-page__status">Chargement...</p>}
        {!isLoadingGame && gameErrorMessage && (
          <p
            className="minecraft-game-detail-page__status minecraft-game-detail-page__status--error"
            role="alert"
          >
            {gameErrorMessage}
          </p>
        )}
        {!isLoadingGame && !gameErrorMessage && !game && (
          <p className="minecraft-game-detail-page__status">Cette partie n'existe pas.</p>
        )}
        {!isLoadingGame && !gameErrorMessage && game && (
          <>
            <div className="minecraft-game-detail-page__header">
              <h1 className="minecraft-game-detail-page__title">{game.name}</h1>
              <button
                type="button"
                className="minecraft-game-detail-page__add"
                onClick={() => openCreateForm(null)}
              >
                <Plus aria-hidden="true" />
                Ajouter une entrée
              </button>
            </div>
            {!isLoadingEntries && !entriesErrorMessage && entries.length > 0 && (
              <SelectField
                id="minecraft-history-category-filter"
                label="Filtrer par catégorie"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value as MinecraftHistoryCategory | 'all')}
              >
                <option value="all">Toutes les catégories</option>
                {CATEGORY_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectField>
            )}
            {isLoadingEntries && (
              <p className="minecraft-game-detail-page__status">Chargement...</p>
            )}
            {!isLoadingEntries && entriesErrorMessage && (
              <p
                className="minecraft-game-detail-page__status minecraft-game-detail-page__status--error"
                role="alert"
              >
                {entriesErrorMessage}
              </p>
            )}
            {!isLoadingEntries && !entriesErrorMessage && entries.length === 0 && (
              <EmptyState message="Aucune entrée n'existe pour l'instant dans l'historique de cette partie." />
            )}
            {!isLoadingEntries && !entriesErrorMessage && entries.length > 0 && filteredEntries.length === 0 && (
              <EmptyState message="Aucune chaîne ne correspond à cette catégorie." />
            )}
            {!isLoadingEntries && !entriesErrorMessage && filteredEntries.length > 0 && (
              <MinecraftHistoryTimeline
                entries={filteredEntries}
                onAddChild={(parentEntry) => openCreateForm(parentEntry)}
                onEdit={openEditForm}
                onDelete={(entry) => setEntryToDelete(entry)}
              />
            )}
          </>
        )}
      </main>

      {formState && (
        <Modal
          title={formState.mode === 'create' ? 'Ajouter une entrée' : 'Modifier cette entrée'}
          onClose={() => setFormState(null)}
        >
          <MinecraftHistoryForm
            initialEntry={formState.mode === 'edit' ? formState.entry : null}
            parentEntry={formState.mode === 'create' ? formState.parentEntry : null}
            onSubmit={handleSubmit}
            onCancel={() => setFormState(null)}
            isSubmitting={isSubmitting}
            errorMessage={formErrorMessage}
          />
        </Modal>
      )}

      {entryToDelete && (
        <ConfirmDialog
          title="Supprimer cette entrée"
          message={
            entries.some((entry) => entry.parentEntryId === entryToDelete.id)
              ? "Es-tu sûr de vouloir supprimer cette entrée ? Ses sous-entrées seront aussi supprimées. Cette action est définitive."
              : "Es-tu sûr de vouloir supprimer cette entrée de l'historique ? Cette action est définitive."
          }
          confirmLabel="Supprimer"
          isConfirming={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setEntryToDelete(null)}
        />
      )}
    </div>
  )
}
