import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { eventService } from '../services/eventService'
import { placeService } from '../services/placeService'
import { userService } from '../services/userService'
import { EVENT_STATUS_LABELS } from '../types/event'
import type { EventModel, EventStatus } from '../types/event'
import type { Place } from '../types/place'
import type { User } from '../types/user'
import { formatDateTime } from '../utils/dates'

const statusClasses: Record<EventStatus, string> = {
  CONFIRMED: 'bg-green-100 text-green-800',
  FINISHED: 'bg-slate-200 text-slate-700',
  CANCELLED: 'bg-red-100 text-red-800',
}

function EventsPage() {
  const [events, setEvents] = useState<EventModel[]>([])
  const [places, setPlaces] = useState<Place[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    Promise.all([eventService.getAll(), placeService.getAll(), userService.getAll()])
      .then(([eventList, placeList, userList]) => {
        if (ignore) return
        setEvents(eventList)
        setPlaces(placeList)
        setUsers(userList)
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

  const organiserName = (id: number) => {
    const user = users.find((item) => item.id === id)
    return user ? `${user.name} ${user.surname}` : 'Organizador no disponible'
  }

  const sortedEvents = [...events].sort((a, b) =>
    a.date_time_start.localeCompare(b.date_time_start),
  )

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">Gestión de eventos</h1>
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

      {!loading && !error && sortedEvents.length === 0 && (
        <p className="mt-4 text-slate-600">Todavía no hay eventos cargados.</p>
      )}

      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedEvents.map((event) => (
          <li key={event.id} className="flex flex-col rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold">{event.title}</h2>
              <span className={`rounded-full px-2 py-0.5 text-xs ${statusClasses[event.status]}`}>
                {EVENT_STATUS_LABELS[event.status]}
              </span>
            </div>
            <p className="text-sm text-slate-600">{event.category}</p>
            <p className="mt-2 text-sm">
              {formatDateTime(event.date_time_start)} a {formatDateTime(event.date_time_end)}
            </p>
            <p className="text-sm text-slate-600">{placeName(event.id_place)}</p>
            <p className="text-sm text-slate-600">Organiza: {organiserName(event.id_user)}</p>
            <p className="mt-2 text-sm">Stock total: {event.total_stock} entradas</p>

            <div className="mt-4 flex gap-2">
              <Link
                to={`/eventos/${event.id}/editar`}
                className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
              >
                Editar
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