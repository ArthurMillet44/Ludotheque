import type { InputHTMLAttributes } from 'react'
import './FormField.css'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
}

/**
 * Champ de formulaire générique associant un label visible et un
 * champ de saisie. Toutes les props d'un input HTML standard sont
 * transmises telles quelles au champ.
 */
export function FormField({ id, label, ...inputProps }: FormFieldProps) {
  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={id}>
        {label}
      </label>
      <input id={id} className="form-field__input" {...inputProps} />
    </div>
  )
}
