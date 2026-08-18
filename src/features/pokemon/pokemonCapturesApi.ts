import { supabase } from '../../lib/supabaseClient'

export type PokemonCaptureStatus = 'Vivant' | 'Mort'

export interface PokemonCapture {
  id: string
  zone: string
  capturedPokemon: string
  status: PokemonCaptureStatus
}

export interface FetchPokemonCapturesResult {
  captures: PokemonCapture[]
  error: string | null
}

export interface PokemonCaptureInput {
  zone: string
  capturedPokemon: string
  status: PokemonCaptureStatus
}

export interface PokemonCaptureMutationResult {
  error: string | null
}

/**
 * Récupère les Pokémon capturés pour un jeu donné, triés par zone. Le
 * filtrage par utilisateur est assuré par les policies Row Level
 * Security de la table pokemon_captures, aucun filtre manuel n'est
 * nécessaire ici.
 * @param pokemonGameId identifiant du jeu Pokémon concerné
 * @returns la liste des captures, et un message d'erreur si la récupération a échoué
 */
export async function fetchPokemonCaptures(
  pokemonGameId: string,
): Promise<FetchPokemonCapturesResult> {
  const { data, error } = await supabase
    .from('pokemon_captures')
    .select('id, zone, captured_pokemon, status')
    .eq('pokemon_game_id', pokemonGameId)
    .order('zone', { ascending: true })

  if (error) {
    return { captures: [], error: error.message }
  }

  const captures: PokemonCapture[] = (data ?? []).map((row) => ({
    id: row.id,
    zone: row.zone,
    capturedPokemon: row.captured_pokemon,
    status: row.status,
  }))

  return { captures, error: null }
}

/**
 * Crée une nouvelle capture pour un jeu Pokémon donné.
 * @param pokemonGameId identifiant du jeu Pokémon concerné
 * @param input valeurs saisies dans le formulaire (zone, Pokémon capturé, statut)
 * @returns un message d'erreur si la création a échoué, ou null si elle a réussi
 */
export async function createPokemonCapture(
  pokemonGameId: string,
  input: PokemonCaptureInput,
): Promise<PokemonCaptureMutationResult> {
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return { error: userError?.message ?? "Utilisateur non authentifié." }
  }

  const { error } = await supabase.from('pokemon_captures').insert({
    user_id: userData.user.id,
    pokemon_game_id: pokemonGameId,
    zone: input.zone,
    captured_pokemon: input.capturedPokemon,
    status: input.status,
  })

  return { error: error ? error.message : null }
}

/**
 * Met à jour une capture existante. Seuls les champs présents dans
 * partialInput sont modifiés, les autres restent inchangés.
 * @param id identifiant de la capture à modifier
 * @param partialInput champs à mettre à jour
 * @returns un message d'erreur si la mise à jour a échoué, ou null si elle a réussi
 */
export async function updatePokemonCapture(
  id: string,
  partialInput: Partial<PokemonCaptureInput>,
): Promise<PokemonCaptureMutationResult> {
  const payload: Record<string, unknown> = {}

  if (partialInput.zone !== undefined) {
    payload.zone = partialInput.zone
  }
  if (partialInput.capturedPokemon !== undefined) {
    payload.captured_pokemon = partialInput.capturedPokemon
  }
  if (partialInput.status !== undefined) {
    payload.status = partialInput.status
  }

  const { error } = await supabase.from('pokemon_captures').update(payload).eq('id', id)

  return { error: error ? error.message : null }
}

/**
 * Supprime définitivement une capture.
 * @param id identifiant de la capture à supprimer
 * @returns un message d'erreur si la suppression a échoué, ou null si elle a réussi
 */
export async function deletePokemonCapture(id: string): Promise<PokemonCaptureMutationResult> {
  const { error } = await supabase.from('pokemon_captures').delete().eq('id', id)

  return { error: error ? error.message : null }
}
