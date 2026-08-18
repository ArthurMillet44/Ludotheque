import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2 } from 'lucide-react'
import type { SkyrimMod } from '../../features/skyrim/skyrimModsApi'
import './SkyrimModTable.css'

interface SkyrimModTableProps {
  mods: SkyrimMod[]
  onEdit: (mod: SkyrimMod) => void
  onDelete: (mod: SkyrimMod) => void
}

type SortKey = 'modName' | 'version' | 'category' | 'deployOrder'
type SortDirection = 'asc' | 'desc'

interface SortConfig {
  key: SortKey
  direction: SortDirection
}

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'modName', label: 'Nom du mod' },
  { key: 'version', label: 'Version' },
  { key: 'category', label: 'Catégorie' },
  { key: 'deployOrder', label: 'Ordre' },
]

/**
 * Compare deux mods selon la colonne de tri donnée. Les valeurs
 * manquantes (version ou catégorie non renseignées) sont toujours
 * placées en fin de liste, quel que soit le sens du tri.
 * @param a premier mod à comparer
 * @param b second mod à comparer
 * @param key colonne sur laquelle trier
 * @returns un nombre négatif, nul ou positif selon l'ordre relatif de a et b
 */
function compareMods(a: SkyrimMod, b: SkyrimMod, key: SortKey): number {
  const valueA = a[key]
  const valueB = b[key]

  if (valueA == null && valueB == null) {
    return 0
  }
  if (valueA == null) {
    return 1
  }
  if (valueB == null) {
    return -1
  }
  if (typeof valueA === 'number' && typeof valueB === 'number') {
    return valueA - valueB
  }
  return String(valueA).localeCompare(String(valueB), 'fr')
}

/**
 * Affiche la liste des mods d'un modpack sous forme de tableau
 * triable (nom, version, catégorie, ordre de déploiement), avec des
 * actions par ligne pour modifier ou supprimer un mod. Le tri est
 * purement visuel et s'applique aux données reçues en props, sans
 * appel réseau.
 */
export function SkyrimModTable({ mods, onEdit, onDelete }: SkyrimModTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)

  const sortedMods = useMemo(() => {
    if (!sortConfig) {
      return mods
    }

    const sorted = [...mods].sort((a, b) => compareMods(a, b, sortConfig.key))

    return sortConfig.direction === 'asc' ? sorted : sorted.reverse()
  }, [mods, sortConfig])

  /**
   * Active le tri sur la colonne cliquée, ou inverse son sens si elle
   * est déjà la colonne de tri active.
   * @param key colonne sur laquelle l'utilisateur vient de cliquer
   * @returns rien, la fonction agit uniquement par effet de bord (état de tri)
   */
  function handleSort(key: SortKey) {
    setSortConfig((previous) => {
      if (previous?.key !== key) {
        return { key, direction: 'asc' }
      }
      return { key, direction: previous.direction === 'asc' ? 'desc' : 'asc' }
    })
  }

  return (
    <div className="skyrim-mod-table__wrapper">
      <table className="skyrim-mod-table">
        <thead>
          <tr>
            {COLUMNS.map((column) => {
              const isActive = sortConfig?.key === column.key

              return (
                <th
                  key={column.key}
                  aria-sort={
                    isActive ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'
                  }
                >
                  <button
                    type="button"
                    className="skyrim-mod-table__sort-button"
                    onClick={() => handleSort(column.key)}
                  >
                    {column.label}
                    {isActive ? (
                      sortConfig.direction === 'asc' ? (
                        <ArrowUp aria-hidden="true" />
                      ) : (
                        <ArrowDown aria-hidden="true" />
                      )
                    ) : (
                      <ArrowUpDown aria-hidden="true" className="skyrim-mod-table__sort-icon--idle" />
                    )}
                  </button>
                </th>
              )
            })}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedMods.map((mod) => (
            <tr key={mod.id}>
              <td>{mod.modName}</td>
              <td>{mod.version ?? '-'}</td>
              <td>{mod.category ?? '-'}</td>
              <td>{mod.deployOrder}</td>
              <td>
                <div className="skyrim-mod-table__actions">
                  <button
                    type="button"
                    className="skyrim-mod-table__action"
                    aria-label={`Modifier ${mod.modName}`}
                    onClick={() => onEdit(mod)}
                  >
                    <Pencil aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="skyrim-mod-table__action skyrim-mod-table__action--danger"
                    aria-label={`Supprimer ${mod.modName}`}
                    onClick={() => onDelete(mod)}
                  >
                    <Trash2 aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
