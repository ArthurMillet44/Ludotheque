import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PrimaryButton } from '../../components/PrimaryButton/PrimaryButton'
import { signOut } from '../../features/auth/authApi'
import './AnimesPage.css'

/**
 * Page listant les animes de l'utilisateur connecté. Contenu à venir,
 * sert pour l'instant de destination après une connexion réussie.
 * Propose un bouton de déconnexion qui ramène à la page de connexion.
 */
export function AnimesPage() {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const navigate = useNavigate()

  /**
   * Déconnecte l'utilisateur via Supabase Auth puis le redirige vers
   * la page de connexion.
   * @returns rien, la fonction agit uniquement par effets de bord (état, navigation)
   */
  async function handleSignOut() {
    setIsSigningOut(true)
    await signOut()
    setIsSigningOut(false)
    navigate('/')
  }

  return (
    <main className="animes-page">
      <h1 className="animes-page__title">Animes</h1>
      <p className="animes-page__subtitle">Cette page est en cours de construction.</p>
      <PrimaryButton
        type="button"
        className="animes-page__logout"
        onClick={handleSignOut}
        disabled={isSigningOut}
      >
        {isSigningOut ? 'Déconnexion en cours...' : 'Se déconnecter'}
      </PrimaryButton>
    </main>
  )
}
