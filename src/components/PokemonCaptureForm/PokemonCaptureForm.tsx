import { useState, type FormEvent } from 'react'
import { FormField } from '../FormField/FormField'
import { SelectField } from '../SelectField/SelectField'
import { PrimaryButton } from '../PrimaryButton/PrimaryButton'
import type {
  PokemonCapture,
  PokemonCaptureInput,
  PokemonCaptureStatus,
} from '../../features/pokemon/pokemonCapturesApi'
import './PokemonCaptureForm.css'

const STATUS_OPTIONS: PokemonCaptureStatus[] = ['Vivant', 'Mort']

interface PokemonCaptureFormProps {
  initialCapture: PokemonCapture | null
  onSubmit: (input: PokemonCaptureInput) => void
  onCancel: () => void
  isSubmitting: boolean
  errorMessage: string | null
}

/**
 * Formulaire de création ou de modification d'un Pokémon capturé
 * (zone, Pokémon, statut) pour un jeu donné. Le mode (création ou
 * édition) dépend de la présence d'une capture initiale. Ne réalise
 * aucun appel réseau : remonte les valeurs saisies au composant parent
 * via onSubmit.
 */
export function PokemonCaptureForm({
  initialCapture,
  onSubmit,
  onCancel,
  isSubmitting,
  errorMessage,
}: PokemonCaptureFormProps) {
  const [zone, setZone] = useState(initialCapture?.zone ?? '')
  const [capturedPokemon, setCapturedPokemon] = useState(initialCapture?.capturedPokemon ?? '')
  const [status, setStatus] = useState<PokemonCaptureStatus>(initialCapture?.status ?? 'Vivant')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    onSubmit({
      zone: zone.trim(),
      capturedPokemon: capturedPokemon.trim(),
      status,
    })
  }

  return (
    <form className="pokemon-capture-form" onSubmit={handleSubmit}>
      <FormField
        id="pokemon-capture-zone"
        label="Zone"
        type="text"
        maxLength={100}
        value={zone}
        onChange={(event) => setZone(event.target.value)}
        required
      />
      <FormField
        id="pokemon-capture-name"
        label="Pokémon capturé"
        type="text"
        maxLength={50}
        value={capturedPokemon}
        onChange={(event) => setCapturedPokemon(event.target.value)}
        required
      />
      <SelectField
        id="pokemon-capture-status"
        label="Statut"
        value={status}
        onChange={(event) => setStatus(event.target.value as PokemonCaptureStatus)}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </SelectField>
      {errorMessage && (
        <p className="pokemon-capture-form__error" role="alert">
          {errorMessage}
        </p>
      )}
      <div className="pokemon-capture-form__actions">
        <button type="button" className="pokemon-capture-form__cancel" onClick={onCancel}>
          Annuler
        </button>
        <PrimaryButton
          type="submit"
          className="pokemon-capture-form__submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enregistrement...' : initialCapture ? 'Enregistrer' : 'Ajouter'}
        </PrimaryButton>
      </div>
    </form>
  )
}
