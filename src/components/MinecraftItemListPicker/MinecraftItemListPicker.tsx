import { Plus, Trash2 } from 'lucide-react'
import { MinecraftItemPicker } from '../MinecraftItemPicker/MinecraftItemPicker'
import './MinecraftItemListPicker.css'

interface MinecraftItemListPickerProps {
  idPrefix: string
  label: string
  values: string[]
  onChange: (values: string[]) => void
  minItems?: number
}

/**
 * Champ de sélection d'une liste d'items Minecraft, pour les cas où une
 * même action peut donner plusieurs items différents (ex. casser un bloc
 * peut donner à la fois de la laine et du sable). Affiche un
 * MinecraftItemPicker par item de la liste, avec un bouton pour en retirer
 * un (tant qu'il en reste au moins minItems) et un bouton pour en ajouter
 * un nouveau. La liste peut contenir des emplacements vides (item pas
 * encore choisi) : c'est au composant appelant de filtrer les valeurs
 * vides avant envoi si nécessaire.
 */
export function MinecraftItemListPicker({
  idPrefix,
  label,
  values,
  onChange,
  minItems = 1,
}: MinecraftItemListPickerProps) {
  /**
   * Met à jour la valeur d'un emplacement précis de la liste.
   * @param index position de l'emplacement modifié
   * @param itemId nouvel identifiant d'item choisi pour cet emplacement
   * @returns rien, la fonction agit uniquement par effet de bord (callback parent)
   */
  function updateValueAt(index: number, itemId: string) {
    const next = [...values]
    next[index] = itemId
    onChange(next)
  }

  /**
   * Ajoute un nouvel emplacement vide à la fin de la liste.
   * @returns rien, la fonction agit uniquement par effet de bord (callback parent)
   */
  function addSlot() {
    onChange([...values, ''])
  }

  /**
   * Retire l'emplacement à l'index donné, si le nombre minimum
   * d'emplacements le permet.
   * @param index position de l'emplacement à retirer
   * @returns rien, la fonction agit uniquement par effet de bord (callback parent)
   */
  function removeSlot(index: number) {
    if (values.length <= minItems) {
      return
    }

    onChange(values.filter((_, valueIndex) => valueIndex !== index))
  }

  return (
    <div className="minecraft-item-list-picker">
      <span className="minecraft-item-list-picker__label">{label}</span>
      <div className="minecraft-item-list-picker__rows">
        {values.map((value, index) => (
          <div key={index} className="minecraft-item-list-picker__row">
            <MinecraftItemPicker
              id={`${idPrefix}-${index}`}
              label={`${label} ${index + 1}`}
              value={value}
              onChange={(itemId) => updateValueAt(index, itemId)}
            />
            <button
              type="button"
              className="minecraft-item-list-picker__remove"
              aria-label="Retirer cet item obtenu"
              disabled={values.length <= minItems}
              onClick={() => removeSlot(index)}
            >
              <Trash2 aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="minecraft-item-list-picker__add" onClick={addSlot}>
        <Plus aria-hidden="true" />
        Ajouter un item obtenu
      </button>
    </div>
  )
}
