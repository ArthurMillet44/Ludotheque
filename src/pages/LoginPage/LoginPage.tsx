import { AuthCard } from '../../components/AuthCard/AuthCard'
import { Logo } from '../../components/Logo/Logo'
import './LoginPage.css'

/**
 * Page d'authentification affichant le logo de l'application
 * au-dessus de la carte de connexion/inscription.
 * Ne prend aucun paramètre et ne gère aucun état propre.
 */
export function LoginPage() {
  return (
    <main className="login-page">
      <Logo />
      <AuthCard />
    </main>
  )
}
