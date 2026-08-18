import { supabase } from '../../lib/supabaseClient'

export type MangaStatus = 'En cours' | 'Terminé' | 'En pause'

export interface Manga {
  id: string
  title: string
  chapters: number | null
  chaptersEn: number | null
  status: MangaStatus
  currentSeason: number | null
  comment: string | null
}

export interface FetchMangasResult {
  mangas: Manga[]
  error: string | null
}

export interface MangaInput {
  title: string
  chapters: number | null
  chaptersEn: number | null
  status: MangaStatus
  currentSeason: number | null
  comment: string | null
}

export interface MangaMutationResult {
  error: string | null
}

/**
 * Récupère la liste des mangas de l'utilisateur connecté, triée par
 * titre. Le filtrage par utilisateur est assuré par les policies Row
 * Level Security de la table manga_list, aucun filtre manuel n'est
 * nécessaire ici.
 * @returns la liste des mangas, et un message d'erreur si la récupération a échoué
 */
export async function fetchMangas(): Promise<FetchMangasResult> {
  const { data, error } = await supabase
    .from('manga_list')
    .select('id, title, chapters, chapters_en, status, current_season, comment')
    .order('title', { ascending: true })

  if (error) {
    return { mangas: [], error: error.message }
  }

  const mangas: Manga[] = (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    chapters: row.chapters,
    chaptersEn: row.chapters_en,
    status: row.status,
    currentSeason: row.current_season,
    comment: row.comment,
  }))

  return { mangas, error: null }
}

/**
 * Crée un nouveau manga pour l'utilisateur actuellement connecté.
 * @param input valeurs saisies dans le formulaire (titre, chapitres, chapitres en anglais, statut, saison, commentaire)
 * @returns un message d'erreur si la création a échoué, ou null si elle a réussi
 */
export async function createManga(input: MangaInput): Promise<MangaMutationResult> {
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return { error: userError?.message ?? "Utilisateur non authentifié." }
  }

  const { error } = await supabase.from('manga_list').insert({
    user_id: userData.user.id,
    title: input.title,
    chapters: input.chapters,
    chapters_en: input.chaptersEn,
    status: input.status,
    current_season: input.currentSeason,
    comment: input.comment,
  })

  return { error: error ? error.message : null }
}

/**
 * Met à jour un manga existant. Seuls les champs présents dans
 * partialInput sont modifiés, les autres restent inchangés.
 * @param id identifiant du manga à modifier
 * @param partialInput champs à mettre à jour
 * @returns un message d'erreur si la mise à jour a échoué, ou null si elle a réussi
 */
export async function updateManga(
  id: string,
  partialInput: Partial<MangaInput>,
): Promise<MangaMutationResult> {
  const payload: Record<string, unknown> = {}

  if (partialInput.title !== undefined) {
    payload.title = partialInput.title
  }
  if (partialInput.chapters !== undefined) {
    payload.chapters = partialInput.chapters
  }
  if (partialInput.chaptersEn !== undefined) {
    payload.chapters_en = partialInput.chaptersEn
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

  const { error } = await supabase.from('manga_list').update(payload).eq('id', id)

  return { error: error ? error.message : null }
}

/**
 * Supprime définitivement un manga.
 * @param id identifiant du manga à supprimer
 * @returns un message d'erreur si la suppression a échoué, ou null si elle a réussi
 */
export async function deleteManga(id: string): Promise<MangaMutationResult> {
  const { error } = await supabase.from('manga_list').delete().eq('id', id)

  return { error: error ? error.message : null }
}

/**
 * Filtre une liste de mangas selon un texte recherché dans le titre,
 * sans tenir compte de la casse. Renvoie la liste complète si la
 * recherche est vide.
 * @param mangas liste de mangas à filtrer
 * @param query texte recherché
 * @returns les mangas dont le titre contient le texte recherché
 */
export function filterMangasByTitle(mangas: Manga[], query: string): Manga[] {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return mangas
  }

  return mangas.filter((manga) => manga.title.toLowerCase().includes(normalizedQuery))
}
