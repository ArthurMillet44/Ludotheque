import { supabase } from '../../lib/supabaseClient'

export type MangaSeasonStatus = 'En cours' | 'Terminé' | 'En pause'

export interface MangaSeason {
  id: string
  mangaListId: string
  label: string
  chapters: number | null
  status: MangaSeasonStatus
}

export interface FetchMangaSeasonsResult {
  seasons: MangaSeason[]
  error: string | null
}

export interface MangaSeasonInput {
  label: string
  chapters: number | null
  status: MangaSeasonStatus
}

export interface MangaSeasonMutationResult {
  error: string | null
}

export interface FetchMangaChapterTotalsResult {
  /** Nombre total de chapitres par manga (somme de toutes ses saisons), indexé par manga_list_id. */
  totals: Record<string, number>
  error: string | null
}

/**
 * Récupère les saisons d'un manga donné, triées par ordre de création (le
 * libellé étant un texte libre, un tri alphabétique n'aurait pas de sens :
 * "Saison 10" passerait avant "Saison 2"). Le filtrage par utilisateur est
 * assuré par les policies Row Level Security de la table manga_season_list,
 * aucun filtre manuel n'est nécessaire ici.
 * @param mangaListId identifiant du manga concerné
 * @returns la liste des saisons, et un message d'erreur si la récupération a échoué
 */
export async function fetchMangaSeasons(mangaListId: string): Promise<FetchMangaSeasonsResult> {
  const { data, error } = await supabase
    .from('manga_season_list')
    .select('id, manga_list_id, label, chapters, status, created_at')
    .eq('manga_list_id', mangaListId)
    .order('created_at', { ascending: true })

  if (error) {
    return { seasons: [], error: error.message }
  }

  const seasons: MangaSeason[] = (data ?? []).map((row) => ({
    id: row.id,
    mangaListId: row.manga_list_id,
    label: row.label,
    chapters: row.chapters,
    status: row.status,
  }))

  return { seasons, error: null }
}

/**
 * Crée une nouvelle saison pour un manga donné.
 * @param mangaListId identifiant du manga concerné
 * @param input valeurs saisies dans le formulaire (libellé, chapitres, statut)
 * @returns un message d'erreur si la création a échoué, ou null si elle a réussi
 */
export async function createMangaSeason(
  mangaListId: string,
  input: MangaSeasonInput,
): Promise<MangaSeasonMutationResult> {
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return { error: userError?.message ?? "Utilisateur non authentifié." }
  }

  const { error } = await supabase.from('manga_season_list').insert({
    user_id: userData.user.id,
    manga_list_id: mangaListId,
    label: input.label,
    chapters: input.chapters,
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
export async function updateMangaSeason(
  id: string,
  partialInput: Partial<MangaSeasonInput>,
): Promise<MangaSeasonMutationResult> {
  const payload: Record<string, unknown> = {}

  if (partialInput.label !== undefined) {
    payload.label = partialInput.label
  }
  if (partialInput.chapters !== undefined) {
    payload.chapters = partialInput.chapters
  }
  if (partialInput.status !== undefined) {
    payload.status = partialInput.status
  }

  const { error } = await supabase.from('manga_season_list').update(payload).eq('id', id)

  return { error: error ? error.message : null }
}

/**
 * Supprime définitivement une saison.
 * @param id identifiant de la saison à supprimer
 * @returns un message d'erreur si la suppression a échoué, ou null si elle a réussi
 */
export async function deleteMangaSeason(id: string): Promise<MangaSeasonMutationResult> {
  const { error } = await supabase.from('manga_season_list').delete().eq('id', id)

  return { error: error ? error.message : null }
}

/**
 * Calcule, pour chaque manga de l'utilisateur connecté, le nombre total de
 * chapitres toutes saisons confondues. Cette somme n'est jamais stockée en
 * base : elle est recalculée à la volée à partir des saisons existantes, en
 * une seule requête plutôt qu'une par manga. Le filtrage par utilisateur est
 * assuré par les policies Row Level Security de la table manga_season_list.
 * @returns le total de chapitres par manga (manga_list_id -> total), et un message d'erreur si la récupération a échoué
 */
export async function fetchMangaChapterTotals(): Promise<FetchMangaChapterTotalsResult> {
  const { data, error } = await supabase.from('manga_season_list').select('manga_list_id, chapters')

  if (error) {
    return { totals: {}, error: error.message }
  }

  const totals: Record<string, number> = {}

  for (const row of data ?? []) {
    totals[row.manga_list_id] = (totals[row.manga_list_id] ?? 0) + (row.chapters ?? 0)
  }

  return { totals, error: null }
}

/**
 * Propose un libellé par défaut pour une nouvelle saison, à partir du
 * nombre de saisons déjà chargées pour le manga. Reste entièrement
 * modifiable dans le formulaire (par ex. "Tome hors-série" à la place de
 * "Saison X").
 * @param seasons saisons déjà existantes pour le manga
 * @returns le libellé par défaut proposé (ex. "Saison 1" si aucune saison n'existe encore)
 */
export function getNextMangaSeasonLabel(seasons: MangaSeason[]): string {
  return `Saison ${seasons.length + 1}`
}
