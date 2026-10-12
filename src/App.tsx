import PlacesPage from './pages/PlacesPage.tsx'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import PlaceFormPage from './pages/PlaceFormPage.tsx'
import UserFormPage from './pages/UserFormPage'
import UsersPage from './pages/UsersPage'
import EventFormPage from './pages/EventFormPage'
import EventsPage from './pages/EventsPage'
import EntriesPage from './pages/EntriesPage'
import EntryFormPage from './pages/EntryFormPage'

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
        <Route path="/eventos" element={<EventsPage />} />
        <Route path="/eventos/nuevo" element={<EventFormPage />} />
        <Route path="/eventos/:id/editar" element={<EventFormPage />} />
        <Route path="/eventos/:id/entradas" element={<EntriesPage />} />
        <Route path="/eventos/:id/entradas/nueva" element={<EntryFormPage />} />
        <Route path="/eventos/:id/entradas/:entryId/editar" element={<EntryFormPage />} />
      </Route>
    </Routes>
  )
}

export default App
