import { useState, type FormEvent } from 'react'
import { FormField } from '../FormField/FormField'
import { SelectField } from '../SelectField/SelectField'
import { PrimaryButton } from '../PrimaryButton/PrimaryButton'
import type {
  MangaSeason,
  MangaSeasonInput,
  MangaSeasonStatus,
} from '../../features/mangas/mangaSeasonsApi'
import './MangaSeasonForm.css'

const STATUS_OPTIONS: MangaSeasonStatus[] = ['En cours', 'Terminé', 'En pause']

interface MangaSeasonFormProps {
  initialSeason: MangaSeason | null
  defaultLabel: string
  onSubmit: (input: MangaSeasonInput) => void
  onCancel: () => void
  isSubmitting: boolean
  errorMessage: string | null
}

/**
 * Formulaire de création ou de modification d'une saison de manga. Le
 * mode (création ou édition) dépend de la présence d'une saison
 * initiale. Le libellé est un texte libre (ex. "Saison 2", "Tome
 * hors-série") : en création, un libellé par défaut est proposé, mais
 * reste entièrement modifiable. Ne réalise aucun appel réseau :
 * remonte les valeurs saisies au composant parent via onSubmit.
 */
export function MangaSeasonForm({
  initialSeason,
  defaultLabel,
  onSubmit,
  onCancel,
  isSubmitting,
  errorMessage,
}: MangaSeasonFormProps) {
  const [label, setLabel] = useState(initialSeason?.label ?? defaultLabel)
  const [chapters, setChapters] = useState(initialSeason?.chapters?.toString() ?? '')
  const [status, setStatus] = useState<MangaSeasonStatus>(initialSeason?.status ?? 'En cours')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    onSubmit({
      label: label.trim(),
      chapters: chapters.trim() === '' ? null : Number(chapters),
      status,
    })
  }

  return (
    <form className="manga-season-form" onSubmit={handleSubmit}>
      <FormField
        id="manga-season-label"
        label="Nom (saison, tome hors-série...)"
        type="text"
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        required
      />
      <FormField
        id="manga-season-chapters"
        label="Chapitres"
        type="number"
        min={0}
        value={chapters}
        onChange={(event) => setChapters(event.target.value)}
      />
      <SelectField
        id="manga-season-status"
        label="Statut"
        value={status}
        onChange={(event) => setStatus(event.target.value as MangaSeasonStatus)}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </SelectField>
      {errorMessage && (
        <p className="manga-season-form__error" role="alert">
          {errorMessage}
        </p>
      )}
      <div className="manga-season-form__actions">
        <button type="button" className="manga-season-form__cancel" onClick={onCancel}>
          Annuler
        </button>
        <PrimaryButton type="submit" className="manga-season-form__submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement...' : initialSeason ? 'Enregistrer' : 'Ajouter'}
        </PrimaryButton>
      </div>
    </form>
  )
}
