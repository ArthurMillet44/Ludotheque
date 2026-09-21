import { useState, type FormEvent } from 'react'
import { SelectField } from '../SelectField/SelectField'
import { MinecraftItemPicker } from '../MinecraftItemPicker/MinecraftItemPicker'
import { MinecraftItemListPicker } from '../MinecraftItemListPicker/MinecraftItemListPicker'
import { PrimaryButton } from '../PrimaryButton/PrimaryButton'
import { findMinecraftItemById } from '../../lib/minecraftItems'
import type {
  MinecraftHistoryCategory,
  MinecraftHistoryEntry,
  MinecraftHistoryInput,
  MinecraftHistoryType,
} from '../../features/minecraft/minecraftHistoryApi'
import './MinecraftHistoryForm.css'

const CATEGORY_OPTIONS: { value: MinecraftHistoryCategory; label: string }[] = [
  { value: 'armure', label: 'Armure' },
  { value: 'outil', label: 'Outil' },
  { value: 'potion', label: 'Potion' },
  { value: 'nourriture', label: 'Nourriture' },
  { value: 'bloc', label: 'Bloc' },
  { value: 'autre', label: 'Autre' },
]

const TYPE_OPTIONS: {
  value: MinecraftHistoryType
  label: string
  inputLabel: string
  recipeHintLabel: string | null
}[] = [
  { value: 'bloc_casse', label: 'Bloc cassé', inputLabel: 'Blocs cassés', recipeHintLabel: null },
  {
    value: 'craft',
    label: 'Craft',
    inputLabel: 'Item normalement crafté',
    recipeHintLabel: 'Item de base (optionnel, si plusieurs recettes existent pour cet item)',
  },
  {
    value: 'pierre_a_tailler',
    label: 'Pierre à tailler',
    inputLabel: 'Item utilisé dans la pierre à tailler',
    recipeHintLabel:
      'Item normalement obtenu par cette recette (optionnel, si plusieurs recettes existent pour cet item)',
  },
]

interface MinecraftHistoryFormProps {
  initialEntry: MinecraftHistoryEntry | null
  parentEntry: MinecraftHistoryEntry | null
  onSubmit: (input: MinecraftHistoryInput) => void
  onCancel: () => void
  isSubmitting: boolean
  errorMessage: string | null
}

/**
 * Renvoie le nom affichable d'un item Minecraft à partir de son
 * identifiant technique, ou l'identifiant lui-même si l'item n'est pas
 * (ou plus) présent dans la liste de référence.
 * @param itemId identifiant technique de l'item
 * @returns le nom affichable de l'item
 */
function getItemDisplayName(itemId: string): string {
  return findMinecraftItemById(itemId)?.displayName ?? itemId
}

/**
 * Renvoie les noms affichables d'une liste d'items Minecraft, séparés par
 * une virgule.
 * @param itemIds identifiants techniques des items
 * @returns les noms affichables, séparés par ", "
 */
function getItemsDisplayName(itemIds: string[]): string {
  return itemIds.map(getItemDisplayName).join(', ')
}

/**
 * Formulaire de création ou de modification d'une entrée d'historique
 * Minecraft. Le mode (création ou édition) dépend de la présence d'une
 * entrée initiale. Lors de la création d'une sous-entrée (parentEntry
 * renseigné), l'item d'entrée est pré-rempli avec l'item obtenu par
 * l'entrée parente (une sous-entrée représente une nouvelle action réalisée
 * à partir de cet item) si celle-ci n'a qu'un seul item obtenu (sinon le
 * champ reste vide, impossible de deviner lequel des items continuer),
 * mais reste modifiable dans tous les cas. Le libellé du champ "item
 * d'entrée" s'adapte au type choisi (bloc cassé, craft, pierre à tailler).
 *
 * Pour le type bloc_casse, aussi bien l'item d'entrée ("Blocs cassés") que
 * l'item obtenu ("Items obtenus") sont des listes (MinecraftItemListPicker) :
 * plusieurs blocs différents peuvent normalement donner le même résultat
 * (entrée), et casser un bloc peut donner plusieurs items en une fois
 * (sortie). Pour craft et pierre à tailler, un seul item d'entrée et un seul
 * item de sortie sont possibles (MinecraftItemPicker simple), conformément
 * au fonctionnement du jeu.
 *
 * Pour craft et pierre à tailler, un champ optionnel "indice de recette"
 * (recipeHint) permet de lever l'ambiguïté quand plusieurs recettes vanilla
 * différentes partagent le même item d'entrée : l'ingrédient réel utilisé
 * pour craft (ex. Allium plutôt que Lilas pour obtenir Magenta Dye), ou
 * l'item normalement obtenu pour pierre à tailler (ex. Stone Stairs plutôt
 * qu'un autre résultat normalement possible avec Stone). Absent pour bloc
 * cassé, qui n'a pas cette ambiguïté. En soumettant, ce champ est forcé à
 * null si le type ne le supporte pas. Ne réalise aucun appel réseau :
 * remonte les valeurs saisies au composant parent via onSubmit.
 *
 * Le champ "Catégorie" (optionnel : Armure, Outil, Potion, Nourriture,
 * Autre) n'est affiché que pour une entrée de premier niveau (pas de
 * sous-entrée, une chaîne entière partage sa catégorie) : en édition, sur la
 * base de initialEntry.parentEntryId ; en création, sur la base de
 * l'absence de parentEntry.
 */
export function MinecraftHistoryForm({
  initialEntry,
  parentEntry,
  onSubmit,
  onCancel,
  isSubmitting,
  errorMessage,
}: MinecraftHistoryFormProps) {
  const isRootEntry = initialEntry ? initialEntry.parentEntryId === null : parentEntry === null
  const [type, setType] = useState<MinecraftHistoryType>(initialEntry?.type ?? 'bloc_casse')
  const [category, setCategory] = useState<MinecraftHistoryCategory | ''>(initialEntry?.category ?? '')
  const [recipeHint, setRecipeHint] = useState(initialEntry?.recipeHint ?? '')
  const [inputItems, setInputItems] = useState<string[]>(
    initialEntry?.inputItems ?? (parentEntry?.outputItems.length === 1 ? [parentEntry.outputItems[0]] : ['']),
  )
  const [outputItems, setOutputItems] = useState<string[]>(initialEntry?.outputItems ?? [''])

  const activeTypeOption = TYPE_OPTIONS.find((option) => option.value === type) ?? TYPE_OPTIONS[0]
  const isBlocCasse = type === 'bloc_casse'
  const hasAtLeastOneInputItem = inputItems.some((item) => item.trim() !== '')
  const hasAtLeastOneOutputItem = outputItems.some((item) => item.trim() !== '')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    onSubmit({
      parentEntryId: initialEntry ? initialEntry.parentEntryId : (parentEntry?.id ?? null),
      type,
      recipeHint: activeTypeOption.recipeHintLabel && recipeHint.trim() !== '' ? recipeHint : null,
      category: isRootEntry && category !== '' ? category : null,
      inputItems: inputItems.filter((item) => item.trim() !== ''),
      outputItems: outputItems.filter((item) => item.trim() !== ''),
    })
  }

  return (
    <form className="minecraft-history-form" onSubmit={handleSubmit}>
      {!initialEntry && parentEntry && (
        <p className="minecraft-history-form__parent-hint">
          Sous-entrée de : {getItemsDisplayName(parentEntry.inputItems)} →{' '}
          {getItemsDisplayName(parentEntry.outputItems)}
        </p>
      )}
      {isRootEntry && (
        <SelectField
          id="minecraft-history-category"
          label="Catégorie (optionnel)"
          value={category}
          onChange={(event) => setCategory(event.target.value as MinecraftHistoryCategory | '')}
        >
          <option value="">Aucune</option>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
      )}
      <SelectField
        id="minecraft-history-type"
        label="Type"
        value={type}
        onChange={(event) => {
          const nextType = event.target.value as MinecraftHistoryType

          setType(nextType)

          // Un seul item d'entrée et un seul item obtenu possibles en
          // dehors de bloc_casse : on ne garde que le premier si
          // l'utilisateur en avait ajouté plusieurs puis change de type.
          if (nextType !== 'bloc_casse') {
            if (inputItems.length > 1) {
              setInputItems([inputItems[0] ?? ''])
            }
            if (outputItems.length > 1) {
              setOutputItems([outputItems[0] ?? ''])
            }
          }
        }}
      >
        {TYPE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>
      {activeTypeOption.recipeHintLabel && (
        <MinecraftItemPicker
          id="minecraft-history-recipe-hint"
          label={activeTypeOption.recipeHintLabel}
          value={recipeHint}
          onChange={setRecipeHint}
        />
      )}
      {isBlocCasse ? (
        <MinecraftItemListPicker
          idPrefix="minecraft-history-input-item"
          label={activeTypeOption.inputLabel}
          values={inputItems}
          onChange={setInputItems}
        />
      ) : (
        <MinecraftItemPicker
          id="minecraft-history-input-item"
          label={activeTypeOption.inputLabel}
          value={inputItems[0] ?? ''}
          onChange={(itemId) => setInputItems([itemId])}
          required
        />
      )}
      {isBlocCasse ? (
        <MinecraftItemListPicker
          idPrefix="minecraft-history-output-item"
          label="Items obtenus"
          values={outputItems}
          onChange={setOutputItems}
        />
      ) : (
        <MinecraftItemPicker
          id="minecraft-history-output-item"
          label="Item obtenu"
          value={outputItems[0] ?? ''}
          onChange={(itemId) => setOutputItems([itemId])}
          required
        />
      )}
      {errorMessage && (
        <p className="minecraft-history-form__error" role="alert">
          {errorMessage}
        </p>
      )}
      <div className="minecraft-history-form__actions">
        <button type="button" className="minecraft-history-form__cancel" onClick={onCancel}>
          Annuler
        </button>
        <PrimaryButton
          type="submit"
          className="minecraft-history-form__submit"
          disabled={isSubmitting || !hasAtLeastOneInputItem || !hasAtLeastOneOutputItem}
        >
          {isSubmitting ? 'Enregistrement...' : initialEntry ? 'Enregistrer' : 'Ajouter'}
        </PrimaryButton>
      </div>
    </form>
  )
}
