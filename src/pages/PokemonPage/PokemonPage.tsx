import { useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { Navbar } from '../../components/Navbar/Navbar'
import { Modal } from '../../components/Modal/Modal'
import { FormField } from '../../components/FormField/FormField'
import { PrimaryButton } from '../../components/PrimaryButton/PrimaryButton'
import { createPokemonGame } from '../../features/pokemon/pokemonApi'
import './PokemonPage.css'

/**
 * Page de suivi des jeux Pokémon de l'utilisateur connecté. Pour
 * l'instant, permet uniquement d'ajouter un jeu par son nom ; aucun
 * affichage de la liste n'est encore en place.
 */
export function PokemonPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  /**
   * Ouvre la modale d'ajout avec un champ nom vide.
   * @returns rien, la fonction agit uniquement par effet de bord (état de la page)
   */
  function openForm() {
    setName('')
    setErrorMessage(null)
    setIsFormOpen(true)
  }

  /**
   * Crée un nouveau jeu Pokémon avec le nom saisi, puis ferme la
   * modale en cas de succès.
   * @param event événement de soumission du formulaire
   * @returns rien, la fonction agit uniquement par effet de bord (état, réseau)
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setErrorMessage(null)
    setIsSubmitting(true)

    const { error } = await createPokemonGame(name.trim())

    setIsSubmitting(false)

    if (error) {
      setErrorMessage(error)
      return
    }

    setIsFormOpen(false)
  }

  return (
    <div className="pokemon-page">
      <Navbar />
      <main className="pokemon-page__content">
        <div className="pokemon-page__header">
          <h1 className="pokemon-page__title">Pokémon</h1>
          <button type="button" className="pokemon-page__add" onClick={openForm}>
            <Plus aria-hidden="true" />
            Ajouter un jeu
          </button>
        </div>
      </main>

      {isFormOpen && (
        <Modal title="Ajouter un jeu" onClose={() => setIsFormOpen(false)}>
          <form className="pokemon-page__form" onSubmit={handleSubmit}>
            <FormField
              id="pokemon-game-name"
              label="Nom du jeu"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            {errorMessage && (
              <p className="pokemon-page__form-error" role="alert">
                {errorMessage}
              </p>
            )}
            <div className="pokemon-page__form-actions">
              <button
                type="button"
                className="pokemon-page__form-cancel"
                onClick={() => setIsFormOpen(false)}
              >
                Annuler
              </button>
              <PrimaryButton
                type="submit"
                className="pokemon-page__form-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Ajout...' : 'Ajouter'}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
