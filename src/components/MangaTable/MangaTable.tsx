import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Plus, Trash2 } from 'lucide-react'
import type { Manga } from '../../features/mangas/mangasApi'
import './MangaTable.css'

interface MangaTableProps {
  mangas: Manga[]
  incrementingMangaId: string | null
  onIncrementChapter: (manga: Manga) => void
  onEdit: (manga: Manga) => void
  onDelete: (manga: Manga) => void
}

type SortKey = 'title' | 'chapters' | 'chaptersEn' | 'status' | 'currentSeason'
type SortDirection = 'asc' | 'desc'

interface SortConfig {
  key: SortKey
  direction: SortDirection
}

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'title', label: 'Titre' },
  { key: 'chapters', label: 'Chapitres' },
  { key: 'chaptersEn', label: 'Chapitres EN' },
  { key: 'status', label: 'Statut' },
  { key: 'currentSeason', label: 'Saison' },
]

/**
 * Compare deux mangas selon la colonne de tri donnée. Les valeurs
 * manquantes (chapitres ou saison inconnus) sont toujours placées en
 * fin de liste, quel que soit le sens du tri.
 * @param a premier manga à comparer
 * @param b second manga à comparer
 * @param key colonne sur laquelle trier
 * @returns un nombre négatif, nul ou positif selon l'ordre relatif de a et b
 */
function compareMangas(a: Manga, b: Manga, key: SortKey): number {
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
 * Affiche la liste des mangas sous forme de tableau triable (titre,
 * chapitres, chapitres en anglais, statut, saison en cours,
 * commentaire). Le tri est purement visuel et s'applique aux données
 * reçues en props, sans appel réseau.
 */
export function MangaTable({
  mangas,
  incrementingMangaId,
  onIncrementChapter,
  onEdit,
  onDelete,
}: MangaTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)

  const sortedMangas = useMemo(() => {
    if (!sortConfig) {
      return mangas
    }

    const sorted = [...mangas].sort((a, b) => compareMangas(a, b, sortConfig.key))

    return sortConfig.direction === 'asc' ? sorted : sorted.reverse()
  }, [mangas, sortConfig])

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
    <div className="manga-table__wrapper">
      <table className="manga-table">
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
                    className="manga-table__sort-button"
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
                      <ArrowUpDown aria-hidden="true" className="manga-table__sort-icon--idle" />
                    )}
                  </button>
                </th>
              )
            })}
            <th>Commentaire</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedMangas.map((manga) => (
            <tr key={manga.id}>
              <td>{manga.title}</td>
              <td>{manga.chapters ?? '-'}</td>
              <td>{manga.chaptersEn ?? '-'}</td>
              <td>{manga.status}</td>
              <td>{manga.currentSeason ?? '-'}</td>
              <td className="manga-table__cell--comment">{manga.comment ?? ''}</td>
              <td>
                <div className="manga-table__actions">
                  <button
                    type="button"
                    className="manga-table__action"
                    aria-label={`Ajouter un chapitre à ${manga.title}`}
                    disabled={incrementingMangaId === manga.id}
                    onClick={() => onIncrementChapter(manga)}
                  >
                    <Plus aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="manga-table__action"
                    aria-label={`Modifier ${manga.title}`}
                    onClick={() => onEdit(manga)}
                  >
                    <Pencil aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="manga-table__action manga-table__action--danger"
                    aria-label={`Supprimer ${manga.title}`}
                    onClick={() => onDelete(manga)}
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
