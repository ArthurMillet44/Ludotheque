import { useState } from 'react'
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  buildMinecraftHistoryTree,
  collectMinecraftHistoryLeafEntries,
  type MinecraftHistoryCategory,
  type MinecraftHistoryEntry,
  type MinecraftHistoryTreeNode,
  type MinecraftHistoryType,
} from '../../features/minecraft/minecraftHistoryApi'
import { findMinecraftItemById } from '../../lib/minecraftItems'
import { MinecraftItemIcon } from '../MinecraftItemIcon/MinecraftItemIcon'
import './MinecraftHistoryTimeline.css'

interface MinecraftHistoryTimelineProps {
  entries: MinecraftHistoryEntry[]
  onAddChild: (parentEntry: MinecraftHistoryEntry) => void
  onEdit: (entry: MinecraftHistoryEntry) => void
  onDelete: (entry: MinecraftHistoryEntry) => void
}

interface MinecraftHistoryTreeNodeViewProps {
  node: MinecraftHistoryTreeNode
  onAddChild: (parentEntry: MinecraftHistoryEntry) => void
  onEdit: (entry: MinecraftHistoryEntry) => void
  onDelete: (entry: MinecraftHistoryEntry) => void
  /**
   * Renseigné uniquement pour une entrée de premier niveau (racine d'une
   * chaîne) : affiche une flèche permettant de replier toute la chaîne, et
   * bascule sur un résumé (item de base -> résultat(s) final(aux)) quand
   * isCollapsed vaut true.
   */
  collapseControl?: { isCollapsed: boolean; onToggle: () => void }
}

const TYPE_LABELS: Record<MinecraftHistoryType, string> = {
  bloc_casse: 'Bloc cassé',
  craft: 'Craft',
  pierre_a_tailler: 'Pierre à tailler',
}

const CATEGORY_LABELS: Record<MinecraftHistoryCategory, string> = {
  armure: 'Armure',
  outil: 'Outil',
  potion: 'Potion',
  nourriture: 'Nourriture',
  bloc: 'Bloc',
  autre: 'Autre',
}

/**
 * Préfixe textuel du badge d'indice de recette (recipeHint), qui précède le
 * nom de l'item affiché : l'ingrédient réel utilisé pour craft ("via
 * Allium"), l'item normalement obtenu pour pierre à tailler ("normalement
 * Stone Stairs"). Pas de préfixe pour bloc cassé, qui n'affiche jamais ce
 * badge (pas d'ambiguïté).
 */
const RECIPE_HINT_PREFIXES: Record<MinecraftHistoryType, string> = {
  bloc_casse: '',
  craft: 'via',
  pierre_a_tailler: 'normalement',
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
 * Affiche une liste d'items obtenus simultanément par une même entrée (ex.
 * casser un bloc peut donner plusieurs items à la fois), séparés par "+".
 */
function MinecraftHistoryItemGroup({ itemIds }: { itemIds: string[] }) {
  return (
    <div className="minecraft-history-timeline__item-group">
      {itemIds.map((itemId, index) => (
        <div key={itemId} className="minecraft-history-timeline__item">
          {index > 0 && (
            <span className="minecraft-history-timeline__item-separator" aria-hidden="true">
              +
            </span>
          )}
          <MinecraftItemIcon itemId={itemId} label={getItemDisplayName(itemId)} />
          <span>{getItemDisplayName(itemId)}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Affiche le résumé d'une chaîne repliée : l'item de base (l'item d'entrée
 * de l'entrée racine) suivi du ou des résultats finaux obtenus en bout de
 * chaîne. Une feuille peut elle-même donner plusieurs items (bloc_casse) ;
 * dans ce cas ils sont regroupés avec "+" (obtenus ensemble), tandis que les
 * résultats de feuilles différentes (branches différentes de l'arbre) sont
 * séparés par une virgule (résultats de chemins différents).
 */
function MinecraftHistoryCollapsedSummary({ node }: { node: MinecraftHistoryTreeNode }) {
  const leafEntries = collectMinecraftHistoryLeafEntries(node)

  return (
    <div className="minecraft-history-timeline__chain">
      <MinecraftHistoryItemGroup itemIds={node.entry.inputItems} />
      <span className="minecraft-history-timeline__arrow" aria-hidden="true">
        →
      </span>
      <div className="minecraft-history-timeline__collapsed-results">
        {leafEntries.map((leafEntry, index) => (
          <div key={leafEntry.id} className="minecraft-history-timeline__collapsed-result">
            {index > 0 && <span aria-hidden="true">, </span>}
            <MinecraftHistoryItemGroup itemIds={leafEntry.outputItems} />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Affiche un nœud de l'arbre d'historique (une entrée) et, en dessous et
 * indentées, ses sous-entrées le cas échéant. S'appelle elle-même pour
 * chaque sous-entrée, quelle que soit la profondeur de l'arbre. Pour une
 * entrée de premier niveau (collapseControl renseigné), une flèche permet
 * de replier toute la chaîne en un résumé (voir
 * MinecraftHistoryCollapsedSummary).
 */
function MinecraftHistoryTreeNodeView({
  node,
  onAddChild,
  onEdit,
  onDelete,
  collapseControl,
}: MinecraftHistoryTreeNodeViewProps) {
  const { entry, children } = node
  const isCollapsed = collapseControl?.isCollapsed ?? false

  return (
    <li className="minecraft-history-timeline__node">
      <div className="minecraft-history-timeline__entry">
        {collapseControl && (
          <button
            type="button"
            className="minecraft-history-timeline__root-toggle"
            aria-label={
              isCollapsed
                ? `Déplier la chaîne à partir de ${getItemsDisplayName(entry.inputItems)}`
                : `Replier la chaîne à partir de ${getItemsDisplayName(entry.inputItems)}`
            }
            aria-expanded={!isCollapsed}
            onClick={collapseControl.onToggle}
          >
            {isCollapsed ? <ChevronRight aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
          </button>
        )}
        {collapseControl && entry.category && (
          <span className="minecraft-history-timeline__category-badge">{CATEGORY_LABELS[entry.category]}</span>
        )}
        {isCollapsed ? (
          <MinecraftHistoryCollapsedSummary node={node} />
        ) : (
          <>
            <span className="minecraft-history-timeline__type-badge">{TYPE_LABELS[entry.type]}</span>
            {entry.recipeHint && (
              <span
                className="minecraft-history-timeline__recipe-hint"
                title="Précise quelle recette a été utilisée, parmi plusieurs menant normalement au même item"
              >
                <MinecraftItemIcon
                  itemId={entry.recipeHint}
                  label={getItemDisplayName(entry.recipeHint)}
                  size={20}
                />
                {RECIPE_HINT_PREFIXES[entry.type]} {getItemDisplayName(entry.recipeHint)}
              </span>
            )}
            <div className="minecraft-history-timeline__chain">
              <MinecraftHistoryItemGroup itemIds={entry.inputItems} />
              <span className="minecraft-history-timeline__arrow" aria-hidden="true">
                →
              </span>
              <MinecraftHistoryItemGroup itemIds={entry.outputItems} />
            </div>
          </>
        )}
        <div className="minecraft-history-timeline__actions">
          <button
            type="button"
            className="minecraft-history-timeline__action"
            aria-label={`Ajouter une sous-entrée à partir de ${getItemsDisplayName(entry.outputItems)}`}
            onClick={() => onAddChild(entry)}
          >
            <Plus aria-hidden="true" />
          </button>
          <button
            type="button"
            className="minecraft-history-timeline__action"
            aria-label={`Modifier cette entrée (${getItemsDisplayName(entry.inputItems)} -> ${getItemsDisplayName(entry.outputItems)})`}
            onClick={() => onEdit(entry)}
          >
            <Pencil aria-hidden="true" />
          </button>
          <button
            type="button"
            className="minecraft-history-timeline__action minecraft-history-timeline__action--danger"
            aria-label={`Supprimer cette entrée (${getItemsDisplayName(entry.inputItems)} -> ${getItemsDisplayName(entry.outputItems)})`}
            onClick={() => onDelete(entry)}
          >
            <Trash2 aria-hidden="true" />
          </button>
        </div>
      </div>
      {!isCollapsed && children.length > 0 && (
        <ol className="minecraft-history-timeline__children">
          {children.map((childNode) => (
            <MinecraftHistoryTreeNodeView
              key={childNode.entry.id}
              node={childNode}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ol>
      )}
    </li>
  )
}

/**
 * Affiche l'historique d'une partie Minecraft random sous forme d'arbre :
 * chaque entrée montre l'item d'entrée (bloc cassé, item crafté ou passé à
 * la pierre à tailler) puis l'item obtenu, avec le type d'action et des
 * actions pour ajouter une sous-entrée, modifier ou supprimer l'entrée. Une
 * sous-entrée représente une nouvelle action réalisée à partir de l'item
 * obtenu par son entrée parente, ce qui permet de représenter plusieurs
 * branches possibles à partir d'un même item (ex. cobblestone -> laine
 * blanche, puis deux sous-entrées différentes explorées à partir de cette
 * laine). Pour une entrée de type craft ou pierre à tailler dont l'indice de
 * recette (recipeHint) a été précisé (ambiguïté entre plusieurs recettes
 * menant normalement au même item), un badge "via [item]" (craft) ou
 * "normalement [item]" (pierre à tailler) est affiché à côté du type.
 *
 * Chaque chaîne de premier niveau (une entrée racine et toutes ses
 * sous-entrées) peut être repliée/dépliée via la flèche à gauche, et démarre
 * repliée par défaut (l'utilisateur choisit les chaînes qu'il veut détailler
 * plutôt que de tout voir d'un coup) : repliée, elle n'affiche plus que le ou
 * les items de base et le ou les résultats finaux obtenus en bout de chaîne
 * (les feuilles de l'arbre), pour voir d'un coup d'œil ce qu'on obtient en
 * partant de ces items, sans le détail des étapes. Si une catégorie a été
 * choisie pour la chaîne (Armure, Outil, Potion, Nourriture, Autre), un
 * badge l'affiche à côté de la flèche, visible que la chaîne soit repliée
 * ou dépliée.
 */
export function MinecraftHistoryTimeline({ entries, onAddChild, onEdit, onDelete }: MinecraftHistoryTimelineProps) {
  const tree = buildMinecraftHistoryTree(entries)
  // Vide par défaut : aucune chaîne n'est dans expandedRootIds tant qu'on ne
  // l'a pas explicitement dépliée, donc toutes les chaînes démarrent repliées.
  const [expandedRootIds, setExpandedRootIds] = useState<Set<string>>(new Set())

  /**
   * Replie ou déplie la chaîne d'une entrée racine.
   * @param rootId identifiant de l'entrée racine dont la chaîne vient d'être cliquée
   * @returns rien, la fonction agit uniquement par effet de bord (état d'affichage)
   */
  function toggleRootExpanded(rootId: string) {
    setExpandedRootIds((previous) => {
      const next = new Set(previous)

      if (next.has(rootId)) {
        next.delete(rootId)
      } else {
        next.add(rootId)
      }

      return next
    })
  }

  return (
    <ol className="minecraft-history-timeline">
      {tree.map((rootNode) => (
        <MinecraftHistoryTreeNodeView
          key={rootNode.entry.id}
          node={rootNode}
          onAddChild={onAddChild}
          onEdit={onEdit}
          onDelete={onDelete}
          collapseControl={{
            isCollapsed: !expandedRootIds.has(rootNode.entry.id),
            onToggle: () => toggleRootExpanded(rootNode.entry.id),
          }}
        />
      ))}
    </ol>
  )
}
