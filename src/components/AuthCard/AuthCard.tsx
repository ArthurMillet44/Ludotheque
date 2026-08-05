import { useId, useState } from 'react'
import { AuthTabs, type AuthMode } from '../AuthTabs/AuthTabs'
import { FormField } from '../FormField/FormField'
import { PasswordField } from '../PasswordField/PasswordField'
import { PrimaryButton } from '../PrimaryButton/PrimaryButton'
import './AuthCard.css'

const SUBMIT_LABEL: Record<AuthMode, string> = {
  connexion: 'Se connecter',
  inscription: 'Créer mon compte',
}

/**
 * Carte d'authentification affichant les onglets connexion/inscription
 * et le formulaire associé (email, mot de passe, bouton d'action).
 * Ne gère que l'état visuel du formulaire, aucun appel réseau ni
 * validation métier n'est effectué.
 */
export function AuthCard() {
  const [mode, setMode] = useState<AuthMode>('connexion')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const emailFieldId = useId()

  return (
    <div className="auth-card">
      <AuthTabs activeMode={mode} onChange={setMode} />
      <form
        className="auth-card__form"
        onSubmit={(event) => event.preventDefault()}
      >
        <FormField
          id={emailFieldId}
          label="Email"
          type="email"
          placeholder="vous@exemple.com"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <PasswordField
          label="Mot de passe"
          autoComplete={mode === 'connexion' ? 'current-password' : 'new-password'}
          value={password}
          onChange={setPassword}
        />
        <PrimaryButton type="submit" className="auth-card__submit">
          {SUBMIT_LABEL[mode]}
        </PrimaryButton>
      </form>
    </div>
  )
}
