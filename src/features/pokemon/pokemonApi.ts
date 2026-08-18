import { supabase } from '../../lib/supabaseClient'

export interface PokemonMutationResult {
  error: string | null
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
