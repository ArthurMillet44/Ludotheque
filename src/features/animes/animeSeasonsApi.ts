import { supabase } from '../../lib/supabaseClient'

export type AnimeSeasonStatus = 'En cours' | 'Terminé' | 'En pause'

export interface AnimeSeason {
  id: string
  animeListId: string
  label: string
  episodes: number | null
  status: AnimeSeasonStatus
}

export interface FetchAnimeSeasonsResult {
  seasons: AnimeSeason[]
  error: string | null
}

export interface AnimeSeasonInput {
  label: string
  episodes: number | null
  status: AnimeSeasonStatus
}

export interface AnimeSeasonMutationResult {
  error: string | null
}

export interface FetchAnimeEpisodeTotalsResult {
  /** Nombre total d'épisodes par anime (somme de toutes ses saisons), indexé par anime_list_id. */
  totals: Record<string, number>
  error: string | null
}

/**
 * Récupère les saisons d'un anime donné, triées par ordre de création (le
 * libellé étant un texte libre, un tri alphabétique n'aurait pas de sens :
 * "Saison 10" passerait avant "Saison 2"). Le filtrage par utilisateur est
 * assuré par les policies Row Level Security de la table anime_season_list,
 * aucun filtre manuel n'est nécessaire ici.
 * @param animeListId identifiant de l'anime concerné
 * @returns la liste des saisons, et un message d'erreur si la récupération a échoué
 */
export async function fetchAnimeSeasons(animeListId: string): Promise<FetchAnimeSeasonsResult> {
  const { data, error } = await supabase
    .from('anime_season_list')
    .select('id, anime_list_id, label, episodes, status, created_at')
    .eq('anime_list_id', animeListId)
    .order('created_at', { ascending: true })

  if (error) {
    return { seasons: [], error: error.message }
  }

  const seasons: AnimeSeason[] = (data ?? []).map((row) => ({
    id: row.id,
    animeListId: row.anime_list_id,
    label: row.label,
    episodes: row.episodes,
    status: row.status,
  }))

  return { seasons, error: null }
}

/**
 * Crée une nouvelle saison pour un anime donné.
 * @param animeListId identifiant de l'anime concerné
 * @param input valeurs saisies dans le formulaire (libellé, épisodes, statut)
 * @returns un message d'erreur si la création a échoué, ou null si elle a réussi
 */
export async function createAnimeSeason(
  animeListId: string,
  input: AnimeSeasonInput,
): Promise<AnimeSeasonMutationResult> {
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return { error: userError?.message ?? "Utilisateur non authentifié." }
  }

  const { error } = await supabase.from('anime_season_list').insert({
    user_id: userData.user.id,
    anime_list_id: animeListId,
    label: input.label,
    episodes: input.episodes,
    status: input.status,
  })

  return { error: error ? error.message : null }
}

/**
 * Met à jour une saison existante. Seuls les champs présents dans
 * partialInput sont modifiés, les autres restent inchangés.
 * @param id identifiant de la saison à modifier
 * @param partialInput champs à mettre à jour
 * @returns un message d'erreur si la mise à jour a échoué, ou null si elle a réussi
 */
export async function updateAnimeSeason(
  id: string,
  partialInput: Partial<AnimeSeasonInput>,
): Promise<AnimeSeasonMutationResult> {
  const payload: Record<string, unknown> = {}

  if (partialInput.label !== undefined) {
    payload.label = partialInput.label
  }
  if (partialInput.episodes !== undefined) {
    payload.episodes = partialInput.episodes
  }
  if (partialInput.status !== undefined) {
    payload.status = partialInput.status
  }

  const { error } = await supabase.from('anime_season_list').update(payload).eq('id', id)

  return { error: error ? error.message : null }
}

/**
 * Supprime définitivement une saison.
 * @param id identifiant de la saison à supprimer
 * @returns un message d'erreur si la suppression a échoué, ou null si elle a réussi
 */
export async function deleteAnimeSeason(id: string): Promise<AnimeSeasonMutationResult> {
  const { error } = await supabase.from('anime_season_list').delete().eq('id', id)

  return { error: error ? error.message : null }
}

/**
 * Calcule, pour chaque anime de l'utilisateur connecté, le nombre total
 * d'épisodes toutes saisons confondues. Cette somme n'est jamais stockée en
 * base : elle est recalculée à la volée à partir des saisons existantes, en
 * une seule requête plutôt qu'une par anime. Le filtrage par utilisateur est
 * assuré par les policies Row Level Security de la table anime_season_list.
 * @returns le total d'épisodes par anime (anime_list_id -> total), et un message d'erreur si la récupération a échoué
 */
export async function fetchAnimeEpisodeTotals(): Promise<FetchAnimeEpisodeTotalsResult> {
  const { data, error } = await supabase.from('anime_season_list').select('anime_list_id, episodes')

  if (error) {
    return { totals: {}, error: error.message }
  }

  const totals: Record<string, number> = {}

  for (const row of data ?? []) {
    totals[row.anime_list_id] = (totals[row.anime_list_id] ?? 0) + (row.episodes ?? 0)
  }

  return { totals, error: null }
}

/**
 * Propose un libellé par défaut pour une nouvelle saison, à partir du
 * nombre de saisons déjà chargées pour l'anime. Reste entièrement
 * modifiable dans le formulaire (par ex. "Film" ou "OAV" à la place de
 * "Saison X").
 * @param seasons saisons déjà existantes pour l'anime
 * @returns le libellé par défaut proposé (ex. "Saison 1" si aucune saison n'existe encore)
 */
export function getNextAnimeSeasonLabel(seasons: AnimeSeason[]): string {
  return `Saison ${seasons.length + 1}`
}
