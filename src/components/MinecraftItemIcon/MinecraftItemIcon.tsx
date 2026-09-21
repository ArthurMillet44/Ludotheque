import { useEffect, useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { getMinecraftItemTextureUrls } from '../../lib/minecraftTextures'
import './MinecraftItemIcon.css'

interface MinecraftItemIconProps {
  itemId: string
  label: string
  size?: number
}

/**
 * Affiche l'icône d'un item Minecraft, en essayant successivement les URLs
 * candidates renvoyées par getMinecraftItemTextureUrls (dossier "item" puis
 * "block"). Si aucune des URLs ne charge, affiche une icône générique de
 * remplacement plutôt qu'une image cassée.
 */
export function MinecraftItemIcon({ itemId, label, size = 32 }: MinecraftItemIconProps) {
  const candidateUrls = getMinecraftItemTextureUrls(itemId)
  const [candidateIndex, setCandidateIndex] = useState(0)

  useEffect(() => {
    setCandidateIndex(0)
  }, [itemId])

  const currentUrl = candidateUrls[candidateIndex]

  if (!currentUrl) {
    return (
      <span
        className="minecraft-item-icon minecraft-item-icon--fallback"
        style={{ width: size, height: size }}
        role="img"
        aria-label={label}
        title={label}
      >
        <HelpCircle aria-hidden="true" />
      </span>
    )
  }

  return (
    <img
      key={currentUrl}
      src={currentUrl}
      alt={label}
      title={label}
      width={size}
      height={size}
      className="minecraft-item-icon"
      onError={() => setCandidateIndex((previous) => previous + 1)}
    />
  )
}
