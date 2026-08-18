import { Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage/LoginPage'
import { AnimesPage } from './pages/AnimesPage/AnimesPage'
import { MangaPage } from './pages/MangaPage/MangaPage'

/**
 * Composant racine de l'application, définissant les routes
 * principales : la page de connexion, la page des animes et la page
 * des mangas.
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/animes" element={<AnimesPage />} />
      <Route path="/mangas" element={<MangaPage />} />
    </Routes>
  )
}

export default App
