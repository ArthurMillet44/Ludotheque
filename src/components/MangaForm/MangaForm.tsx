import { useState, type FormEvent } from 'react'
import { FormField } from '../FormField/FormField'
import { SelectField } from '../SelectField/SelectField'
import { PrimaryButton } from '../PrimaryButton/PrimaryButton'
import type { Manga, MangaInput, MangaStatus } from '../../features/mangas/mangasApi'
import './MangaForm.css'

const STATUS_OPTIONS: MangaStatus[] = ['En cours', 'Terminé', 'En pause']

interface MangaFormProps {
  initialManga: Manga | null
  onSubmit: (input: MangaInput) => void
  onCancel: () => void
  isSubmitting: boolean
  errorMessage: string | null
}

/**
 * Formulaire de création ou de modification d'un manga. Le mode
 * (création ou édition) dépend de la présence d'un manga initial.
 * Ne réalise aucun appel réseau : remonte les valeurs saisies au
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
  const [chapters, setChapters] = useState(initialManga?.chapters?.toString() ?? '')
  const [chaptersEn, setChaptersEn] = useState(initialManga?.chaptersEn?.toString() ?? '')
  const [status, setStatus] = useState<MangaStatus>(initialManga?.status ?? 'En cours')
  const [currentSeason, setCurrentSeason] = useState(initialManga?.currentSeason?.toString() ?? '')
  const [comment, setComment] = useState(initialManga?.comment ?? '')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    onSubmit({
      title: title.trim(),
      chapters: chapters.trim() === '' ? null : Number(chapters),
      chaptersEn: chaptersEn.trim() === '' ? null : Number(chaptersEn),
      status,
      currentSeason: currentSeason.trim() === '' ? null : Number(currentSeason),
      comment: comment.trim() === '' ? null : comment.trim(),
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
      <FormField
        id="manga-chapters"
        label="Chapitres"
        type="number"
        min={0}
        value={chapters}
        onChange={(event) => setChapters(event.target.value)}
      />
      <FormField
        id="manga-chapters-en"
        label="Chapitres en anglais"
        type="number"
        min={0}
        value={chaptersEn}
        onChange={(event) => setChaptersEn(event.target.value)}
      />
      <SelectField
        id="manga-status"
        label="Statut"
        value={status}
        onChange={(event) => setStatus(event.target.value as MangaStatus)}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </SelectField>
      <FormField
        id="manga-season"
        label="Saison en cours"
        type="number"
        min={0}
        value={currentSeason}
        onChange={(event) => setCurrentSeason(event.target.value)}
      />
      <FormField
        id="manga-comment"
        label="Commentaire"
        type="text"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
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
