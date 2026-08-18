import type { ChangeEvent } from 'react'
import { Search } from 'lucide-react'
import './SearchBar.css'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  ariaLabel: string
  placeholder?: string
}

/**
 * Champ de recherche générique avec icône, réutilisable pour filtrer
 * n'importe quelle liste par texte. Ne contient aucune logique de
 * filtrage : il affiche uniquement le champ et remonte sa valeur au
 * composant parent via onChange.
 */
export function SearchBar({ value, onChange, ariaLabel, placeholder }: SearchBarProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value)
  }

  return (
    <div className="search-bar">
      <Search className="search-bar__icon" aria-hidden="true" />
      <input
        type="search"
        className="search-bar__input"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={ariaLabel}
      />
    </div>
  )
}
