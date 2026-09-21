/**
 * Version (tag Git) du dépôt InventivetalentDev/minecraft-assets utilisée
 * pour les textures. Alignée avec minecraftDataVersion dans
 * src/data/minecraftItems.json, pour que la liste d'items et les images
 * correspondent à la même version du jeu. À mettre à jour ici uniquement
 * si les images cessent de correspondre après une mise à jour du jeu.
 */
const MINECRAFT_ASSETS_VERSION = '26.1'

const MINECRAFT_ASSETS_BASE_URL = `https://cdn.jsdelivr.net/gh/InventivetalentDev/minecraft-assets@${MINECRAFT_ASSETS_VERSION}/assets/minecraft/textures`

/**
 * Préfixes des identifiants "de confort" ajoutés dans minecraftItems.json
 * pour les potions nommées par effet (ex. "potion_fire_resistance" pour
 * "Potion of Fire Resistance"). Ces identifiants n'existent pas tels quels
 * dans le jeu : une potion est toujours l'item "potion"/"splash_potion"/
 * "lingering_potion", et son effet (fire_resistance, etc.) est une donnée
 * NBT/component, pas une variante d'item séparée avec sa propre texture. Il
 * n'y a donc pas de fichier "potion_fire_resistance.png" : la texture de la
 * fiole correspondante (teintée dynamiquement dans le jeu selon l'effet,
 * teinte qu'on ne peut pas reproduire ici) sert d'icône de repli.
 */
const POTION_ID_PREFIXES = ['lingering_potion_', 'splash_potion_', 'potion_']

/**
 * Ramène un identifiant de potion nommée (ex. "potion_fire_resistance") à
 * l'identifiant de base dont la texture existe réellement (ex. "potion").
 * Renvoie itemId inchangé pour tout ce qui n'est pas une potion nommée.
 * @param itemId identifiant technique de l'item
 * @returns l'identifiant à utiliser pour chercher la texture
 */
function resolveTextureItemId(itemId: string): string {
  const matchingPrefix = POTION_ID_PREFIXES.find((prefix) => itemId.startsWith(prefix))

  // Une potion "X_" suivie d'un effet a toujours au moins un caractère après
  // le préfixe, donc l'identifiant de base exact ("potion", "splash_potion"...)
  // ne peut jamais matcher son propre préfixe (plus court) : pas besoin de
  // vérification supplémentaire ici.
  return matchingPrefix ? matchingPrefix.slice(0, -1) : itemId
}

/**
 * Construit la liste ordonnée des URLs à essayer pour afficher l'icône d'un
 * item/bloc Minecraft. Certains items (outils, nourriture...) n'ont leur
 * texture que dans le dossier "item", d'autres (blocs simples comme la
 * pierre ou la laine) uniquement dans le dossier "block". Comme il n'existe
 * pas de règle fiable pour savoir à l'avance dans lequel chercher, les deux
 * chemins sont proposés dans l'ordre : au composant d'afficher le premier
 * qui charge réellement (voir MinecraftItemIcon). Pour les potions nommées
 * par effet, l'identifiant est d'abord ramené à sa forme de base (voir
 * resolveTextureItemId).
 * @param itemId identifiant technique de l'item (ex. "cobblestone")
 * @returns la liste des URLs à essayer, dans l'ordre
 */
export function getMinecraftItemTextureUrls(itemId: string): string[] {
  const textureItemId = resolveTextureItemId(itemId)

  return [
    `${MINECRAFT_ASSETS_BASE_URL}/item/${textureItemId}.png`,
    `${MINECRAFT_ASSETS_BASE_URL}/block/${textureItemId}.png`,
  ]
}
