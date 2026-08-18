import { Logo } from '../Logo/Logo'
import { ProfileMenu } from '../ProfileMenu/ProfileMenu'
import './Navbar.css'

/**
 * Barre de navigation principale affichant le logo de l'application
 * et le menu de profil (avec l'option de déconnexion).
 */
export function Navbar() {
  return (
    <header className="navbar">
      <Logo />
      <ProfileMenu />
    </header>
  )
}
