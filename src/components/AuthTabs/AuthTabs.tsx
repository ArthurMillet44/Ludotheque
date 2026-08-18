import './AuthTabs.css'

export type AuthMode = 'connexion' | 'inscription'

interface AuthTabsProps {
  activeMode: AuthMode
  onChange: (mode: AuthMode) => void
}

/**
 * Sélecteur segmenté permettant de basculer entre le mode connexion
 * et le mode inscription. Reçoit le mode actif et un callback de
 * changement, ne gère aucun état interne.
 */
export function AuthTabs({ activeMode, onChange }: AuthTabsProps) {
  return (
    <div className="auth-tabs" role="tablist" aria-label="Mode d'authentification">
      <button
        type="button"
        role="tab"
        aria-selected={activeMode === 'connexion'}
        className={`auth-tabs__tab ${activeMode === 'connexion' ? 'auth-tabs__tab--active' : ''}`}
        onClick={() => onChange('connexion')}
      >
        Connexion
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeMode === 'inscription'}
        className={`auth-tabs__tab ${activeMode === 'inscription' ? 'auth-tabs__tab--active' : ''}`}
        onClick={() => onChange('inscription')}
      >
        Inscription
      </button>
    </div>
  )
}
