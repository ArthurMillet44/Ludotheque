import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2 } from 'lucide-react'
import type { PokemonCapture } from '../../features/pokemon/pokemonCapturesApi'
import './PokemonCaptureTable.css'

interface PokemonCaptureTableProps {
  captures: PokemonCapture[]
  onEdit: (capture: PokemonCapture) => void
  onDelete: (capture: PokemonCapture) => void
}

type SortKey = 'zone' | 'capturedPokemon' | 'status'
type SortDirection = 'asc' | 'desc'

interface SortConfig {
  key: SortKey
  direction: SortDirection
}

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'zone', label: 'Zone' },
  { key: 'capturedPokemon', label: 'Pokémon capturé' },
  { key: 'status', label: 'Statut' },
]

/**
 * Compare deux captures selon la colonne de tri donnée.
 * @param a première capture à comparer
 * @param b seconde capture à comparer
 * @param key colonne sur laquelle trier
 * @returns un nombre négatif, nul ou positif selon l'ordre relatif de a et b
 */
function compareCaptures(a: PokemonCapture, b: PokemonCapture, key: SortKey): number {
  return a[key].localeCompare(b[key], 'fr')
}

/**
 * Affiche la liste des Pokémon capturés pour un jeu, sous forme de
 * tableau triable (zone, Pokémon capturé, statut), avec des actions
 * par ligne pour modifier ou supprimer une capture. Le tri est
 * purement visuel et s'applique aux données reçues en props, sans
 * appel réseau.
 */
export function PokemonCaptureTable({ captures, onEdit, onDelete }: PokemonCaptureTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)

  const sortedCaptures = useMemo(() => {
    if (!sortConfig) {
      return captures
    }

    const sorted = [...captures].sort((a, b) => compareCaptures(a, b, sortConfig.key))

    return sortConfig.direction === 'asc' ? sorted : sorted.reverse()
  }, [captures, sortConfig])

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
    <div className="pokemon-capture-table__wrapper">
      <table className="pokemon-capture-table">
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
                    className="pokemon-capture-table__sort-button"
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
                      <ArrowUpDown aria-hidden="true" className="pokemon-capture-table__sort-icon--idle" />
                    )}
                  </button>
                </th>
              )
            })}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedCaptures.map((capture) => (
            <tr key={capture.id}>
              <td>{capture.zone}</td>
              <td>{capture.capturedPokemon}</td>
              <td>{capture.status}</td>
              <td>
                <div className="pokemon-capture-table__actions">
                  <button
                    type="button"
                    className="pokemon-capture-table__action"
                    aria-label={`Modifier ${capture.capturedPokemon}`}
                    onClick={() => onEdit(capture)}
                  >
                    <Pencil aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="pokemon-capture-table__action pokemon-capture-table__action--danger"
                    aria-label={`Supprimer ${capture.capturedPokemon}`}
                    onClick={() => onDelete(capture)}
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
