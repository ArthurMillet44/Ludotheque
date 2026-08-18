import { Plus } from 'lucide-react'
import { Navbar } from '../../components/Navbar/Navbar'
import './SkyrimPage.css'

/**
 * Page de suivi des parties Skyrim de l'utilisateur connecté. Page
 * volontairement vide pour l'instant : ni logique métier, ni appel à
 * Supabase, uniquement la structure visuelle (titre et bouton
 * d'ajout, pas encore fonctionnel).
 */
export function SkyrimPage() {
  return (
    <div className="skyrim-page">
      <Navbar />
      <main className="skyrim-page__content">
        <div className="skyrim-page__header">
          <h1 className="skyrim-page__title">Skyrim</h1>
          <button type="button" className="skyrim-page__add">
            <Plus aria-hidden="true" />
            Ajouter un jeu
          </button>
        </div>
      </main>
    </div>
  )
}
