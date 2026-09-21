import { supabase } from '../../lib/supabaseClient'

export type MinecraftHistoryType = 'bloc_casse' | 'craft' | 'pierre_a_tailler'

export type MinecraftHistoryCategory = 'armure' | 'outil' | 'potion' | 'nourriture' | 'bloc' | 'autre'

export interface MinecraftHistoryEntry {
  id: string
  minecraftGameId: string
  parentEntryId: string | null
  type: MinecraftHistoryType
  recipeHint: string | null
  /**
   * Catégorie optionnelle de la chaîne, réservée aux entrées de premier
   * niveau (parentEntryId à null) : une sous-entrée n'a pas de catégorie
   * propre, elle appartient à celle de sa chaîne.
   */
  category: MinecraftHistoryCategory | null
  /**
   * Items en entrée de cette action. Toujours un seul élément pour craft et
   * pierre_a_tailler (une recette n'a qu'un seul item d'entrée), mais peut en
   * contenir plusieurs pour bloc_casse (plusieurs blocs différents peuvent
   * normalement donner le même résultat, ex. plusieurs essences de planches
   * regroupées sous le même résultat randomisé).
   */
  inputItems: string[]
  /**
   * Items obtenus par cette entrée. Toujours un seul élément pour craft et
   * pierre_a_tailler (une recette ne donne qu'un seul type d'objet à la
   * fois), mais peut en contenir plusieurs pour bloc_casse (casser un bloc
   * peut donner plusieurs items différents en une fois).
   */
  outputItems: string[]
}

export interface MinecraftHistoryTreeNode {
  entry: MinecraftHistoryEntry
  children: MinecraftHistoryTreeNode[]
}

export interface FetchMinecraftHistoryResult {
  entries: MinecraftHistoryEntry[]
  error: string | null
}

export interface MinecraftHistoryInput {
  parentEntryId: string | null
  type: MinecraftHistoryType
  recipeHint: string | null
  category: MinecraftHistoryCategory | null
  inputItems: string[]
  outputItems: string[]
}

export interface MinecraftHistoryMutationResult {
  error: string | null
}

/**
 * Récupère l'historique d'une partie Minecraft donnée, trié par ordre de
 * création (l'ordre dans lequel les entrées ont été ajoutées). La mise en
 * arbre (regroupement des sous-entrées sous leur parent) se fait côté
 * frontend via buildMinecraftHistoryTree, pas ici : cette fonction renvoie
 * toujours la liste à plat. Le filtrage par utilisateur est assuré par les
 * policies Row Level Security de la table minecraft_history_list, aucun
 * filtre manuel n'est nécessaire ici.
 * @param minecraftGameId identifiant de la partie concernée
 * @returns la liste à plat des entrées d'historique, et un message d'erreur si la récupération a échoué
 */
export async function fetchMinecraftHistory(
  minecraftGameId: string,
): Promise<FetchMinecraftHistoryResult> {
  const { data, error } = await supabase
    .from('minecraft_history_list')
    .select(
      'id, minecraft_game_id, parent_entry_id, type, recipe_hint, category, input_items, output_items, created_at',
    )
    .eq('minecraft_game_id', minecraftGameId)
    .order('created_at', { ascending: true })

  if (error) {
    return { entries: [], error: error.message }
  }

  const entries: MinecraftHistoryEntry[] = (data ?? []).map((row) => ({
    id: row.id,
    minecraftGameId: row.minecraft_game_id,
    parentEntryId: row.parent_entry_id,
    type: row.type,
    recipeHint: row.recipe_hint,
    category: row.category,
    inputItems: row.input_items,
    outputItems: row.output_items,
  }))

  return { entries, error: null }
}

/**
 * Regroupe une liste à plat d'entrées d'historique en arbre, chaque nœud
 * portant ses sous-entrées directes (celles dont parent_entry_id pointe vers
 * lui). Les entrées de premier niveau (parentEntryId à null) forment les
 * racines de l'arbre. L'ordre relatif des entrées (issu du tri par date de
 * création) est conservé à chaque niveau.
 * @param entries liste à plat des entrées d'historique d'une partie
 * @returns la liste des nœuds racines, chacun avec ses sous-entrées imbriquées
 */
export function buildMinecraftHistoryTree(entries: MinecraftHistoryEntry[]): MinecraftHistoryTreeNode[] {
  const nodesById = new Map<string, MinecraftHistoryTreeNode>(
    entries.map((entry) => [entry.id, { entry, children: [] }]),
  )
  const roots: MinecraftHistoryTreeNode[] = []

  for (const entry of entries) {
    const node = nodesById.get(entry.id)

    if (!node) {
      continue
    }

    const parentNode = entry.parentEntryId ? nodesById.get(entry.parentEntryId) : undefined

    if (parentNode) {
      parentNode.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

/**
 * Renvoie les entrées "feuilles" d'un nœud de l'arbre d'historique, c'est-à-
 * dire les entrées sans sous-entrée (les bouts de chaîne). Pour un nœud sans
 * sous-entrée, il s'agit du nœud lui-même. Utilisé pour afficher le résultat
 * final obtenu en partant d'une entrée de premier niveau, une fois la chaîne
 * repliée.
 * @param node nœud de l'arbre dont on cherche les feuilles
 * @returns la liste des entrées feuilles de ce nœud, dans l'ordre de l'arbre
 */
export function collectMinecraftHistoryLeafEntries(node: MinecraftHistoryTreeNode): MinecraftHistoryEntry[] {
  if (node.children.length === 0) {
    return [node.entry]
  }

  return node.children.flatMap((childNode) => collectMinecraftHistoryLeafEntries(childNode))
}

/**
 * Filtre les chaînes de premier niveau d'un arbre d'historique selon la
 * catégorie de leur entrée racine (les sous-entrées n'ont pas de catégorie
 * propre, seule celle de la racine compte pour savoir si la chaîne entière
 * doit être conservée), puis remet le résultat à plat. Utilisé pour filtrer
 * l'historique affiché par catégorie sans perdre la structure en arbre des
 * chaînes conservées.
 * @param entries liste à plat des entrées d'historique d'une partie
 * @param category catégorie à conserver, ou null pour ne filtrer sur rien (toutes les chaînes)
 * @returns la liste à plat des entrées des chaînes dont la racine correspond à la catégorie demandée
 */
export function filterMinecraftHistoryEntriesByCategory(
  entries: MinecraftHistoryEntry[],
  category: MinecraftHistoryCategory | null,
): MinecraftHistoryEntry[] {
  if (category === null) {
    return entries
  }

  const tree = buildMinecraftHistoryTree(entries)
  const matchingRoots = tree.filter((node) => node.entry.category === category)

  /**
   * Aplatit récursivement un nœud de l'arbre (lui-même puis toutes ses
   * sous-entrées) en liste.
   * @param node nœud à aplatir
   * @returns la liste des entrées du nœud et de ses descendants
   */
  function flattenNode(node: MinecraftHistoryTreeNode): MinecraftHistoryEntry[] {
    return [node.entry, ...node.children.flatMap((childNode) => flattenNode(childNode))]
  }

  return matchingRoots.flatMap((node) => flattenNode(node))
}

/**
 * Crée une nouvelle entrée d'historique pour une partie Minecraft donnée,
 * éventuellement rattachée à une entrée parente (sous-entrée). Le champ
 * recipeHint désambiguïse le cas où plusieurs recettes vanilla différentes
 * partagent le même item d'entrée, ce que le randomiseur peut faire diverger
 * (il scramble chaque recette individuellement, pas chaque item résultat).
 * Son sens dépend du type (craft et pierre_a_tailler n'ont qu'un seul item
 * d'entrée, inputItems[0]) :
 *   - craft : l'ingrédient réel utilisé (ex. "allium"), quand l'item d'entrée
 *     seul ("magenta_dye", l'item normalement obtenu) ne suffit pas à savoir
 *     laquelle des recettes menant à "magenta_dye" a été utilisée.
 *   - pierre_a_tailler : l'item normalement obtenu par cette recette
 *     précise (ex. "stone_stairs"), quand l'item d'entrée seul ("stone",
 *     l'item posé dans la pierre à tailler) ne suffit pas à savoir laquelle
 *     des recettes de pierre à tailler pour "stone" a été utilisée.
 * Sans effet pour bloc_casse (pas d'ambiguïté sur le résultat obtenu, même si
 * plusieurs blocs peuvent y mener).
 * @param minecraftGameId identifiant de la partie concernée
 * @param input valeurs saisies dans le formulaire (entrée parente, type, indice de recette, items d'entrée, items de sortie)
 * @returns un message d'erreur si la création a échoué, ou null si elle a réussi
 */
export async function createMinecraftHistoryEntry(
  minecraftGameId: string,
  input: MinecraftHistoryInput,
): Promise<MinecraftHistoryMutationResult> {
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return { error: userError?.message ?? "Utilisateur non authentifié." }
  }

  const { error } = await supabase.from('minecraft_history_list').insert({
    user_id: userData.user.id,
    minecraft_game_id: minecraftGameId,
    parent_entry_id: input.parentEntryId,
    type: input.type,
    recipe_hint: input.recipeHint,
    category: input.category,
    input_items: input.inputItems,
    output_items: input.outputItems,
  })

  return { error: error ? error.message : null }
}

/**
 * Met à jour une entrée d'historique existante. Seuls les champs présents
 * dans partialInput sont modifiés, les autres restent inchangés. Le
 * rattachement à une entrée parente (parentEntryId) n'est volontairement
 * pas modifiable ici : déplacer une entrée dans l'arbre n'est pas géré pour
 * l'instant.
 * @param id identifiant de l'entrée à modifier
 * @param partialInput champs à mettre à jour
 * @returns un message d'erreur si la mise à jour a échoué, ou null si elle a réussi
 */
export async function updateMinecraftHistoryEntry(
  id: string,
  partialInput: Partial<Omit<MinecraftHistoryInput, 'parentEntryId'>>,
): Promise<MinecraftHistoryMutationResult> {
  const payload: Record<string, unknown> = {}

  if (partialInput.type !== undefined) {
    payload.type = partialInput.type
  }
  if (partialInput.recipeHint !== undefined) {
    payload.recipe_hint = partialInput.recipeHint
  }
  if (partialInput.category !== undefined) {
    payload.category = partialInput.category
  }
  if (partialInput.inputItems !== undefined) {
    payload.input_items = partialInput.inputItems
  }
  if (partialInput.outputItems !== undefined) {
    payload.output_items = partialInput.outputItems
  }

  const { error } = await supabase.from('minecraft_history_list').update(payload).eq('id', id)

  return { error: error ? error.message : null }
}

/**
 * Supprime définitivement une entrée d'historique, ainsi que toutes ses
 * sous-entrées (suppression en cascade gérée par la base de données).
 * @param id identifiant de l'entrée à supprimer
 * @returns un message d'erreur si la suppression a échoué, ou null si elle a réussi
 */
export async function deleteMinecraftHistoryEntry(id: string): Promise<MinecraftHistoryMutationResult> {
  const { error } = await supabase.from('minecraft_history_list').delete().eq('id', id)

  return { error: error ? error.message : null }
}
