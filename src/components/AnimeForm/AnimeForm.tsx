import { useState, type FormEvent } from 'react'
import { FormField } from '../FormField/FormField'
import { PrimaryButton } from '../PrimaryButton/PrimaryButton'
import type { Anime, AnimeInput } from '../../features/animes/animesApi'
import './AnimeForm.css'

interface AnimeFormProps {
  initialAnime: Anime | null
  onSubmit: (input: AnimeInput) => void
  onCancel: () => void
  isSubmitting: boolean
  errorMessage: string | null
}

/**
 * Formulaire de création ou de modification d'un anime. Le mode
 * (création ou édition) dépend de la présence d'un anime initial. Ne
 * porte que le titre : le nombre d'épisodes, le statut et la saison
 * sont désormais gérés saison par saison (voir AnimeSeasonForm). Ne
 * réalise aucun appel réseau : remonte les valeurs saisies au
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    onSubmit({
      title: title.trim(),
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
