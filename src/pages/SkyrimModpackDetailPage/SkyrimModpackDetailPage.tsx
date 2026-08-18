import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Navbar } from '../../components/Navbar/Navbar'
import { Modal } from '../../components/Modal/Modal'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { SearchBar } from '../../components/SearchBar/SearchBar'
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog'
import { SkyrimModTable } from '../../components/SkyrimModTable/SkyrimModTable'
import { SkyrimModForm } from '../../components/SkyrimModForm/SkyrimModForm'
import { fetchSkyrimModpackById, type SkyrimModpack } from '../../features/skyrim/skyrimApi'
import {
  createSkyrimMod,
  deleteSkyrimMod,
  fetchSkyrimMods,
  filterSkyrimMods,
  updateSkyrimMod,
  type SkyrimMod,
  type SkyrimModInput,
} from '../../features/skyrim/skyrimModsApi'
import './SkyrimModpackDetailPage.css'

type FormState = { mode: 'create' } | { mode: 'edit'; mod: SkyrimMod } | null

/**
 * Page de détail d'un modpack Skyrim, accessible en cliquant sur sa
 * carte depuis la page Skyrim. Volontairement absente de la Navbar :
 * elle n'est atteignable que depuis sa carte. Affiche les mods
 * installés pour ce modpack, et permet d'en ajouter, d'en modifier ou
 * d'en supprimer avec confirmation.
 */
export function SkyrimModpackDetailPage() {
  const { id } = useParams<{ id: string }>()

  const [modpack, setModpack] = useState<SkyrimModpack | null>(null)
  const [isLoadingModpack, setIsLoadingModpack] = useState(true)
  const [modpackErrorMessage, setModpackErrorMessage] = useState<string | null>(null)

  const [mods, setMods] = useState<SkyrimMod[]>([])
  const [isLoadingMods, setIsLoadingMods] = useState(true)
  const [modsErrorMessage, setModsErrorMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [formState, setFormState] = useState<FormState>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null)

  const [modToDelete, setModToDelete] = useState<SkyrimMod | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadModpack() {
      if (!id) {
        return
      }

      const { modpack: result, error } = await fetchSkyrimModpackById(id)

      if (!isMounted) {
        return
      }

      if (error) {
        setModpackErrorMessage(error)
      } else {
        setModpack(result)
      }

      setIsLoadingModpack(false)
    }

    loadModpack()

    return () => {
      isMounted = false
    }
  }, [id])

  /**
   * Recharge la liste des mods pour ce modpack depuis Supabase et met
   * à jour l'état de la page en conséquence.
   * @returns rien, la fonction agit uniquement par effet de bord (état de la page)
   */
  async function refreshMods() {
    if (!id) {
      return
    }

    const { mods: result, error } = await fetchSkyrimMods(id)

    if (error) {
      setModsErrorMessage(error)
    } else {
      setMods(result)
      setModsErrorMessage(null)
    }

    setIsLoadingMods(false)
  }

  useEffect(() => {
    refreshMods()
  }, [id])

  const filteredMods = useMemo(() => filterSkyrimMods(mods, searchQuery), [mods, searchQuery])

  /**
   * Ouvre la modale d'ajout d'un mod.
   * @returns rien, la fonction agit uniquement par effet de bord (état de la page)
   */
  function openCreateForm() {
    setFormErrorMessage(null)
    setFormState({ mode: 'create' })
  }

  /**
   * Ouvre la modale de modification d'un mod existant.
   * @param mod mod à modifier
   * @returns rien, la fonction agit uniquement par effet de bord (état de la page)
   */
  function openEditForm(mod: SkyrimMod) {
    setFormErrorMessage(null)
    setFormState({ mode: 'edit', mod })
  }

  /**
   * Crée ou met à jour un mod selon le mode actif, recharge la liste,
   * puis ferme la modale en cas de succès.
   * @param input valeurs saisies dans le formulaire (nom, version, catégorie, ordre de déploiement)
   * @returns rien, la fonction agit uniquement par effet de bord (état, réseau)
   */
  async function handleSubmit(input: SkyrimModInput) {
    if (!id || !formState) {
      return
    }

    setFormErrorMessage(null)
    setIsSubmitting(true)

    const { error } =
      formState.mode === 'create'
        ? await createSkyrimMod(id, input)
        : await updateSkyrimMod(formState.mod.id, input)

    setIsSubmitting(false)

    if (error) {
      setFormErrorMessage(error)
      return
    }

    setFormState(null)
    await refreshMods()
  }

  /**
   * Confirme la suppression du mod sélectionné, puis recharge la
   * liste et ferme la modale de confirmation en cas de succès.
   * @returns rien, la fonction agit uniquement par effet de bord (état, réseau)
   */
  async function handleConfirmDelete() {
    if (!modToDelete) {
      return
    }

    setIsDeleting(true)

    const { error } = await deleteSkyrimMod(modToDelete.id)

    setIsDeleting(false)

    if (error) {
      setModsErrorMessage(error)
      return
    }

    setModToDelete(null)
    await refreshMods()
  }

  return (
    <div className="skyrim-modpack-detail-page">
      <Navbar />
      <main className="skyrim-modpack-detail-page__content">
        {isLoadingModpack && (
          <p className="skyrim-modpack-detail-page__status">Chargement...</p>
        )}
        {!isLoadingModpack && modpackErrorMessage && (
          <p
            className="skyrim-modpack-detail-page__status skyrim-modpack-detail-page__status--error"
            role="alert"
          >
            {modpackErrorMessage}
          </p>
        )}
        {!isLoadingModpack && !modpackErrorMessage && !modpack && (
          <p className="skyrim-modpack-detail-page__status">Ce modpack n'existe pas.</p>
        )}
        {!isLoadingModpack && !modpackErrorMessage && modpack && (
          <>
            <div className="skyrim-modpack-detail-page__header">
              <h1 className="skyrim-modpack-detail-page__title">{modpack.name}</h1>
              <button
                type="button"
                className="skyrim-modpack-detail-page__add"
                onClick={openCreateForm}
              >
                <Plus aria-hidden="true" />
                Ajouter un mod
              </button>
            </div>
            {!isLoadingMods && !modsErrorMessage && mods.length > 0 && (
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Rechercher un mod ou une catégorie..."
                ariaLabel="Rechercher un mod par nom ou par catégorie"
              />
            )}
            {isLoadingMods && <p className="skyrim-modpack-detail-page__status">Chargement...</p>}
            {!isLoadingMods && modsErrorMessage && (
              <p
                className="skyrim-modpack-detail-page__status skyrim-modpack-detail-page__status--error"
                role="alert"
              >
                {modsErrorMessage}
              </p>
            )}
            {!isLoadingMods && !modsErrorMessage && mods.length === 0 && (
              <EmptyState message="Aucun mod n'existe pour l'instant." />
            )}
            {!isLoadingMods &&
              !modsErrorMessage &&
              mods.length > 0 &&
              filteredMods.length === 0 && (
                <EmptyState message="Aucun mod ne correspond à ta recherche." />
              )}
            {!isLoadingMods && !modsErrorMessage && filteredMods.length > 0 && (
              <SkyrimModTable
                mods={filteredMods}
                onEdit={openEditForm}
                onDelete={(mod) => setModToDelete(mod)}
              />
            )}
          </>
        )}
      </main>

      {formState && (
        <Modal
          title={formState.mode === 'create' ? 'Ajouter un mod' : 'Modifier ce mod'}
          onClose={() => setFormState(null)}
        >
          <SkyrimModForm
            initialMod={formState.mode === 'edit' ? formState.mod : null}
            onSubmit={handleSubmit}
            onCancel={() => setFormState(null)}
            isSubmitting={isSubmitting}
            errorMessage={formErrorMessage}
          />
        </Modal>
      )}

      {modToDelete && (
        <ConfirmDialog
          title="Supprimer ce mod"
          message={`Es-tu sûr de vouloir supprimer "${modToDelete.modName}" ? Cette action est définitive.`}
          confirmLabel="Supprimer"
          isConfirming={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setModToDelete(null)}
        />
      )}
    </div>
  )
}
