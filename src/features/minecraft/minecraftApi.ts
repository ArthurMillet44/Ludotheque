import { supabase } from '../../lib/supabaseClient'

export interface MinecraftGame {
  id: string
  name: string
}

export interface FetchMinecraftGamesResult {
  games: MinecraftGame[]
  error: string | null
}

export interface FetchMinecraftGameResult {
  game: MinecraftGame | null
  error: string | null
}

export interface MinecraftGameMutationResult {
  error: string | null
}

/**
 * Récupère la liste des parties Minecraft random de l'utilisateur
 * connecté, triée par nom. Le filtrage par utilisateur est assuré par les
 * policies Row Level Security de la table minecraft_game_list, aucun
 * filtre manuel n'est nécessaire ici.
 * @returns la liste des parties, et un message d'erreur si la récupération a échoué
 */
export async function fetchMinecraftGames(): Promise<FetchMinecraftGamesResult> {
  const { data, error } = await supabase
    .from('minecraft_game_list')
    .select('id, name')
    .order('name', { ascending: true })

  if (error) {
    return { games: [], error: error.message }
  }

  return { games: data ?? [], error: null }
}

/**
 * Récupère une partie Minecraft précise par son identifiant.
 * @param id identifiant de la partie recherchée
 * @returns la partie correspondante (ou null si elle n'existe pas), et un message d'erreur si la récupération a échoué
 */
export async function fetchMinecraftGameById(id: string): Promise<FetchMinecraftGameResult> {
  const { data, error } = await supabase
    .from('minecraft_game_list')
    .select('id, name')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    return { game: null, error: error.message }
  }

  return { game: data, error: null }
}

/**
 * Crée une nouvelle partie Minecraft random pour l'utilisateur
 * actuellement connecté.
 * @param name nom de la partie saisi par l'utilisateur
 * @returns un message d'erreur si la création a échoué, ou null si elle a réussi
 */
export async function createMinecraftGame(name: string): Promise<MinecraftGameMutationResult> {
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return { error: userError?.message ?? "Utilisateur non authentifié." }
  }

  const { error } = await supabase.from('minecraft_game_list').insert({
    user_id: userData.user.id,
    name,
  })

  return { error: error ? error.message : null }
}

/**
 * Met à jour le nom d'une partie Minecraft existante.
 * @param id identifiant de la partie à modifier
 * @param name nouveau nom de la partie
 * @returns un message d'erreur si la mise à jour a échoué, ou null si elle a réussi
 */
export async function updateMinecraftGame(
  id: string,
  name: string,
): Promise<MinecraftGameMutationResult> {
  const { error } = await supabase.from('minecraft_game_list').update({ name }).eq('id', id)

  return { error: error ? error.message : null }
}

/**
 * Supprime définitivement une partie Minecraft, ainsi que tout son
 * historique (suppression en cascade gérée par la base de données).
 * @param id identifiant de la partie à supprimer
 * @returns un message d'erreur si la suppression a échoué, ou null si elle a réussi
 */
export async function deleteMinecraftGame(id: string): Promise<MinecraftGameMutationResult> {
  const { error } = await supabase.from('minecraft_game_list').delete().eq('id', id)

  return { error: error ? error.message : null }
}
