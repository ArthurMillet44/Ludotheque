import { useState, type FormEvent } from 'react'
import { FormField } from '../FormField/FormField'
import { SelectField } from '../SelectField/SelectField'
import { PrimaryButton } from '../PrimaryButton/PrimaryButton'
import type {
  AnimeSeason,
  AnimeSeasonInput,
  AnimeSeasonStatus,
} from '../../features/animes/animeSeasonsApi'
import './AnimeSeasonForm.css'

const STATUS_OPTIONS: AnimeSeasonStatus[] = ['En cours', 'Terminé', 'En pause']

interface AnimeSeasonFormProps {
  initialSeason: AnimeSeason | null
  defaultLabel: string
  onSubmit: (input: AnimeSeasonInput) => void
  onCancel: () => void
  isSubmitting: boolean
  errorMessage: string | null
}

/**
 * Formulaire de création ou de modification d'une saison d'anime. Le
 * mode (création ou édition) dépend de la présence d'une saison
 * initiale. Le libellé est un texte libre (ex. "Saison 2", "Film",
 * "OAV") : en création, un libellé par défaut est proposé, mais reste
 * entièrement modifiable. Ne réalise aucun appel réseau : remonte les
 * valeurs saisies au composant parent via onSubmit.
 */
export function AnimeSeasonForm({
  initialSeason,
  defaultLabel,
  onSubmit,
  onCancel,
  isSubmitting,
  errorMessage,
}: AnimeSeasonFormProps) {
  const [label, setLabel] = useState(initialSeason?.label ?? defaultLabel)
  const [episodes, setEpisodes] = useState(initialSeason?.episodes?.toString() ?? '')
  const [status, setStatus] = useState<AnimeSeasonStatus>(initialSeason?.status ?? 'En cours')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    onSubmit({
      label: label.trim(),
      episodes: episodes.trim() === '' ? null : Number(episodes),
      status,
    })
  }

  return (
    <form className="anime-season-form" onSubmit={handleSubmit}>
      <FormField
        id="anime-season-label"
        label="Nom (saison, film, OAV...)"
        type="text"
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        required
      />
      <FormField
        id="anime-season-episodes"
        label="Épisodes"
        type="number"
        min={0}
        value={episodes}
        onChange={(event) => setEpisodes(event.target.value)}
      />
      <SelectField
        id="anime-season-status"
        label="Statut"
        value={status}
        onChange={(event) => setStatus(event.target.value as AnimeSeasonStatus)}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </SelectField>
      {errorMessage && (
        <p className="anime-season-form__error" role="alert">
          {errorMessage}
        </p>
      )}
      <div className="anime-season-form__actions">
        <button type="button" className="anime-season-form__cancel" onClick={onCancel}>
          Annuler
        </button>
        <PrimaryButton type="submit" className="anime-season-form__submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement...' : initialSeason ? 'Enregistrer' : 'Ajouter'}
        </PrimaryButton>
      </div>
    </form>
  )
}
