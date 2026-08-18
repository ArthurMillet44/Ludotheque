import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import type { Anime } from '../../features/animes/animesApi'
import './AnimeTable.css'

interface AnimeTableProps {
  animes: Anime[]
}

type SortKey = 'title' | 'episodes' | 'status' | 'currentSeason'
type SortDirection = 'asc' | 'desc'

interface SortConfig {
  key: SortKey
  direction: SortDirection
}

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'title', label: 'Titre' },
  { key: 'episodes', label: 'Épisodes' },
  { key: 'status', label: 'Statut' },
  { key: 'currentSeason', label: 'Saison' },
]

/**
 * Compare deux animes selon la colonne de tri donnée. Les valeurs
 * manquantes (épisodes ou saison inconnus) sont toujours placées en
 * fin de liste, quel que soit le sens du tri.
 * @param a premier anime à comparer
 * @param b second anime à comparer
 * @param key colonne sur laquelle trier
 * @returns un nombre négatif, nul ou positif selon l'ordre relatif de a et b
 */
function compareAnimes(a: Anime, b: Anime, key: SortKey): number {
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
 * Affiche la liste des animes sous forme de tableau triable (titre,
 * épisodes, statut, saison en cours, commentaire). Le tri est purement
 * visuel et s'applique aux données reçues en props, sans appel réseau.
 */
export function AnimeTable({ animes }: AnimeTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)

  const sortedAnimes = useMemo(() => {
    if (!sortConfig) {
      return animes
    }

    const sorted = [...animes].sort((a, b) => compareAnimes(a, b, sortConfig.key))

    return sortConfig.direction === 'asc' ? sorted : sorted.reverse()
  }, [animes, sortConfig])

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
    <div className="anime-table__wrapper">
      <table className="anime-table">
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
                    className="anime-table__sort-button"
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
                      <ArrowUpDown aria-hidden="true" className="anime-table__sort-icon--idle" />
                    )}
                  </button>
                </th>
              )
            })}
            <th>Commentaire</th>
          </tr>
        </thead>
        <tbody>
          {sortedAnimes.map((anime) => (
            <tr key={anime.id}>
              <td>{anime.title}</td>
              <td>{anime.episodes ?? '-'}</td>
              <td>{anime.status}</td>
              <td>{anime.currentSeason ?? '-'}</td>
              <td>{anime.comment ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
