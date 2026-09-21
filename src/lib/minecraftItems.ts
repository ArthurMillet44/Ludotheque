import minecraftItemsData from '../data/minecraftItems.json'

export interface MinecraftItem {
  id: string
  displayName: string
}

/**
 * Liste statique de tous les items/blocs Minecraft (identifiant technique et
 * nom affichable), générée à partir de PrismarineJS/minecraft-data (version
 * du jeu : voir minecraftItemsData.minecraftDataVersion). Figée dans le code
 * plutôt qu'appelée en direct à chaque frappe, pour ne pas dépendre d'un
 * service externe pour l'autocomplétion.
 */
export const MINECRAFT_ITEMS: MinecraftItem[] = minecraftItemsData.items

const MINECRAFT_ITEMS_BY_ID = new Map(MINECRAFT_ITEMS.map((item) => [item.id, item]))

/**
 * Recherche un item Minecraft par son identifiant technique exact.
 * @param id identifiant technique de l'item (ex. "diamond_sword")
 * @returns l'item correspondant, ou undefined s'il n'existe pas dans la liste
 */
export function findMinecraftItemById(id: string): MinecraftItem | undefined {
  return MINECRAFT_ITEMS_BY_ID.get(id)
}

/**
 * Recherche les items Minecraft dont le nom affichable ou l'identifiant
 * technique contient le texte recherché, sans tenir compte de la casse.
 * Limite le nombre de résultats pour ne pas surcharger la liste déroulante
 * d'autocomplétion.
 * @param query texte recherché
 * @param limit nombre maximum de résultats renvoyés
 * @returns les items correspondants, triés par nom affichable
 */
export function searchMinecraftItems(query: string, limit = 30): MinecraftItem[] {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return MINECRAFT_ITEMS.slice(0, limit)
  }

  const results: MinecraftItem[] = []

  for (const item of MINECRAFT_ITEMS) {
    if (
      item.displayName.toLowerCase().includes(normalizedQuery) ||
      item.id.includes(normalizedQuery)
    ) {
      results.push(item)

      if (results.length >= limit) {
        break
      }
    }
  }

  return results
}
