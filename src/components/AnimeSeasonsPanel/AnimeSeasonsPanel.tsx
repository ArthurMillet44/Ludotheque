import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Modal } from '../Modal/Modal'
import { ConfirmDialog } from '../ConfirmDialog/ConfirmDialog'
import { EmptyState } from '../EmptyState/EmptyState'
import { AnimeSeasonForm } from '../AnimeSeasonForm/AnimeSeasonForm'
import {
  createAnimeSeason,
  deleteAnimeSeason,
  fetchAnimeSeasons,
  getNextAnimeSeasonLabel,
  updateAnimeSeason,
  type AnimeSeason,
  type AnimeSeasonInput,
} from '../../features/animes/animeSeasonsApi'
import './AnimeSeasonsPanel.css'

interface AnimeSeasonsPanelProps {
  animeId: string
}

type FormState = { mode: 'create' } | { mode: 'edit'; season: AnimeSeason } | null

/**
 * Panneau affiché lorsqu'une ligne d'anime est dépliée dans le
 * tableau. Charge les saisons de cet anime depuis Supabase et permet
 * d'en ajouter, d'en modifier ou d'en supprimer, chaque saison portant
 * son propre libellé (texte libre : "Saison 2", "Film", "OAV"...), son
 * propre nombre d'épisodes, son propre statut et ses propres actions.
 */
export function AnimeSeasonsPanel({ animeId }: AnimeSeasonsPanelProps) {
  const [seasons, setSeasons] = useState<AnimeSeason[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [formState, setFormState] = useState<FormState>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null)

  const [seasonToDelete, setSeasonToDelete] = useState<AnimeSeason | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [incrementingSeasonId, setIncrementingSeasonId] = useState<string | null>(null)

  /**
   * Recharge la liste des saisons de cet anime depuis Supabase et met
   * à jour l'état du panneau en conséquence.
   * @returns rien, la fonction agit uniquement par effet de bord (état du panneau)
   */
  async function refreshSeasons() {
    const { seasons: result, error } = await fetchAnimeSeasons(animeId)

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
  }, [animeId])

  /**
   * Enregistre le formulaire d'ajout ou de modification : crée ou met
   * à jour la saison selon le mode actif, puis recharge la liste et
   * ferme la modale en cas de succès.
   * @param input valeurs saisies dans le formulaire
   * @returns rien, la fonction agit uniquement par effet de bord (état, réseau)
   */
  async function handleFormSubmit(input: AnimeSeasonInput) {
    if (!formState) {
      return
    }

    setFormErrorMessage(null)
    setIsSubmitting(true)

    const { error } =
      formState.mode === 'create'
        ? await createAnimeSeason(animeId, input)
        : await updateAnimeSeason(formState.season.id, input)

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

    const { error } = await deleteAnimeSeason(seasonToDelete.id)

    setIsDeleting(false)

    if (error) {
      setErrorMessage(error)
      return
    }

    setSeasonToDelete(null)
    await refreshSeasons()
  }

  /**
   * Ajoute un épisode au compteur d'une saison, puis recharge la
   * liste.
   * @param season saison concernée par l'incrémentation
   * @returns rien, la fonction agit uniquement par effet de bord (état, réseau)
   */
  async function handleIncrementEpisode(season: AnimeSeason) {
    setIncrementingSeasonId(season.id)

    const { error } = await updateAnimeSeason(season.id, { episodes: (season.episodes ?? 0) + 1 })

    setIncrementingSeasonId(null)

    if (error) {
      setErrorMessage(error)
      return
    }

    await refreshSeasons()
  }

  return (
    <div className="anime-seasons-panel">
      <div className="anime-seasons-panel__header">
        <span className="anime-seasons-panel__header-label">Saisons</span>
        <button
          type="button"
          className="anime-seasons-panel__add"
          onClick={() => {
            setFormErrorMessage(null)
            setFormState({ mode: 'create' })
          }}
          aria-label="Ajouter une saison"
        >
          <Plus aria-hidden="true" />
        </button>
      </div>

      {isLoading && <p className="anime-seasons-panel__status">Chargement...</p>}
      {!isLoading && errorMessage && (
        <p className="anime-seasons-panel__status anime-seasons-panel__status--error" role="alert">
          {errorMessage}
        </p>
      )}
      {!isLoading && !errorMessage && seasons.length === 0 && (
        <EmptyState message="Aucune saison n'existe pour cet anime." />
      )}
      {!isLoading && !errorMessage && seasons.length > 0 && (
        <ul className="anime-seasons-panel__list">
          {seasons.map((season) => (
            <li key={season.id} className="anime-seasons-panel__row">
              <span className="anime-seasons-panel__season-name">{season.label}</span>
              <span className="anime-seasons-panel__episodes">
                {season.episodes ?? '-'} épisode{(season.episodes ?? 0) > 1 ? 's' : ''}
              </span>
              <span className="anime-seasons-panel__status-badge">{season.status}</span>
              <div className="anime-seasons-panel__actions">
                <button
                  type="button"
                  className="anime-seasons-panel__action"
                  aria-label={`Ajouter un épisode à ${season.label}`}
                  disabled={incrementingSeasonId === season.id}
                  onClick={() => handleIncrementEpisode(season)}
                >
                  <Plus aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="anime-seasons-panel__action"
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
                  className="anime-seasons-panel__action anime-seasons-panel__action--danger"
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
          <AnimeSeasonForm
            initialSeason={formState.mode === 'edit' ? formState.season : null}
            defaultLabel={getNextAnimeSeasonLabel(seasons)}
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
