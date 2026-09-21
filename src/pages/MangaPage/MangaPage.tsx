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
import { fetchMangaChapterTotals } from '../../features/mangas/mangaSeasonsApi'
import './MangaPage.css'

type FormState = { mode: 'create' } | { mode: 'edit'; manga: Manga } | null

/**
 * Page listant les mangas de l'utilisateur connecté. Récupère la liste
 * depuis Supabase au chargement de la page, permet de la filtrer par
 * titre, et propose la création, la modification et la suppression
 * d'un manga. Le nombre de chapitres, le statut et les actions liées
 * sont gérés saison par saison en dépliant une ligne du tableau (voir
 * MangaTable et MangaSeasonsPanel). Le nombre total de chapitres affiché à
 * côté de chaque titre (chapterTotals) est recalculé à la volée depuis les
 * saisons existantes, jamais stocké en base.
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

  const [chapterTotals, setChapterTotals] = useState<Record<string, number>>({})

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

  /**
   * Recalcule le nombre total de chapitres par manga (toutes saisons
   * confondues) depuis Supabase. Cette somme n'est jamais stockée en base,
   * juste recalculée à la volée à chaque appel.
   * @returns rien, la fonction agit uniquement par effet de bord (état de la page)
   */
  async function refreshChapterTotals() {
    const { totals, error } = await fetchMangaChapterTotals()

    if (!error) {
      setChapterTotals(totals)
    }
  }

  useEffect(() => {
    refreshMangas()
    refreshChapterTotals()
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
            chapterTotals={chapterTotals}
            onEdit={(manga) => setFormState({ mode: 'edit', manga })}
            onDelete={(manga) => setMangaToDelete(manga)}
            onSeasonsChanged={refreshChapterTotals}
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
