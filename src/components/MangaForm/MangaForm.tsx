import { useState, type FormEvent } from 'react'
import { FormField } from '../FormField/FormField'
import { PrimaryButton } from '../PrimaryButton/PrimaryButton'
import type { Manga, MangaInput } from '../../features/mangas/mangasApi'
import './MangaForm.css'

interface MangaFormProps {
  initialManga: Manga | null
  onSubmit: (input: MangaInput) => void
  onCancel: () => void
  isSubmitting: boolean
  errorMessage: string | null
}

/**
 * Formulaire de création ou de modification d'un manga. Le mode
 * (création ou édition) dépend de la présence d'un manga initial. Ne
 * porte que le titre : le nombre de chapitres, le statut et la saison
 * sont désormais gérés saison par saison (voir MangaSeasonForm). Ne
 * réalise aucun appel réseau : remonte les valeurs saisies au
 * composant parent via onSubmit.
 */
export function MangaForm({
  initialManga,
  onSubmit,
  onCancel,
  isSubmitting,
  errorMessage,
}: MangaFormProps) {
  const [title, setTitle] = useState(initialManga?.title ?? '')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    onSubmit({
      title: title.trim(),
    })
  }

  return (
    <form className="manga-form" onSubmit={handleSubmit}>
      <FormField
        id="manga-title"
        label="Titre"
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
      />
      {errorMessage && (
        <p className="manga-form__error" role="alert">
          {errorMessage}
        </p>
      )}
      <div className="manga-form__actions">
        <button type="button" className="manga-form__cancel" onClick={onCancel}>
          Annuler
        </button>
        <PrimaryButton type="submit" className="manga-form__submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement...' : initialManga ? 'Enregistrer' : 'Ajouter'}
        </PrimaryButton>
      </div>
    </form>
  )
}
