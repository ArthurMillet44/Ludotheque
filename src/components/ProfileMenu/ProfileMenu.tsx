import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { signOut } from '../../features/auth/authApi'
import './ProfileMenu.css'

/**
 * Bouton de profil affichant un menu déroulant avec l'option de
 * déconnexion. Le menu se ferme lors d'un clic à l'extérieur ou de
 * la touche Échap.
 */
export function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

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
    <div className="profile-menu" ref={containerRef}>
      <button
        type="button"
        className="profile-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Menu du profil"
        onClick={() => setIsOpen((previous) => !previous)}
      >
        <User aria-hidden="true" />
      </button>
      {isOpen && (
        <div className="profile-menu__dropdown" role="menu">
          <button
            type="button"
            role="menuitem"
            className="profile-menu__item"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <LogOut aria-hidden="true" />
            {isSigningOut ? 'Déconnexion en cours...' : 'Se déconnecter'}
          </button>
        </div>
      )}
    </div>
  )
}
