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
