import { Navbar } from '../../components/Navbar/Navbar'
import './AnimesPage.css'

/**
 * Page listant les animes de l'utilisateur connecté. Contenu à venir,
 * affiche pour l'instant la barre de navigation avec le menu de profil.
 */
export function AnimesPage() {
  return (
    <div className="animes-page">
      <Navbar />
      <main className="animes-page__content">
        <h1 className="animes-page__title">Animes</h1>
        <p className="animes-page__subtitle">Cette page est en cours de construction.</p>
      </main>
    </div>
  )
}
