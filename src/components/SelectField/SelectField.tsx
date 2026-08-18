import type { SelectHTMLAttributes } from 'react'
import './SelectField.css'

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string
  label: string
}

/**
 * Champ de formulaire générique associant un label visible et une
 * liste déroulante. Toutes les props d'un select HTML standard sont
 * transmises telles quelles au champ ; les options sont passées en
 * children.
 */
export function SelectField({ id, label, children, ...selectProps }: SelectFieldProps) {
  return (
    <div className="select-field">
      <label className="select-field__label" htmlFor={id}>
        {label}
      </label>
      <select id={id} className="select-field__select" {...selectProps}>
        {children}
      </select>
    </div>
  )
}
