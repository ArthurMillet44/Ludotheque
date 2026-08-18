import { supabase } from '../../lib/supabaseClient'

export interface PokemonGame {
  id: string
  name: string
}

export interface FetchPokemonGamesResult {
  games: PokemonGame[]
  error: string | null
}

export interface PokemonMutationResult {
  error: string | null
}

export interface FetchPokemonGameResult {
  game: PokemonGame | null
  error: string | null
}

/**
 * Récupère la liste des jeux Pokémon de l'utilisateur connecté, triée
 * par nom. Le filtrage par utilisateur est assuré par les policies Row
 * Level Security de la table pokemon_games, aucun filtre manuel n'est
 * nécessaire ici.
 * @returns la liste des jeux, et un message d'erreur si la récupération a échoué
 */
export async function fetchPokemonGames(): Promise<FetchPokemonGamesResult> {
  const { data, error } = await supabase
    .from('pokemon_games')
    .select('id, name')
    .order('name', { ascending: true })

  if (error) {
    return { games: [], error: error.message }
  }

  return { games: data ?? [], error: null }
}

/**
 * Récupère un jeu Pokémon précis par son identifiant.
 * @param id identifiant du jeu recherché
 * @returns le jeu correspondant (ou null s'il n'existe pas), et un message d'erreur si la récupération a échoué
 */
export async function fetchPokemonGameById(id: string): Promise<FetchPokemonGameResult> {
  const { data, error } = await supabase
    .from('pokemon_games')
    .select('id, name')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    return { game: null, error: error.message }
  }

  return { game: data, error: null }
}

/**
 * Crée un nouveau jeu Pokémon pour l'utilisateur actuellement connecté.
 * @param name nom du jeu saisi par l'utilisateur
 * @returns un message d'erreur si la création a échoué, ou null si elle a réussi
 */
export async function createPokemonGame(name: string): Promise<PokemonMutationResult> {
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return { error: userError?.message ?? "Utilisateur non authentifié." }
  }

  const { error } = await supabase.from('pokemon_games').insert({
    user_id: userData.user.id,
    name,
  })

  return { error: error ? error.message : null }
}

/**
 * Met à jour le nom d'un jeu Pokémon existant.
 * @param id identifiant du jeu à modifier
 * @param name nouveau nom du jeu
 * @returns un message d'erreur si la mise à jour a échoué, ou null si elle a réussi
 */
export async function updatePokemonGame(id: string, name: string): Promise<PokemonMutationResult> {
  const { error } = await supabase.from('pokemon_games').update({ name }).eq('id', id)

  return { error: error ? error.message : null }
}

/**
 * Supprime définitivement un jeu Pokémon.
 * @param id identifiant du jeu à supprimer
 * @returns un message d'erreur si la suppression a échoué, ou null si elle a réussi
 */
export async function deletePokemonGame(id: string): Promise<PokemonMutationResult> {
  const { error } = await supabase.from('pokemon_games').delete().eq('id', id)

  return { error: error ? error.message : null }
}
