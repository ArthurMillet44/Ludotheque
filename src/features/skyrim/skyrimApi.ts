import { supabase } from '../../lib/supabaseClient'

export interface SkyrimModpack {
  id: string
  name: string
}

export interface FetchSkyrimModpacksResult {
  modpacks: SkyrimModpack[]
  error: string | null
}

export interface SkyrimModpackMutationResult {
  error: string | null
}

/**
 * Récupère la liste des modpacks Skyrim de l'utilisateur connecté,
 * triée par nom. Le filtrage par utilisateur est assuré par les
 * policies Row Level Security de la table skyrim_modpack, aucun
 * filtre manuel n'est nécessaire ici.
 * @returns la liste des modpacks, et un message d'erreur si la récupération a échoué
 */
export async function fetchSkyrimModpacks(): Promise<FetchSkyrimModpacksResult> {
  const { data, error } = await supabase
    .from('skyrim_modpack')
    .select('id, name')
    .order('name', { ascending: true })

  if (error) {
    return { modpacks: [], error: error.message }
  }

  return { modpacks: data ?? [], error: null }
}

/**
 * Crée un nouveau modpack Skyrim pour l'utilisateur actuellement
 * connecté.
 * @param name nom du modpack saisi par l'utilisateur
 * @returns un message d'erreur si la création a échoué, ou null si elle a réussi
 */
export async function createSkyrimModpack(name: string): Promise<SkyrimModpackMutationResult> {
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return { error: userError?.message ?? "Utilisateur non authentifié." }
  }

  const { error } = await supabase.from('skyrim_modpack').insert({
    user_id: userData.user.id,
    name,
  })

  return { error: error ? error.message : null }
}

/**
 * Met à jour le nom d'un modpack Skyrim existant.
 * @param id identifiant du modpack à modifier
 * @param name nouveau nom du modpack
 * @returns un message d'erreur si la mise à jour a échoué, ou null si elle a réussi
 */
export async function updateSkyrimModpack(
  id: string,
  name: string,
): Promise<SkyrimModpackMutationResult> {
  const { error } = await supabase.from('skyrim_modpack').update({ name }).eq('id', id)

  return { error: error ? error.message : null }
}

/**
 * Supprime définitivement un modpack Skyrim.
 * @param id identifiant du modpack à supprimer
 * @returns un message d'erreur si la suppression a échoué, ou null si elle a réussi
 */
export async function deleteSkyrimModpack(id: string): Promise<SkyrimModpackMutationResult> {
  const { error } = await supabase.from('skyrim_modpack').delete().eq('id', id)

  return { error: error ? error.message : null }
}
