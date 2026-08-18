import { useState, type FormEvent } from 'react'
import { FormField } from '../FormField/FormField'
import { PrimaryButton } from '../PrimaryButton/PrimaryButton'
import type { SkyrimMod, SkyrimModInput } from '../../features/skyrim/skyrimModsApi'
import './SkyrimModForm.css'

interface SkyrimModFormProps {
  initialMod: SkyrimMod | null
  onSubmit: (input: SkyrimModInput) => void
  onCancel: () => void
  isSubmitting: boolean
  errorMessage: string | null
}

/**
 * Formulaire de création ou de modification d'un mod Skyrim (nom,
 * version, catégorie, ordre de déploiement) pour un modpack donné. Le
 * mode (création ou édition) dépend de la présence d'un mod initial.
 * Ne réalise aucun appel réseau : remonte les valeurs saisies au
 * composant parent via onSubmit.
 */
export function SkyrimModForm({
  initialMod,
  onSubmit,
  onCancel,
  isSubmitting,
  errorMessage,
}: SkyrimModFormProps) {
  const [modName, setModName] = useState(initialMod?.modName ?? '')
  const [version, setVersion] = useState(initialMod?.version ?? '')
  const [category, setCategory] = useState(initialMod?.category ?? '')
  const [deployOrder, setDeployOrder] = useState(initialMod?.deployOrder?.toString() ?? '')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    onSubmit({
      modName: modName.trim(),
      version: version.trim() === '' ? null : version.trim(),
      category: category.trim() === '' ? null : category.trim(),
      deployOrder: Number(deployOrder),
    })
  }

  return (
    <form className="skyrim-mod-form" onSubmit={handleSubmit}>
      <FormField
        id="skyrim-mod-name"
        label="Nom du mod"
        type="text"
        maxLength={100}
        value={modName}
        onChange={(event) => setModName(event.target.value)}
        required
      />
      <FormField
        id="skyrim-mod-version"
        label="Version"
        type="text"
        maxLength={50}
        value={version}
        onChange={(event) => setVersion(event.target.value)}
      />
      <FormField
        id="skyrim-mod-category"
        label="Catégorie"
        type="text"
        maxLength={50}
        value={category}
        onChange={(event) => setCategory(event.target.value)}
      />
      <FormField
        id="skyrim-mod-deploy-order"
        label="Ordre de déploiement"
        type="number"
        min={0}
        value={deployOrder}
        onChange={(event) => setDeployOrder(event.target.value)}
        required
      />
      {errorMessage && (
        <p className="skyrim-mod-form__error" role="alert">
          {errorMessage}
        </p>
      )}
      <div className="skyrim-mod-form__actions">
        <button type="button" className="skyrim-mod-form__cancel" onClick={onCancel}>
          Annuler
        </button>
        <PrimaryButton type="submit" className="skyrim-mod-form__submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement...' : initialMod ? 'Enregistrer' : 'Ajouter'}
        </PrimaryButton>
      </div>
    </form>
  )
}
