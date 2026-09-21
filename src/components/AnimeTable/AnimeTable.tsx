import { Fragment, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import type { Anime } from '../../features/animes/animesApi'
import { AnimeSeasonsPanel } from '../AnimeSeasonsPanel/AnimeSeasonsPanel'
import './AnimeTable.css'

interface AnimeTableProps {
  animes: Anime[]
  /**
   * Nombre total d'épisodes par anime (toutes saisons confondues), indexé
   * par identifiant d'anime. Calculé côté frontend, jamais stocké en base.
   */
  episodeTotals: Record<string, number>
  onEdit: (anime: Anime) => void
  onDelete: (anime: Anime) => void
  /**
   * Appelé lorsqu'une saison a été ajoutée, modifiée, supprimée ou
   * incrémentée dans un panneau déplié, pour recalculer episodeTotals.
   */
  onSeasonsChanged: () => void
}

type SortDirection = 'asc' | 'desc'

/**
 * Affiche la liste des animes de l'utilisateur, triable par titre. Le
 * nombre total d'épisodes (toutes saisons confondues, calculé côté
 * frontend via episodeTotals) est affiché à côté du titre. Chaque ligne
 * peut être dépliée pour révéler ses saisons (nombre d'épisodes, statut et
 * actions propres à chaque saison), gérées par AnimeSeasonsPanel. Le tri
 * est purement visuel et s'applique aux données reçues en props, sans
 * appel réseau.
 */
export function AnimeTable({ animes, episodeTotals, onEdit, onDelete, onSeasonsChanged }: AnimeTableProps) {
  const [sortDirection, setSortDirection] = useState<SortDirection | null>(null)
  const [expandedAnimeIds, setExpandedAnimeIds] = useState<Set<string>>(new Set())

  const sortedAnimes = useMemo(() => {
    if (!sortDirection) {
      return animes
    }

    const sorted = [...animes].sort((a, b) => a.title.localeCompare(b.title, 'fr'))

    return sortDirection === 'asc' ? sorted : sorted.reverse()
  }, [animes, sortDirection])

  /**
   * Active le tri par titre, ou inverse son sens s'il est déjà actif.
   * @returns rien, la fonction agit uniquement par effet de bord (état de tri)
   */
  function handleSort() {
    setSortDirection((previous) => (previous === 'asc' ? 'desc' : 'asc'))
  }

  /**
   * Déplie ou replie la ligne d'un anime pour afficher ou masquer ses
   * saisons.
   * @param animeId identifiant de l'anime dont la ligne vient d'être cliquée
   * @returns rien, la fonction agit uniquement par effet de bord (état d'affichage)
   */
  function toggleExpanded(animeId: string) {
    setExpandedAnimeIds((previous) => {
      const next = new Set(previous)

      if (next.has(animeId)) {
        next.delete(animeId)
      } else {
        next.add(animeId)
      }

      return next
    })
  }

  return (
    <div className="anime-table__wrapper">
      <table className="anime-table">
        <thead>
          <tr>
            <th className="anime-table__col-toggle" aria-hidden="true" />
            <th
              aria-sort={
                sortDirection ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'
              }
            >
              <button type="button" className="anime-table__sort-button" onClick={handleSort}>
                Titre
                {sortDirection ? (
                  sortDirection === 'asc' ? (
                    <ArrowUp aria-hidden="true" />
                  ) : (
                    <ArrowDown aria-hidden="true" />
                  )
                ) : (
                  <ArrowUpDown aria-hidden="true" className="anime-table__sort-icon--idle" />
                )}
              </button>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedAnimes.map((anime) => {
            const isExpanded = expandedAnimeIds.has(anime.id)

            return (
              <Fragment key={anime.id}>
                <tr>
                  <td className="anime-table__col-toggle">
                    <button
                      type="button"
                      className="anime-table__toggle"
                      aria-label={isExpanded ? `Replier ${anime.title}` : `Déplier ${anime.title}`}
                      aria-expanded={isExpanded}
                      onClick={() => toggleExpanded(anime.id)}
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
                      className="anime-table__title-button"
                      onClick={() => toggleExpanded(anime.id)}
                    >
                      {anime.title}
                    </button>
                    <span className="anime-table__episode-total">
                      {episodeTotals[anime.id] ?? 0} épisode{(episodeTotals[anime.id] ?? 0) > 1 ? 's' : ''}
                    </span>
                  </td>
                  <td>
                    <div className="anime-table__actions">
                      <button
                        type="button"
                        className="anime-table__action"
                        aria-label={`Modifier ${anime.title}`}
                        onClick={() => onEdit(anime)}
                      >
                        <Pencil aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="anime-table__action anime-table__action--danger"
                        aria-label={`Supprimer ${anime.title}`}
                        onClick={() => onDelete(anime)}
                      >
                        <Trash2 aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="anime-table__seasons-row">
                    <td colSpan={3}>
                      <AnimeSeasonsPanel animeId={anime.id} onSeasonsChanged={onSeasonsChanged} />
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
