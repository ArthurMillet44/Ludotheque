import { supabase } from '../../lib/supabaseClient'

export interface SkyrimMod {
  id: string
  modName: string
  version: string | null
  category: string | null
  deployOrder: number
}

export interface FetchSkyrimModsResult {
  mods: SkyrimMod[]
  error: string | null
}

export interface SkyrimModInput {
  modName: string
  version: string | null
  category: string | null
  deployOrder: number
}

export interface SkyrimModMutationResult {
  error: string | null
}

/**
 * Récupère les mods installés pour un modpack donné, triés par ordre
 * de déploiement. Le filtrage par utilisateur est assuré par les
 * policies Row Level Security de la table skyrim_mod_list, aucun
 * filtre manuel n'est nécessaire ici.
 * @param skyrimModpackId identifiant du modpack Skyrim concerné
 * @returns la liste des mods, et un message d'erreur si la récupération a échoué
 */
export async function fetchSkyrimMods(skyrimModpackId: string): Promise<FetchSkyrimModsResult> {
  const { data, error } = await supabase
    .from('skyrim_mod_list')
    .select('id, mod_name, version, category, deploy_order')
    .eq('skyrim_modpack_id', skyrimModpackId)
    .order('deploy_order', { ascending: true })

  if (error) {
    return { mods: [], error: error.message }
  }

  const mods: SkyrimMod[] = (data ?? []).map((row) => ({
    id: row.id,
    modName: row.mod_name,
    version: row.version,
    category: row.category,
    deployOrder: row.deploy_order,
  }))

  return { mods, error: null }
}

/**
 * Crée un nouveau mod pour un modpack Skyrim donné.
 * @param skyrimModpackId identifiant du modpack Skyrim concerné
 * @param input valeurs saisies dans le formulaire (nom, version, catégorie, ordre de déploiement)
 * @returns un message d'erreur si la création a échoué, ou null si elle a réussi
 */
export async function createSkyrimMod(
  skyrimModpackId: string,
  input: SkyrimModInput,
): Promise<SkyrimModMutationResult> {
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return { error: userError?.message ?? "Utilisateur non authentifié." }
  }

  const { error } = await supabase.from('skyrim_mod_list').insert({
    user_id: userData.user.id,
    skyrim_modpack_id: skyrimModpackId,
    mod_name: input.modName,
    version: input.version,
    category: input.category,
    deploy_order: input.deployOrder,
  })

  return { error: error ? error.message : null }
}

/**
 * Met à jour un mod existant. Seuls les champs présents dans
 * partialInput sont modifiés, les autres restent inchangés.
 * @param id identifiant du mod à modifier
 * @param partialInput champs à mettre à jour
 * @returns un message d'erreur si la mise à jour a échoué, ou null si elle a réussi
 */
export async function updateSkyrimMod(
  id: string,
  partialInput: Partial<SkyrimModInput>,
): Promise<SkyrimModMutationResult> {
  const payload: Record<string, unknown> = {}

  if (partialInput.modName !== undefined) {
    payload.mod_name = partialInput.modName
  }
  if (partialInput.version !== undefined) {
    payload.version = partialInput.version
  }
  if (partialInput.category !== undefined) {
    payload.category = partialInput.category
  }
  if (partialInput.deployOrder !== undefined) {
    payload.deploy_order = partialInput.deployOrder
  }

  const { error } = await supabase.from('skyrim_mod_list').update(payload).eq('id', id)

  return { error: error ? error.message : null }
}

/**
 * Supprime définitivement un mod.
 * @param id identifiant du mod à supprimer
 * @returns un message d'erreur si la suppression a échoué, ou null si elle a réussi
 */
export async function deleteSkyrimMod(id: string): Promise<SkyrimModMutationResult> {
  const { error } = await supabase.from('skyrim_mod_list').delete().eq('id', id)

  return { error: error ? error.message : null }
}

/**
 * Filtre une liste de mods selon un texte recherché dans le nom du
 * mod ou la catégorie, sans tenir compte de la casse. Renvoie la
 * liste complète si la recherche est vide.
 * @param mods liste de mods à filtrer
 * @param query texte recherché
 * @returns les mods dont le nom ou la catégorie contient le texte recherché
 */
export function filterSkyrimMods(mods: SkyrimMod[], query: string): SkyrimMod[] {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return mods
  }

  return mods.filter(
    (mod) =>
      mod.modName.toLowerCase().includes(normalizedQuery) ||
      (mod.category ?? '').toLowerCase().includes(normalizedQuery),
  )
}
