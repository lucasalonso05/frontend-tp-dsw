import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import EntriesPage from './pages/EntriesPage'
import EntryFormPage from './pages/EntryFormPage'
import EventDetailPage from './pages/EventDetailPage'
import EventFormPage from './pages/EventFormPage'
import EventsPage from './pages/EventsPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import PlaceFormPage from './pages/PlaceFormPage'
import PlacesPage from './pages/PlacesPage'
import RegisterPage from './pages/RegisterPage'
import UserFormPage from './pages/UserFormPage'
import UsersPage from './pages/UsersPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/eventos/:id" element={<EventDetailPage />} />
        <Route path="/ingresar" element={<LoginPage />} />
        <Route path="/registrarse" element={<RegisterPage />} />

        {/* Organizadores y admins */}
        <Route element={<ProtectedRoute roles={['ORGANISER', 'ADMIN']} />}>
          <Route path="/eventos" element={<EventsPage />} />
          <Route path="/eventos/nuevo" element={<EventFormPage />} />
          <Route path="/eventos/:id/editar" element={<EventFormPage />} />
          <Route path="/eventos/:id/entradas" element={<EntriesPage />} />
          <Route path="/eventos/:id/entradas/nueva" element={<EntryFormPage />} />
          <Route path="/eventos/:id/entradas/:entryId/editar" element={<EntryFormPage />} />
          <Route path="/lugares" element={<PlacesPage />} />
          <Route path="/lugares/nuevo" element={<PlaceFormPage />} />
          <Route path="/lugares/:id/editar" element={<PlaceFormPage />} />
        </Route>

        {/* Solo admins */}
        <Route element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route path="/personas" element={<UsersPage />} />
          <Route path="/personas/nueva" element={<UserFormPage />} />
          <Route path="/personas/:id/editar" element={<UserFormPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
