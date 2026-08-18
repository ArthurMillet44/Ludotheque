import { Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage/LoginPage'
import { AnimesPage } from './pages/AnimesPage/AnimesPage'
import { MangaPage } from './pages/MangaPage/MangaPage'
import { PokemonPage } from './pages/PokemonPage/PokemonPage'

/**
 * Composant racine de l'application, définissant les routes
 * principales : la page de connexion, la page des animes, la page
 * des mangas et la page des jeux Pokémon.
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/animes" element={<AnimesPage />} />
      <Route path="/mangas" element={<MangaPage />} />
      <Route path="/pokemon" element={<PokemonPage />} />
    </Routes>
  )
}

export default App
