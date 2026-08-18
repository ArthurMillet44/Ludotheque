import { useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import './PasswordField.css'

interface PasswordFieldProps {
  label: string
  autoComplete: 'current-password' | 'new-password'
  value: string
  onChange: (value: string) => void
}

/**
 * Champ de mot de passe avec bascule d'affichage en clair.
 * Gère uniquement l'état visuel de visibilité du mot de passe,
 * aucune validation ni logique métier.
 */
export function PasswordField({ label, autoComplete, value, onChange }: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false)
  const inputId = useId()

  return (
    <div className="password-field">
      <label className="password-field__label" htmlFor={inputId}>
        {label}
      </label>
      <div className="password-field__control">
        <input
          id={inputId}
          className="password-field__input"
          type={isVisible ? 'text' : 'password'}
          placeholder="••••••••"
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          className="password-field__toggle"
          aria-label={isVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          aria-pressed={isVisible}
          onClick={() => setIsVisible((previous) => !previous)}
        >
          {isVisible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </button>
      </div>
    </div>
  )
}
