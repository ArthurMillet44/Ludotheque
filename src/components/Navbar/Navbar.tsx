import { NavLink } from 'react-router-dom'
import { Logo } from '../Logo/Logo'
import { ProfileMenu } from '../ProfileMenu/ProfileMenu'
import './Navbar.css'

/**
 * Barre de navigation principale affichant le logo de l'application,
 * les liens de navigation entre les pages, et le menu de profil (avec
 * l'option de déconnexion).
 */
export function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__start">
        <Logo />
        <nav className="navbar__links" aria-label="Navigation principale">
          <NavLink
            to="/animes"
            className={({ isActive }) =>
              isActive ? 'navbar__link navbar__link--active' : 'navbar__link'
            }
          >
            Animes
          </NavLink>
          <NavLink
            to="/mangas"
            className={({ isActive }) =>
              isActive ? 'navbar__link navbar__link--active' : 'navbar__link'
            }
          >
            Mangas
          </NavLink>
          <NavLink
            to="/pokemon"
            className={({ isActive }) =>
              isActive ? 'navbar__link navbar__link--active' : 'navbar__link'
            }
          >
            Pokémon
          </NavLink>
          <NavLink
            to="/skyrim"
            className={({ isActive }) =>
              isActive ? 'navbar__link navbar__link--active' : 'navbar__link'
            }
          >
            Skyrim
          </NavLink>
        </nav>
      </div>
      <ProfileMenu />
    </header>
  )
}
