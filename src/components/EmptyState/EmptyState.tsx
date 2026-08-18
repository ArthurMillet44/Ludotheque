import './EmptyState.css'

interface EmptyStateProps {
  message: string
}

/**
 * Affiche un message centré lorsqu'une liste ne contient aucun élément.
 */
export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <p className="empty-state__message">{message}</p>
    </div>
  )
}
