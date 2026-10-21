import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EventStatusBadge from '../components/EventStatusBadge'
import { useAuth } from '../hooks/useAuth'
import { eventService } from '../services/eventService'
import { placeService } from '../services/placeService'
import type { EventModel } from '../types/event'
import type { Place } from '../types/place'
import { formatDateTime } from '../utils/dates'
import { canManage } from '../utils/permissions'

function EventsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const [events, setEvents] = useState<EventModel[]>([])
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    Promise.all([eventService.getAll(), placeService.getAll()])
      .then(([eventList, placeList]) => {
        if (ignore) return
        setEvents(eventList)
        setPlaces(placeList)
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  const handleCancel = async (event: EventModel) => {
    if (!window.confirm(`¿Cancelar el evento "${event.title}"?`)) return

    setError(null)
    try {
      const cancelled = await eventService.cancel(event.id)
      setEvents(events.map((item) => (item.id === cancelled.id ? cancelled : item)))
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const placeName = (id: number) =>
    places.find((place) => place.id === id)?.name ?? 'Lugar no disponible'

  // Un organizador ve solo sus eventos; un admin, todos.
  const visibleEvents = events
    .filter((event) => canManage(user, event.id_user))
    .sort((a, b) => a.date_time_start.localeCompare(b.date_time_start))

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">
          {isAdmin ? 'Gestión de eventos' : 'Mis eventos'}
        </h1>
        <Link
          to="/eventos/nuevo"
          className="rounded bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700"
        >
          Nuevo evento
        </Link>
      </div>

      {loading && <p className="mt-4 text-slate-600">Cargando eventos…</p>}

      {error && (
        <p role="alert" className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && visibleEvents.length === 0 && (
        <p className="mt-4 text-slate-600">
          {isAdmin ? 'Todavía no hay eventos cargados.' : 'Todavía no creaste ningún evento.'}
        </p>
      )}

      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleEvents.map((event) => (
          <li key={event.id} className="flex flex-col rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold">{event.title}</h2>
              <EventStatusBadge status={event.status} />
            </div>
            <p className="text-sm text-slate-600">{event.category}</p>
            <p className="mt-2 text-sm">
              {formatDateTime(event.date_time_start)} a {formatDateTime(event.date_time_end)}
            </p>
            <p className="text-sm text-slate-600">{placeName(event.id_place)}</p>
            {isAdmin && (
              <p className="text-sm text-slate-600">
                Organiza: {event.FK_user.name} {event.FK_user.surname}
              </p>
            )}
            <p className="mt-2 text-sm">Stock total: {event.total_stock} entradas</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to={`/eventos/${event.id}/editar`}
                className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
              >
                Editar
              </Link>
              <Link
                to={`/eventos/${event.id}/entradas`}
                className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
              >
                Entradas
              </Link>
              {event.status !== 'CANCELLED' && (
                <button
                  type="button"
                  onClick={() => handleCancel(event)}
                  className="rounded border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
                >
                  Cancelar evento
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default EventsPage