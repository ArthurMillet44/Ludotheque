import type { Anime } from '../../features/animes/animesApi'
import './AnimeTable.css'

interface AnimeTableProps {
  animes: Anime[]
}

/**
 * Affiche la liste des animes sous forme de tableau (titre, épisodes,
 * statut, saison en cours, commentaire). Ne gère aucune interaction,
 * uniquement l'affichage des données reçues en props.
 */
export function AnimeTable({ animes }: AnimeTableProps) {
  return (
    <div className="anime-table__wrapper">
      <table className="anime-table">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Épisodes</th>
            <th>Statut</th>
            <th>Saison</th>
            <th>Commentaire</th>
          </tr>
        </thead>
        <tbody>
          {animes.map((anime) => (
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
