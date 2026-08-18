import { supabase } from '../../lib/supabaseClient'

export type AnimeStatus = 'En cours' | 'Terminé' | 'En pause'

export interface Anime {
  id: string
  title: string
  episodes: number | null
  status: AnimeStatus
  currentSeason: number | null
  comment: string | null
}

export interface FetchAnimesResult {
  animes: Anime[]
  error: string | null
}

/**
 * Récupère la liste des animes de l'utilisateur connecté, triée par
 * titre. Le filtrage par utilisateur est assuré par les policies Row
 * Level Security de la table anime_list, aucun filtre manuel n'est
 * nécessaire ici.
 * @returns la liste des animes, et un message d'erreur si la récupération a échoué
 */
export async function fetchAnimes(): Promise<FetchAnimesResult> {
  const { data, error } = await supabase
    .from('anime_list')
    .select('id, title, episodes, status, current_season, comment')
    .order('title', { ascending: true })

  if (error) {
    return { animes: [], error: error.message }
  }

  const animes: Anime[] = (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    episodes: row.episodes,
    status: row.status,
    currentSeason: row.current_season,
    comment: row.comment,
  }))

  return { animes, error: null }
}
