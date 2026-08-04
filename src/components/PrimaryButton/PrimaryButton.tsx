import type { ButtonHTMLAttributes } from 'react'
import './PrimaryButton.css'

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

/**
 * Bouton d'action principal, pleine largeur, utilisé pour les
 * appels à l'action du formulaire d'authentification.
 * Transmet toutes les props d'un bouton HTML standard.
 */
export function PrimaryButton({ className = '', ...buttonProps }: PrimaryButtonProps) {
  return <button className={`primary-button ${className}`.trim()} {...buttonProps} />
}
