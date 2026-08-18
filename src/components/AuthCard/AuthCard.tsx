import { useId, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthTabs, type AuthMode } from '../AuthTabs/AuthTabs'
import { FormField } from '../FormField/FormField'
import { PasswordField } from '../PasswordField/PasswordField'
import { PrimaryButton } from '../PrimaryButton/PrimaryButton'
import { signInWithEmail, signUpWithEmail } from '../../features/auth/authApi'
import './AuthCard.css'

const SUBMIT_LABEL: Record<AuthMode, string> = {
  connexion: 'Se connecter',
  inscription: 'Créer mon compte',
}

const SUBMITTING_LABEL: Record<AuthMode, string> = {
  connexion: 'Connexion en cours...',
  inscription: 'Création en cours...',
}

/**
 * Carte d'authentification affichant les onglets connexion/inscription
 * et le formulaire associé (email, mot de passe, bouton d'action).
 * Crée un compte ou connecte l'utilisateur via Supabase Auth selon le
 * mode actif, et redirige vers la page des animes en cas de succès.
 */
export function AuthCard() {
  const [mode, setMode] = useState<AuthMode>('connexion')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const emailFieldId = useId()
  const navigate = useNavigate()

  /**
   * Gère la soumission du formulaire d'authentification. Appelle
   * l'inscription ou la connexion Supabase Auth selon le mode actif,
   * puis redirige vers la page des animes en cas de succès.
   * @param event événement de soumission du formulaire
   * @returns rien, la fonction agit uniquement par effets de bord (état, navigation)
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setErrorMessage(null)
    setIsSubmitting(true)

    const { error } =
      mode === 'inscription'
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password)

    setIsSubmitting(false)

    if (error) {
      setErrorMessage(error)
      return
    }

    navigate('/animes')
  }

  return (
    <div className="auth-card">
      <AuthTabs activeMode={mode} onChange={setMode} />
      <form className="auth-card__form" onSubmit={handleSubmit}>
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
        {errorMessage && (
          <p className="auth-card__error" role="alert">
            {errorMessage}
          </p>
        )}
        <PrimaryButton type="submit" className="auth-card__submit" disabled={isSubmitting}>
          {isSubmitting ? SUBMITTING_LABEL[mode] : SUBMIT_LABEL[mode]}
        </PrimaryButton>
      </form>
    </div>
  )
}
