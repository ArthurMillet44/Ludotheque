import { Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage/LoginPage'
import { AnimesPage } from './pages/AnimesPage/AnimesPage'
import { MangaPage } from './pages/MangaPage/MangaPage'
import { PokemonPage } from './pages/PokemonPage/PokemonPage'
import { PokemonGameDetailPage } from './pages/PokemonGameDetailPage/PokemonGameDetailPage'

/**
 * Composant racine de l'application, définissant les routes
 * principales : la page de connexion, la page des animes, la page
 * des mangas, la page des jeux Pokémon et la page de détail d'un jeu
 * Pokémon (non référencée dans la Navbar).
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/animes" element={<AnimesPage />} />
      <Route path="/mangas" element={<MangaPage />} />
      <Route path="/pokemon" element={<PokemonPage />} />
      <Route path="/pokemon/:id" element={<PokemonGameDetailPage />} />
    </Routes>
  )
}

export default App
