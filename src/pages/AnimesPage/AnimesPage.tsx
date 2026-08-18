import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Navbar } from '../../components/Navbar/Navbar'
import { AnimeTable } from '../../components/AnimeTable/AnimeTable'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { SearchBar } from '../../components/SearchBar/SearchBar'
import { Modal } from '../../components/Modal/Modal'
import { AnimeForm } from '../../components/AnimeForm/AnimeForm'
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog'
import {
  createAnime,
  deleteAnime,
  fetchAnimes,
  filterAnimesByTitle,
  updateAnime,
  type Anime,
  type AnimeInput,
} from '../../features/animes/animesApi'
import './AnimesPage.css'

type FormState = { mode: 'create' } | { mode: 'edit'; anime: Anime } | null

/**
 * Page listant les animes de l'utilisateur connecté. Récupère la liste
 * depuis Supabase au chargement de la page, permet de la filtrer par
 * titre, et propose la création, la modification, la suppression et
 * l'incrémentation rapide du nombre d'épisodes.
 */
export function AnimesPage() {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [formState, setFormState] = useState<FormState>(null)
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null)

  const [animeToDelete, setAnimeToDelete] = useState<Anime | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [incrementingAnimeId, setIncrementingAnimeId] = useState<string | null>(null)

  /**
   * Recharge la liste des animes depuis Supabase et met à jour l'état
   * de la page en conséquence.
   * @returns rien, la fonction agit uniquement par effet de bord (état de la page)
   */
  async function refreshAnimes() {
    const { animes: result, error } = await fetchAnimes()

    if (error) {
      setErrorMessage(error)
    } else {
      setAnimes(result)
      setErrorMessage(null)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    refreshAnimes()
  }, [])

  const filteredAnimes = useMemo(
    () => filterAnimesByTitle(animes, searchQuery),
    [animes, searchQuery],
  )

  /**
   * Enregistre le formulaire d'ajout ou de modification : crée ou met
   * à jour l'anime selon le mode actif, puis recharge la liste et
   * ferme la modale en cas de succès.
   * @param input valeurs saisies dans le formulaire
   * @returns rien, la fonction agit uniquement par effet de bord (état, réseau)
   */
  async function handleFormSubmit(input: AnimeInput) {
    if (!formState) {
      return
    }

    setFormErrorMessage(null)
    setIsSubmittingForm(true)

    const { error } =
      formState.mode === 'create'
        ? await createAnime(input)
        : await updateAnime(formState.anime.id, input)

    setIsSubmittingForm(false)

    if (error) {
      setFormErrorMessage(error)
      return
    }

    setFormState(null)
    await refreshAnimes()
  }

  /**
   * Confirme la suppression de l'anime sélectionné, puis recharge la
   * liste et ferme la modale de confirmation en cas de succès.
   * @returns rien, la fonction agit uniquement par effet de bord (état, réseau)
   */
  async function handleConfirmDelete() {
    if (!animeToDelete) {
      return
    }

    setIsDeleting(true)

    const { error } = await deleteAnime(animeToDelete.id)

    setIsDeleting(false)

    if (error) {
      setErrorMessage(error)
      return
    }

    setAnimeToDelete(null)
    await refreshAnimes()
  }

  /**
   * Ajoute un épisode au compteur d'un anime, puis recharge la liste.
   * @param anime anime concerné par l'incrémentation
   * @returns rien, la fonction agit uniquement par effet de bord (état, réseau)
   */
  async function handleIncrementEpisode(anime: Anime) {
    setIncrementingAnimeId(anime.id)

    const { error } = await updateAnime(anime.id, { episodes: (anime.episodes ?? 0) + 1 })

    setIncrementingAnimeId(null)

    if (error) {
      setErrorMessage(error)
      return
    }

    await refreshAnimes()
  }

  return (
    <div className="animes-page">
      <Navbar />
      <main className="animes-page__content">
        <div className="animes-page__header">
          <h1 className="animes-page__title">Animes</h1>
          <button
            type="button"
            className="animes-page__add"
            onClick={() => setFormState({ mode: 'create' })}
          >
            <Plus aria-hidden="true" />
            Ajouter un anime
          </button>
        </div>
        {!isLoading && !errorMessage && (
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Rechercher un anime..."
            ariaLabel="Rechercher un anime par titre"
          />
        )}
        {isLoading && <p className="animes-page__status">Chargement...</p>}
        {!isLoading && errorMessage && (
          <p className="animes-page__status animes-page__status--error" role="alert">
            {errorMessage}
          </p>
        )}
        {!isLoading && !errorMessage && animes.length === 0 && (
          <EmptyState message="Aucun anime n'existe pour le moment." />
        )}
        {!isLoading && !errorMessage && animes.length > 0 && filteredAnimes.length === 0 && (
          <EmptyState message="Aucun anime ne correspond à ta recherche." />
        )}
        {!isLoading && !errorMessage && filteredAnimes.length > 0 && (
          <AnimeTable
            animes={filteredAnimes}
            incrementingAnimeId={incrementingAnimeId}
            onIncrementEpisode={handleIncrementEpisode}
            onEdit={(anime) => setFormState({ mode: 'edit', anime })}
            onDelete={(anime) => setAnimeToDelete(anime)}
          />
        )}
      </main>

      {formState && (
        <Modal
          title={formState.mode === 'create' ? 'Ajouter un anime' : 'Modifier un anime'}
          onClose={() => setFormState(null)}
        >
          <AnimeForm
            initialAnime={formState.mode === 'edit' ? formState.anime : null}
            onSubmit={handleFormSubmit}
            onCancel={() => setFormState(null)}
            isSubmitting={isSubmittingForm}
            errorMessage={formErrorMessage}
          />
        </Modal>
      )}

      {animeToDelete && (
        <ConfirmDialog
          title="Supprimer cet anime"
          message={`Es-tu sûr de vouloir supprimer "${animeToDelete.title}" ? Cette action est définitive.`}
          confirmLabel="Supprimer"
          isConfirming={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setAnimeToDelete(null)}
        />
      )}
    </div>
  )
}
