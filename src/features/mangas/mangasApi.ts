import { supabase } from '../../lib/supabaseClient'

export interface Manga {
  id: string
  title: string
}

export interface FetchMangasResult {
  mangas: Manga[]
  error: string | null
}

export interface MangaInput {
  title: string
}

export interface MangaMutationResult {
  error: string | null
}

/**
 * Récupère la liste des mangas de l'utilisateur connecté, triée par
 * titre. Le nombre de chapitres, le statut et la saison sont désormais
 * portés par les saisons de chaque manga (voir mangaSeasonsApi). Le
 * filtrage par utilisateur est assuré par les policies Row Level
 * Security de la table manga_list, aucun filtre manuel n'est
 * nécessaire ici.
 * @returns la liste des mangas, et un message d'erreur si la récupération a échoué
 */
export async function fetchMangas(): Promise<FetchMangasResult> {
  const { data, error } = await supabase
    .from('manga_list')
    .select('id, title')
    .order('title', { ascending: true })

  if (error) {
    return { mangas: [], error: error.message }
  }

  const mangas: Manga[] = (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
  }))

  return { mangas, error: null }
}

/**
 * Crée un nouveau manga pour l'utilisateur actuellement connecté.
 * @param input valeurs saisies dans le formulaire (titre)
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
  })

  return { error: error ? error.message : null }
}

/**
 * Met à jour le titre d'un manga existant.
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

  const { error } = await supabase.from('manga_list').update(payload).eq('id', id)

  return { error: error ? error.message : null }
}

/**
 * Supprime définitivement un manga, ainsi que toutes ses saisons
 * (suppression en cascade gérée par la base de données).
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
