import { Fragment, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import type { Manga } from '../../features/mangas/mangasApi'
import { MangaSeasonsPanel } from '../MangaSeasonsPanel/MangaSeasonsPanel'
import './MangaTable.css'

interface MangaTableProps {
  mangas: Manga[]
  onEdit: (manga: Manga) => void
  onDelete: (manga: Manga) => void
}

type SortDirection = 'asc' | 'desc'

/**
 * Affiche la liste des mangas de l'utilisateur, triable par titre.
 * Chaque ligne peut être dépliée pour révéler ses saisons (nombre de
 * chapitres, statut et actions propres à chaque saison), gérées par
 * MangaSeasonsPanel. Le tri est purement visuel et s'applique aux
 * données reçues en props, sans appel réseau.
 */
export function MangaTable({ mangas, onEdit, onDelete }: MangaTableProps) {
  const [sortDirection, setSortDirection] = useState<SortDirection | null>(null)
  const [expandedMangaIds, setExpandedMangaIds] = useState<Set<string>>(new Set())

  const sortedMangas = useMemo(() => {
    if (!sortDirection) {
      return mangas
    }

    const sorted = [...mangas].sort((a, b) => a.title.localeCompare(b.title, 'fr'))

    return sortDirection === 'asc' ? sorted : sorted.reverse()
  }, [mangas, sortDirection])

  /**
   * Active le tri par titre, ou inverse son sens s'il est déjà actif.
   * @returns rien, la fonction agit uniquement par effet de bord (état de tri)
   */
  function handleSort() {
    setSortDirection((previous) => (previous === 'asc' ? 'desc' : 'asc'))
  }

  /**
   * Déplie ou replie la ligne d'un manga pour afficher ou masquer ses
   * saisons.
   * @param mangaId identifiant du manga dont la ligne vient d'être cliquée
   * @returns rien, la fonction agit uniquement par effet de bord (état d'affichage)
   */
  function toggleExpanded(mangaId: string) {
    setExpandedMangaIds((previous) => {
      const next = new Set(previous)

      if (next.has(mangaId)) {
        next.delete(mangaId)
      } else {
        next.add(mangaId)
      }

      return next
    })
  }

  return (
    <div className="manga-table__wrapper">
      <table className="manga-table">
        <thead>
          <tr>
            <th className="manga-table__col-toggle" aria-hidden="true" />
            <th
              aria-sort={
                sortDirection ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'
              }
            >
              <button type="button" className="manga-table__sort-button" onClick={handleSort}>
                Titre
                {sortDirection ? (
                  sortDirection === 'asc' ? (
                    <ArrowUp aria-hidden="true" />
                  ) : (
                    <ArrowDown aria-hidden="true" />
                  )
                ) : (
                  <ArrowUpDown aria-hidden="true" className="manga-table__sort-icon--idle" />
                )}
              </button>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedMangas.map((manga) => {
            const isExpanded = expandedMangaIds.has(manga.id)

            return (
              <Fragment key={manga.id}>
                <tr>
                  <td className="manga-table__col-toggle">
                    <button
                      type="button"
                      className="manga-table__toggle"
                      aria-label={isExpanded ? `Replier ${manga.title}` : `Déplier ${manga.title}`}
                      aria-expanded={isExpanded}
                      onClick={() => toggleExpanded(manga.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown aria-hidden="true" />
                      ) : (
                        <ChevronRight aria-hidden="true" />
                      )}
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="manga-table__title-button"
                      onClick={() => toggleExpanded(manga.id)}
                    >
                      {manga.title}
                    </button>
                  </td>
                  <td>
                    <div className="manga-table__actions">
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
                {isExpanded && (
                  <tr className="manga-table__seasons-row">
                    <td colSpan={3}>
                      <MangaSeasonsPanel mangaId={manga.id} />
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
