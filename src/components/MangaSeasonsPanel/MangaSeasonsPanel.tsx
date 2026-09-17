import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Modal } from '../Modal/Modal'
import { ConfirmDialog } from '../ConfirmDialog/ConfirmDialog'
import { EmptyState } from '../EmptyState/EmptyState'
import { MangaSeasonForm } from '../MangaSeasonForm/MangaSeasonForm'
import {
  createMangaSeason,
  deleteMangaSeason,
  fetchMangaSeasons,
  getNextMangaSeasonLabel,
  updateMangaSeason,
  type MangaSeason,
  type MangaSeasonInput,
} from '../../features/mangas/mangaSeasonsApi'
import './MangaSeasonsPanel.css'

interface MangaSeasonsPanelProps {
  mangaId: string
}

type FormState = { mode: 'create' } | { mode: 'edit'; season: MangaSeason } | null

/**
 * Panneau affiché lorsqu'une ligne de manga est dépliée dans le
 * tableau. Charge les saisons de ce manga depuis Supabase et permet
 * d'en ajouter, d'en modifier ou d'en supprimer, chaque saison portant
 * son propre libellé (texte libre : "Saison 2", "Tome hors-série"...),
 * son propre nombre de chapitres, son propre statut et ses propres
 * actions.
 */
export function MangaSeasonsPanel({ mangaId }: MangaSeasonsPanelProps) {
  const [seasons, setSeasons] = useState<MangaSeason[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [formState, setFormState] = useState<FormState>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null)

  const [seasonToDelete, setSeasonToDelete] = useState<MangaSeason | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [incrementingSeasonId, setIncrementingSeasonId] = useState<string | null>(null)

  /**
   * Recharge la liste des saisons de ce manga depuis Supabase et met
   * à jour l'état du panneau en conséquence.
   * @returns rien, la fonction agit uniquement par effet de bord (état du panneau)
   */
  async function refreshSeasons() {
    const { seasons: result, error } = await fetchMangaSeasons(mangaId)

    if (error) {
      setErrorMessage(error)
    } else {
      setSeasons(result)
      setErrorMessage(null)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    refreshSeasons()
  }, [mangaId])

  /**
   * Enregistre le formulaire d'ajout ou de modification : crée ou met
   * à jour la saison selon le mode actif, puis recharge la liste et
   * ferme la modale en cas de succès.
   * @param input valeurs saisies dans le formulaire
   * @returns rien, la fonction agit uniquement par effet de bord (état, réseau)
   */
  async function handleFormSubmit(input: MangaSeasonInput) {
    if (!formState) {
      return
    }

    setFormErrorMessage(null)
    setIsSubmitting(true)

    const { error } =
      formState.mode === 'create'
        ? await createMangaSeason(mangaId, input)
        : await updateMangaSeason(formState.season.id, input)

    setIsSubmitting(false)

    if (error) {
      setFormErrorMessage(error)
      return
    }

    setFormState(null)
    await refreshSeasons()
  }

  /**
   * Confirme la suppression de la saison sélectionnée, puis recharge
   * la liste et ferme la modale de confirmation en cas de succès.
   * @returns rien, la fonction agit uniquement par effet de bord (état, réseau)
   */
  async function handleConfirmDelete() {
    if (!seasonToDelete) {
      return
    }

    setIsDeleting(true)

    const { error } = await deleteMangaSeason(seasonToDelete.id)

    setIsDeleting(false)

    if (error) {
      setErrorMessage(error)
      return
    }

    setSeasonToDelete(null)
    await refreshSeasons()
  }

  /**
   * Ajoute un chapitre au compteur d'une saison, puis recharge la
   * liste.
   * @param season saison concernée par l'incrémentation
   * @returns rien, la fonction agit uniquement par effet de bord (état, réseau)
   */
  async function handleIncrementChapter(season: MangaSeason) {
    setIncrementingSeasonId(season.id)

    const { error } = await updateMangaSeason(season.id, { chapters: (season.chapters ?? 0) + 1 })

    setIncrementingSeasonId(null)

    if (error) {
      setErrorMessage(error)
      return
    }

    await refreshSeasons()
  }

  return (
    <div className="manga-seasons-panel">
      <div className="manga-seasons-panel__header">
        <span className="manga-seasons-panel__header-label">Saisons</span>
        <button
          type="button"
          className="manga-seasons-panel__add"
          onClick={() => {
            setFormErrorMessage(null)
            setFormState({ mode: 'create' })
          }}
          aria-label="Ajouter une saison"
        >
          <Plus aria-hidden="true" />
        </button>
      </div>

      {isLoading && <p className="manga-seasons-panel__status">Chargement...</p>}
      {!isLoading && errorMessage && (
        <p className="manga-seasons-panel__status manga-seasons-panel__status--error" role="alert">
          {errorMessage}
        </p>
      )}
      {!isLoading && !errorMessage && seasons.length === 0 && (
        <EmptyState message="Aucune saison n'existe pour ce manga." />
      )}
      {!isLoading && !errorMessage && seasons.length > 0 && (
        <ul className="manga-seasons-panel__list">
          {seasons.map((season) => (
            <li key={season.id} className="manga-seasons-panel__row">
              <span className="manga-seasons-panel__season-name">{season.label}</span>
              <span className="manga-seasons-panel__chapters">
                {season.chapters ?? '-'} chapitre{(season.chapters ?? 0) > 1 ? 's' : ''}
              </span>
              <span className="manga-seasons-panel__status-badge">{season.status}</span>
              <div className="manga-seasons-panel__actions">
                <button
                  type="button"
                  className="manga-seasons-panel__action"
                  aria-label={`Ajouter un chapitre à ${season.label}`}
                  disabled={incrementingSeasonId === season.id}
                  onClick={() => handleIncrementChapter(season)}
                >
                  <Plus aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="manga-seasons-panel__action"
                  aria-label={`Modifier ${season.label}`}
                  onClick={() => {
                    setFormErrorMessage(null)
                    setFormState({ mode: 'edit', season })
                  }}
                >
                  <Pencil aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="manga-seasons-panel__action manga-seasons-panel__action--danger"
                  aria-label={`Supprimer ${season.label}`}
                  onClick={() => setSeasonToDelete(season)}
                >
                  <Trash2 aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {formState && (
        <Modal
          title={formState.mode === 'create' ? 'Ajouter une saison' : 'Modifier cette saison'}
          onClose={() => setFormState(null)}
        >
          <MangaSeasonForm
            initialSeason={formState.mode === 'edit' ? formState.season : null}
            defaultLabel={getNextMangaSeasonLabel(seasons)}
            onSubmit={handleFormSubmit}
            onCancel={() => setFormState(null)}
            isSubmitting={isSubmitting}
            errorMessage={formErrorMessage}
          />
        </Modal>
      )}

      {seasonToDelete && (
        <ConfirmDialog
          title="Supprimer cette saison"
          message={`Es-tu sûr de vouloir supprimer "${seasonToDelete.label}" ? Cette action est définitive.`}
          confirmLabel="Supprimer"
          isConfirming={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setSeasonToDelete(null)}
        />
      )}
    </div>
  )
}
