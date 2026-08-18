import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Navbar } from '../../components/Navbar/Navbar'
import { MangaTable } from '../../components/MangaTable/MangaTable'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { SearchBar } from '../../components/SearchBar/SearchBar'
import { Modal } from '../../components/Modal/Modal'
import { MangaForm } from '../../components/MangaForm/MangaForm'
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog'
import {
  createManga,
  deleteManga,
  fetchMangas,
  filterMangasByTitle,
  updateManga,
  type Manga,
  type MangaInput,
} from '../../features/mangas/mangasApi'
import './MangaPage.css'

type FormState = { mode: 'create' } | { mode: 'edit'; manga: Manga } | null

/**
 * Page listant les mangas de l'utilisateur connecté. Récupère la liste
 * depuis Supabase au chargement de la page, permet de la filtrer par
 * titre, et propose la création, la modification, la suppression et
 * l'incrémentation rapide du nombre de chapitres.
 */
export function MangaPage() {
  const [mangas, setMangas] = useState<Manga[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [formState, setFormState] = useState<FormState>(null)
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null)

  const [mangaToDelete, setMangaToDelete] = useState<Manga | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [incrementingMangaId, setIncrementingMangaId] = useState<string | null>(null)

  /**
   * Recharge la liste des mangas depuis Supabase et met à jour l'état
   * de la page en conséquence.
   * @returns rien, la fonction agit uniquement par effet de bord (état de la page)
   */
  async function refreshMangas() {
    const { mangas: result, error } = await fetchMangas()

    if (error) {
      setErrorMessage(error)
    } else {
      setMangas(result)
      setErrorMessage(null)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    refreshMangas()
  }, [])

  const filteredMangas = useMemo(
    () => filterMangasByTitle(mangas, searchQuery),
    [mangas, searchQuery],
  )

  /**
   * Enregistre le formulaire d'ajout ou de modification : crée ou met
   * à jour le manga selon le mode actif, puis recharge la liste et
   * ferme la modale en cas de succès.
   * @param input valeurs saisies dans le formulaire
   * @returns rien, la fonction agit uniquement par effet de bord (état, réseau)
   */
  async function handleFormSubmit(input: MangaInput) {
    if (!formState) {
      return
    }

    setFormErrorMessage(null)
    setIsSubmittingForm(true)

    const { error } =
      formState.mode === 'create'
        ? await createManga(input)
        : await updateManga(formState.manga.id, input)

    setIsSubmittingForm(false)

    if (error) {
      setFormErrorMessage(error)
      return
    }

    setFormState(null)
    await refreshMangas()
  }

  /**
   * Confirme la suppression du manga sélectionné, puis recharge la
   * liste et ferme la modale de confirmation en cas de succès.
   * @returns rien, la fonction agit uniquement par effet de bord (état, réseau)
   */
  async function handleConfirmDelete() {
    if (!mangaToDelete) {
      return
    }

    setIsDeleting(true)

    const { error } = await deleteManga(mangaToDelete.id)

    setIsDeleting(false)

    if (error) {
      setErrorMessage(error)
      return
    }

    setMangaToDelete(null)
    await refreshMangas()
  }

  /**
   * Ajoute un chapitre au compteur d'un manga, puis recharge la liste.
   * @param manga manga concerné par l'incrémentation
   * @returns rien, la fonction agit uniquement par effet de bord (état, réseau)
   */
  async function handleIncrementChapter(manga: Manga) {
    setIncrementingMangaId(manga.id)

    const { error } = await updateManga(manga.id, { chapters: (manga.chapters ?? 0) + 1 })

    setIncrementingMangaId(null)

    if (error) {
      setErrorMessage(error)
      return
    }

    await refreshMangas()
  }

  return (
    <div className="manga-page">
      <Navbar />
      <main className="manga-page__content">
        <div className="manga-page__header">
          <h1 className="manga-page__title">Mangas</h1>
          <button
            type="button"
            className="manga-page__add"
            onClick={() => setFormState({ mode: 'create' })}
          >
            <Plus aria-hidden="true" />
            Ajouter un manga
          </button>
        </div>
        {!isLoading && !errorMessage && (
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Rechercher un manga..."
            ariaLabel="Rechercher un manga par titre"
          />
        )}
        {isLoading && <p className="manga-page__status">Chargement...</p>}
        {!isLoading && errorMessage && (
          <p className="manga-page__status manga-page__status--error" role="alert">
            {errorMessage}
          </p>
        )}
        {!isLoading && !errorMessage && mangas.length === 0 && (
          <EmptyState message="Aucun manga n'existe pour le moment." />
        )}
        {!isLoading && !errorMessage && mangas.length > 0 && filteredMangas.length === 0 && (
          <EmptyState message="Aucun manga ne correspond à ta recherche." />
        )}
        {!isLoading && !errorMessage && filteredMangas.length > 0 && (
          <MangaTable
            mangas={filteredMangas}
            incrementingMangaId={incrementingMangaId}
            onIncrementChapter={handleIncrementChapter}
            onEdit={(manga) => setFormState({ mode: 'edit', manga })}
            onDelete={(manga) => setMangaToDelete(manga)}
          />
        )}
      </main>

      {formState && (
        <Modal
          title={formState.mode === 'create' ? 'Ajouter un manga' : 'Modifier un manga'}
          onClose={() => setFormState(null)}
        >
          <MangaForm
            initialManga={formState.mode === 'edit' ? formState.manga : null}
            onSubmit={handleFormSubmit}
            onCancel={() => setFormState(null)}
            isSubmitting={isSubmittingForm}
            errorMessage={formErrorMessage}
          />
        </Modal>
      )}

      {mangaToDelete && (
        <ConfirmDialog
          title="Supprimer ce manga"
          message={`Es-tu sûr de vouloir supprimer "${mangaToDelete.title}" ? Cette action est définitive.`}
          confirmLabel="Supprimer"
          isConfirming={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setMangaToDelete(null)}
        />
      )}
    </div>
  )
}
