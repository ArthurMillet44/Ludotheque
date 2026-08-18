import { useEffect, useMemo, useState } from 'react'
import { Navbar } from '../../components/Navbar/Navbar'
import { AnimeTable } from '../../components/AnimeTable/AnimeTable'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { SearchBar } from '../../components/SearchBar/SearchBar'
import { fetchAnimes, filterAnimesByTitle, type Anime } from '../../features/animes/animesApi'
import './AnimesPage.css'

/**
 * Page listant les animes de l'utilisateur connecté. Récupère la liste
 * depuis Supabase au chargement de la page, permet de la filtrer par
 * titre, et affiche selon le cas un indicateur de chargement, un
 * message d'erreur, un message si la liste (ou le résultat de la
 * recherche) est vide, ou le tableau des animes.
 */
export function AnimesPage() {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadAnimes() {
      const { animes: result, error } = await fetchAnimes()

      if (!isMounted) {
        return
      }

      if (error) {
        setErrorMessage(error)
      } else {
        setAnimes(result)
      }

      setIsLoading(false)
    }

    loadAnimes()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredAnimes = useMemo(
    () => filterAnimesByTitle(animes, searchQuery),
    [animes, searchQuery],
  )

  return (
    <div className="animes-page">
      <Navbar />
      <main className="animes-page__content">
        <h1 className="animes-page__title">Animes</h1>
        {!isLoading && !errorMessage && animes.length > 0 && (
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Rechercher un anime..."
            ariaLabel="Rechercher un anime par titre"
          />
        )}
        {isLoading && <p className="animes-page__status">Chargement...</p>}
        {!isLoading && errorMessage && (
          <p className="animes-page__status animes-page__status--error" role="alert">
            {errorMessage}
          </p>
        )}
        {!isLoading && !errorMessage && animes.length === 0 && (
          <EmptyState message="Aucun anime n'existe pour le moment." />
        )}
        {!isLoading && !errorMessage && animes.length > 0 && filteredAnimes.length === 0 && (
          <EmptyState message="Aucun anime ne correspond à ta recherche." />
        )}
        {!isLoading && !errorMessage && filteredAnimes.length > 0 && (
          <AnimeTable animes={filteredAnimes} />
        )}
      </main>
    </div>
  )
}
