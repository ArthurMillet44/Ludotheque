import { Clapperboard } from 'lucide-react'
import './Logo.css'

/**
 * Affiche l'identité visuelle de l'application : icône de clap
 * suivie du nom "Ludothèque".
 * Ne prend aucun paramètre et ne retourne que du balisage, sans état.
 */
export function Logo() {
  return (
    <div className="logo">
      <Clapperboard className="logo__icon" aria-hidden="true" />
      <span className="logo__text">Ludothèque</span>
    </div>
  )
}
