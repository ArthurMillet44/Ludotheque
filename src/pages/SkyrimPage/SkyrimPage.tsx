import { useEffect, useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { Navbar } from '../../components/Navbar/Navbar'
import { Modal } from '../../components/Modal/Modal'
import { FormField } from '../../components/FormField/FormField'
import { PrimaryButton } from '../../components/PrimaryButton/PrimaryButton'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog'
import { SkyrimModpackCard } from '../../components/SkyrimModpackCard/SkyrimModpackCard'
import {
  createSkyrimModpack,
  deleteSkyrimModpack,
  fetchSkyrimModpacks,
  updateSkyrimModpack,
  type SkyrimModpack,
} from '../../features/skyrim/skyrimApi'
import './SkyrimPage.css'

type FormState = { mode: 'create' } | { mode: 'edit'; modpack: SkyrimModpack } | null

/**
 * Page de suivi des modpacks Skyrim de l'utilisateur connecté. Affiche
 * les modpacks existants sous forme de cartes, et permet d'en
 * ajouter, d'en renommer ou d'en supprimer avec confirmation.
 */
export function SkyrimPage() {
  const [modpacks, setModpacks] = useState<SkyrimModpack[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [formState, setFormState] = useState<FormState>(null)
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null)

  const [modpackToDelete, setModpackToDelete] = useState<SkyrimModpack | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  /**
   * Recharge la liste des modpacks Skyrim depuis Supabase et met à
   * jour l'état de la page en conséquence.
   * @returns rien, la fonction agit uniquement par effet de bord (état de la page)
   */
  async function refreshModpacks() {
    const { modpacks: result, error } = await fetchSkyrimModpacks()

    if (error) {
      setErrorMessage(error)
    } else {
      setModpacks(result)
      setErrorMessage(null)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    refreshModpacks()
  }, [])

  /**
   * Ouvre la modale d'ajout avec un champ nom vide.
   * @returns rien, la fonction agit uniquement par effet de bord (état de la page)
   */
  function openCreateForm() {
    setName('')
    setFormErrorMessage(null)
    setFormState({ mode: 'create' })
  }

  /**
   * Ouvre la modale de modification avec le nom actuel du modpack.
   * @param modpack modpack à modifier
   * @returns rien, la fonction agit uniquement par effet de bord (état de la page)
   */
  function openEditForm(modpack: SkyrimModpack) {
    setName(modpack.name)
    setFormErrorMessage(null)
    setFormState({ mode: 'edit', modpack })
  }

  /**
   * Crée ou met à jour un modpack Skyrim selon le mode actif, recharge
   * la liste, puis ferme la modale en cas de succès.
   * @param event événement de soumission du formulaire
   * @returns rien, la fonction agit uniquement par effet de bord (état, réseau)
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!formState) {
      return
    }

    setFormErrorMessage(null)
    setIsSubmitting(true)

    const trimmedName = name.trim()
    const { error } =
      formState.mode === 'create'
        ? await createSkyrimModpack(trimmedName)
        : await updateSkyrimModpack(formState.modpack.id, trimmedName)

    setIsSubmitting(false)

    if (error) {
      setFormErrorMessage(error)
      return
    }

    setFormState(null)
    await refreshModpacks()
  }

  /**
   * Confirme la suppression du modpack sélectionné, puis recharge la
   * liste et ferme la modale de confirmation en cas de succès.
   * @returns rien, la fonction agit uniquement par effet de bord (état, réseau)
   */
  async function handleConfirmDelete() {
    if (!modpackToDelete) {
      return
    }

    setIsDeleting(true)

    const { error } = await deleteSkyrimModpack(modpackToDelete.id)

    setIsDeleting(false)

    if (error) {
      setErrorMessage(error)
      return
    }

    setModpackToDelete(null)
    await refreshModpacks()
  }

  return (
    <div className="skyrim-page">
      <Navbar />
      <main className="skyrim-page__content">
        <div className="skyrim-page__header">
          <h1 className="skyrim-page__title">Skyrim</h1>
          <button type="button" className="skyrim-page__add" onClick={openCreateForm}>
            <Plus aria-hidden="true" />
            Ajouter un modpack
          </button>
        </div>
        {isLoading && <p className="skyrim-page__status">Chargement...</p>}
        {!isLoading && errorMessage && (
          <p className="skyrim-page__status skyrim-page__status--error" role="alert">
            {errorMessage}
          </p>
        )}
        {!isLoading && !errorMessage && modpacks.length === 0 && (
          <EmptyState message="Aucun modpack n'existe pour le moment." />
        )}
        {!isLoading && !errorMessage && modpacks.length > 0 && (
          <div className="skyrim-page__grid">
            {modpacks.map((modpack) => (
              <SkyrimModpackCard
                key={modpack.id}
                modpack={modpack}
                onEdit={openEditForm}
                onDelete={(selectedModpack) => setModpackToDelete(selectedModpack)}
              />
            ))}
          </div>
        )}
      </main>

      {formState && (
        <Modal
          title={formState.mode === 'create' ? 'Ajouter un modpack' : 'Modifier un modpack'}
          onClose={() => setFormState(null)}
        >
          <form className="skyrim-page__form" onSubmit={handleSubmit}>
            <FormField
              id="skyrim-modpack-name"
              label="Nom du modpack"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            {formErrorMessage && (
              <p className="skyrim-page__form-error" role="alert">
                {formErrorMessage}
              </p>
            )}
            <div className="skyrim-page__form-actions">
              <button
                type="button"
                className="skyrim-page__form-cancel"
                onClick={() => setFormState(null)}
              >
                Annuler
              </button>
              <PrimaryButton
                type="submit"
                className="skyrim-page__form-submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Enregistrement...'
                  : formState.mode === 'create'
                    ? 'Ajouter'
                    : 'Enregistrer'}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}

      {modpackToDelete && (
        <ConfirmDialog
          title="Supprimer ce modpack"
          message={`Es-tu sûr de vouloir supprimer "${modpackToDelete.name}" ? Cette action est définitive.`}
          confirmLabel="Supprimer"
          isConfirming={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setModpackToDelete(null)}
        />
      )}
    </div>
  )
}
