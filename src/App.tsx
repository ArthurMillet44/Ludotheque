import { Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage/LoginPage'
import { AnimesPage } from './pages/AnimesPage/AnimesPage'

/**
 * Composant racine de l'application, définissant les routes
 * principales : la page de connexion et la page des animes.
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/animes" element={<AnimesPage />} />
    </Routes>
  )
}

export default App
