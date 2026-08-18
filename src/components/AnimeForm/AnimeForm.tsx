import { useState, type FormEvent } from 'react'
import { FormField } from '../FormField/FormField'
import { SelectField } from '../SelectField/SelectField'
import { PrimaryButton } from '../PrimaryButton/PrimaryButton'
import type { Anime, AnimeInput, AnimeStatus } from '../../features/animes/animesApi'
import './AnimeForm.css'

const STATUS_OPTIONS: AnimeStatus[] = ['En cours', 'Terminé', 'En pause']

interface AnimeFormProps {
  initialAnime: Anime | null
  onSubmit: (input: AnimeInput) => void
  onCancel: () => void
  isSubmitting: boolean
  errorMessage: string | null
}

/**
 * Formulaire de création ou de modification d'un anime. Le mode
 * (création ou édition) dépend de la présence d'un anime initial.
 * Ne réalise aucun appel réseau : remonte les valeurs saisies au
 * composant parent via onSubmit.
 */
export function AnimeForm({
  initialAnime,
  onSubmit,
  onCancel,
  isSubmitting,
  errorMessage,
}: AnimeFormProps) {
  const [title, setTitle] = useState(initialAnime?.title ?? '')
  const [episodes, setEpisodes] = useState(initialAnime?.episodes?.toString() ?? '')
  const [status, setStatus] = useState<AnimeStatus>(initialAnime?.status ?? 'En cours')
  const [currentSeason, setCurrentSeason] = useState(initialAnime?.currentSeason?.toString() ?? '')
  const [comment, setComment] = useState(initialAnime?.comment ?? '')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    onSubmit({
      title: title.trim(),
      episodes: episodes.trim() === '' ? null : Number(episodes),
      status,
      currentSeason: currentSeason.trim() === '' ? null : Number(currentSeason),
      comment: comment.trim() === '' ? null : comment.trim(),
    })
  }

  return (
    <form className="anime-form" onSubmit={handleSubmit}>
      <FormField
        id="anime-title"
        label="Titre"
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
      />
      <FormField
        id="anime-episodes"
        label="Épisodes"
        type="number"
        min={0}
        value={episodes}
        onChange={(event) => setEpisodes(event.target.value)}
      />
      <SelectField
        id="anime-status"
        label="Statut"
        value={status}
        onChange={(event) => setStatus(event.target.value as AnimeStatus)}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </SelectField>
      <FormField
        id="anime-season"
        label="Saison en cours"
        type="number"
        min={0}
        value={currentSeason}
        onChange={(event) => setCurrentSeason(event.target.value)}
      />
      <FormField
        id="anime-comment"
        label="Commentaire"
        type="text"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
      />
      {errorMessage && (
        <p className="anime-form__error" role="alert">
          {errorMessage}
        </p>
      )}
      <div className="anime-form__actions">
        <button type="button" className="anime-form__cancel" onClick={onCancel}>
          Annuler
        </button>
        <PrimaryButton type="submit" className="anime-form__submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement...' : initialAnime ? 'Enregistrer' : 'Ajouter'}
        </PrimaryButton>
      </div>
    </form>
  )
}
