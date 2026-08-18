import { Pencil, Trash2 } from 'lucide-react'
import type { PokemonCapture } from '../../features/pokemon/pokemonCapturesApi'
import './PokemonCaptureTable.css'

interface PokemonCaptureTableProps {
  captures: PokemonCapture[]
  onEdit: (capture: PokemonCapture) => void
  onDelete: (capture: PokemonCapture) => void
}

/**
 * Affiche la liste des Pokémon capturés pour un jeu, sous forme de
 * tableau (zone, Pokémon capturé, statut), avec des actions par ligne
 * pour modifier ou supprimer une capture.
 */
export function PokemonCaptureTable({ captures, onEdit, onDelete }: PokemonCaptureTableProps) {
  return (
    <div className="pokemon-capture-table__wrapper">
      <table className="pokemon-capture-table">
        <thead>
          <tr>
            <th>Zone</th>
            <th>Pokémon capturé</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {captures.map((capture) => (
            <tr key={capture.id}>
              <td>{capture.zone}</td>
              <td>{capture.capturedPokemon}</td>
              <td>{capture.status}</td>
              <td>
                <div className="pokemon-capture-table__actions">
                  <button
                    type="button"
                    className="pokemon-capture-table__action"
                    aria-label={`Modifier ${capture.capturedPokemon}`}
                    onClick={() => onEdit(capture)}
                  >
                    <Pencil aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="pokemon-capture-table__action pokemon-capture-table__action--danger"
                    aria-label={`Supprimer ${capture.capturedPokemon}`}
                    onClick={() => onDelete(capture)}
                  >
                    <Trash2 aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
