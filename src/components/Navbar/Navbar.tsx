import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Logo } from '../Logo/Logo'
import { ProfileMenu } from '../ProfileMenu/ProfileMenu'
import './Navbar.css'

const NAV_LINKS = [
  { to: '/animes', label: 'Animes' },
  { to: '/mangas', label: 'Mangas' },
  { to: '/pokemon', label: 'Pokémon' },
  { to: '/skyrim', label: 'Skyrim' },
]

/**
 * Barre de navigation principale affichant le logo de l'application,
 * les liens de navigation entre les pages, et le menu de profil (avec
 * l'option de déconnexion). Sur petit écran, les liens de navigation
 * se replient derrière un bouton menu (menu burger) pour éviter que
 * la barre déborde.
 */
export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node

      if (
        navRef.current &&
        !navRef.current.contains(target) &&
        toggleRef.current &&
        !toggleRef.current.contains(target)
      ) {
        setIsMenuOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <header className="navbar">
      <div className="navbar__start">
        <Logo />
        <nav
          ref={navRef}
          className={`navbar__links ${isMenuOpen ? 'navbar__links--open' : ''}`}
          aria-label="Navigation principale"
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive ? 'navbar__link navbar__link--active' : 'navbar__link'
              }
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="navbar__end">
        <button
          ref={toggleRef}
          type="button"
          className="navbar__menu-toggle"
          aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((previous) => !previous)}
        >
          {isMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <ProfileMenu />
      </div>
    </header>
  )
}
