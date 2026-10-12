import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import EventStatusBadge from '../components/EventStatusBadge'
import { entryService } from '../services/entryService'
import { eventService } from '../services/eventService'
import { placeService } from '../services/placeService'
import { userService } from '../services/userService'
import type { Entry } from '../types/entry'
import type { EventModel } from '../types/event'
import type { Place } from '../types/place'
import type { User } from '../types/user'
import { formatDateTime } from '../utils/dates'
import { formatPrice } from '../utils/money'

interface EventDetail {
  event: EventModel
  place: Place
  organiser: User
  entries: Entry[]
}

async function loadDetail(eventId: number): Promise<EventDetail> {
  const event = await eventService.getById(eventId)
  const [place, organiser, entries] = await Promise.all([
    placeService.getById(event.id_place),
    userService.getById(event.id_user),
    entryService.getByEvent(eventId),
  ])
  return { event, place, organiser, entries }
}

function EventDetailPage() {
  const { id } = useParams()
  const eventId = Number(id)

  const [detail, setDetail] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    loadDetail(eventId)
      .then((data) => {
        if (!ignore) setDetail(data)
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
  }, [eventId])

  if (loading) return <p className="text-slate-600">Cargando evento…</p>

  if (!detail) {
    return (
      <section>
        <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-red-700">
          {error ?? 'No se pudo cargar el evento'}
        </p>
        <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
          ← Volver a la cartelera
        </Link>
      </section>
    )
  }

  const { event, place, organiser, entries } = detail
  const sortedEntries = [...entries].sort((a, b) => Number(a.unit_price) - Number(b.unit_price))

  return (
    <section>
      <Link to="/" className="text-sm text-blue-600 hover:underline">
        ← Volver a la cartelera
      </Link>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold md:text-3xl">{event.title}</h1>
        <EventStatusBadge status={event.status} />
      </div>
      <p className="text-slate-600">{event.category}</p>

      {event.status === 'CANCELLED' && (
        <p role="alert" className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-red-700">
          Este evento fue cancelado
          {event.date_time_cancellation
            ? ` el ${formatDateTime(event.date_time_cancellation)}`
            : ''}
          .
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="font-semibold">Cuándo</h2>
            <p className="mt-1 text-sm">Empieza: {formatDateTime(event.date_time_start)}</p>
            <p className="text-sm">Termina: {formatDateTime(event.date_time_end)}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="font-semibold">Dónde</h2>
            <p className="mt-1 text-sm">{place.name}</p>
            <p className="text-sm text-slate-600">
              {place.street} {place.street_number}, {place.city}, {place.province}
            </p>
            <p className="text-sm text-slate-600">Capacidad: {place.capacity} personas</p>
            {place.description && <p className="mt-2 text-sm">{place.description}</p>}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="font-semibold">Organiza</h2>
            <p className="mt-1 text-sm">
              {organiser.name} {organiser.surname}
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold">Entradas</h2>

          {sortedEntries.length === 0 && (
            <p className="mt-3 text-slate-600">Todavía no hay entradas a la venta.</p>
          )}

          <ul className="mt-3 space-y-3">
            {sortedEntries.map((entry) => {
              const available = entry.stock - entry.sold_stock

              return (
                <li
                  key={entry.id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-semibold">{entry.entry_name}</h3>
                    {entry.entry_description && (
                      <p className="text-sm text-slate-600">{entry.entry_description}</p>
                    )}
                    <p className="text-sm text-slate-600">
                      {formatDateTime(entry.date_time_start)} a{' '}
                      {formatDateTime(entry.date_time_end)}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-lg font-semibold">{formatPrice(entry.unit_price)}</p>
                    <p className={`text-sm ${available > 0 ? 'text-slate-600' : 'text-red-700'}`}>
                      {available > 0 ? `${available} disponibles` : 'Agotada'}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default EventDetailPage