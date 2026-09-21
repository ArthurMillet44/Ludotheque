import { useEffect, useRef, useState } from 'react'
import { findMinecraftItemById, searchMinecraftItems } from '../../lib/minecraftItems'
import { MinecraftItemIcon } from '../MinecraftItemIcon/MinecraftItemIcon'
import './MinecraftItemPicker.css'

interface MinecraftItemPickerProps {
  id: string
  label: string
  value: string
  onChange: (itemId: string) => void
  required?: boolean
}

/**
 * Champ de sélection d'un item Minecraft par autocomplétion, limité à la
 * liste officielle des items du jeu (src/data/minecraftItems.json). Affiche
 * l'icône de l'item actuellement sélectionné, et une liste déroulante de
 * suggestions pendant la saisie. La valeur remontée via onChange est
 * toujours un identifiant technique valide (ex. "diamond_sword") : si
 * l'utilisateur quitte le champ sans choisir une suggestion, la saisie
 * revient à la dernière sélection valide.
 */
export function MinecraftItemPicker({ id, label, value, onChange, required }: MinecraftItemPickerProps) {
  const selectedItem = findMinecraftItemById(value)
  const [query, setQuery] = useState(selectedItem?.displayName ?? '')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(selectedItem?.displayName ?? '')
  }, [value])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setQuery(selectedItem?.displayName ?? '')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [selectedItem])

  const suggestions = isOpen ? searchMinecraftItems(query) : []

  /**
   * Sélectionne un item de la liste de suggestions : remonte son
   * identifiant au composant parent et referme la liste déroulante.
   * @param itemId identifiant technique de l'item choisi
   * @returns rien, la fonction agit uniquement par effet de bord (état, callback parent)
   */
  function selectItem(itemId: string) {
    onChange(itemId)
    setIsOpen(false)
  }

  return (
    <div className="minecraft-item-picker" ref={containerRef}>
      <label className="minecraft-item-picker__label" htmlFor={id}>
        {label}
      </label>
      <div className="minecraft-item-picker__field">
        {selectedItem && <MinecraftItemIcon itemId={selectedItem.id} label={selectedItem.displayName} size={28} />}
        <input
          id={id}
          type="text"
          className="minecraft-item-picker__input"
          value={query}
          placeholder="Rechercher un item..."
          required={required}
          autoComplete="off"
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value)
            setIsOpen(true)
          }}
        />
      </div>
      {isOpen && suggestions.length > 0 && (
        <ul className="minecraft-item-picker__suggestions">
          {suggestions.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="minecraft-item-picker__suggestion"
                onClick={() => selectItem(item.id)}
              >
                <MinecraftItemIcon itemId={item.id} label={item.displayName} size={24} />
                <span>{item.displayName}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {isOpen && suggestions.length === 0 && (
        <p className="minecraft-item-picker__empty">Aucun item ne correspond à cette recherche.</p>
      )}
    </div>
  )
}
