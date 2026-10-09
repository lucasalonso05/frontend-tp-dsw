import PlacesPage from './pages/PlacesPage.tsx'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import PlaceFormPage from './pages/PlaceFormPage.tsx'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/lugares" element={<PlacesPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/lugares/nuevo" element={<PlaceFormPage />} />
        <Route path="/lugares/:id/editar" element={<PlaceFormPage />} />
      </Route>
    </Routes>
  )
}

export default App
