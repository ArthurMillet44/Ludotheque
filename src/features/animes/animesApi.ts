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

export interface AnimeInput {
  title: string
  episodes: number | null
  status: AnimeStatus
  currentSeason: number | null
  comment: string | null
}

export interface AnimeMutationResult {
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

/**
 * Crée un nouvel anime pour l'utilisateur actuellement connecté.
 * @param input valeurs saisies dans le formulaire (titre, épisodes, statut, saison, commentaire)
 * @returns un message d'erreur si la création a échoué, ou null si elle a réussi
 */
export async function createAnime(input: AnimeInput): Promise<AnimeMutationResult> {
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return { error: userError?.message ?? "Utilisateur non authentifié." }
  }

  const { error } = await supabase.from('anime_list').insert({
    user_id: userData.user.id,
    title: input.title,
    episodes: input.episodes,
    status: input.status,
    current_season: input.currentSeason,
    comment: input.comment,
  })

  return { error: error ? error.message : null }
}

/**
 * Met à jour un anime existant. Seuls les champs présents dans
 * partialInput sont modifiés, les autres restent inchangés.
 * @param id identifiant de l'anime à modifier
 * @param partialInput champs à mettre à jour
 * @returns un message d'erreur si la mise à jour a échoué, ou null si elle a réussi
 */
export async function updateAnime(
  id: string,
  partialInput: Partial<AnimeInput>,
): Promise<AnimeMutationResult> {
  const payload: Record<string, unknown> = {}

  if (partialInput.title !== undefined) {
    payload.title = partialInput.title
  }
  if (partialInput.episodes !== undefined) {
    payload.episodes = partialInput.episodes
  }
  if (partialInput.status !== undefined) {
    payload.status = partialInput.status
  }
  if (partialInput.currentSeason !== undefined) {
    payload.current_season = partialInput.currentSeason
  }
  if (partialInput.comment !== undefined) {
    payload.comment = partialInput.comment
  }

  const { error } = await supabase.from('anime_list').update(payload).eq('id', id)

  return { error: error ? error.message : null }
}

/**
 * Supprime définitivement un anime.
 * @param id identifiant de l'anime à supprimer
 * @returns un message d'erreur si la suppression a échoué, ou null si elle a réussi
 */
export async function deleteAnime(id: string): Promise<AnimeMutationResult> {
  const { error } = await supabase.from('anime_list').delete().eq('id', id)

  return { error: error ? error.message : null }
}

/**
 * Filtre une liste d'animes selon un texte recherché dans le titre,
 * sans tenir compte de la casse. Renvoie la liste complète si la
 * recherche est vide.
 * @param animes liste d'animes à filtrer
 * @param query texte recherché
 * @returns les animes dont le titre contient le texte recherché
 */
export function filterAnimesByTitle(animes: Anime[], query: string): Anime[] {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return animes
  }

  return animes.filter((anime) => anime.title.toLowerCase().includes(normalizedQuery))
}
