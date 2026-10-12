import PlacesPage from './pages/PlacesPage.tsx'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import PlaceFormPage from './pages/PlaceFormPage.tsx'
import UserFormPage from './pages/UserFormPage'
import UsersPage from './pages/UsersPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/lugares" element={<PlacesPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/lugares/nuevo" element={<PlaceFormPage />} />
        <Route path="/lugares/:id/editar" element={<PlaceFormPage />} />
        <Route path="/personas" element={<UsersPage />} />
        <Route path="/personas/nueva" element={<UserFormPage />} />
        <Route path="/personas/:id/editar" element={<UserFormPage />} />
      </Route>
    </Routes>
  )
}

export default App
