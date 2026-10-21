import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { entryService } from '../services/entryService'
import { eventService } from '../services/eventService'
import type { Entry } from '../types/entry'
import type { EventModel } from '../types/event'
import { formatDateTime } from '../utils/dates'
import { formatPrice } from '../utils/money'
import { canManage } from '../utils/permissions'
import ForbiddenPage from './ForbiddenPage'

function EntriesPage() {
  const { id } = useParams()
  const eventId = Number(id)
  const { user } = useAuth()

  const [event, setEvent] = useState<EventModel | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    Promise.all([eventService.getById(eventId), entryService.getByEvent(eventId)])
      .then(([eventData, entryList]) => {
        if (ignore) return
        setEvent(eventData)
        setEntries(entryList)
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

  const handleDelete = async (entry: Entry) => {
    if (!window.confirm(`¿Eliminar la entrada "${entry.entry_name}"?`)) return

    setError(null)
    try {
      await entryService.remove(entry.id)
      setEntries(entries.filter((item) => item.id !== entry.id))
    } catch {
      setError('No se pudo eliminar la entrada. Si ya tiene ventas, no se puede borrar.')
    }
  }

    // Un organizador no puede gestionar las entradas del evento de otro.
  if (event && !canManage(user, event.id_user)) return <ForbiddenPage />
  const assigned = entries.reduce((sum, entry) => sum + entry.stock, 0)
  const unassigned = event ? event.total_stock - assigned : 0
  const sortedEntries = [...entries].sort((a, b) => Number(a.unit_price) - Number(b.unit_price))

  return (
    <section>
      <Link to="/eventos" className="text-sm text-blue-600 hover:underline">
        ← Volver a eventos
      </Link>

      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">
          {event ? `Entradas de ${event.title}` : 'Entradas'}
        </h1>
        {event && unassigned > 0 && (
          <Link
            to={`/eventos/${eventId}/entradas/nueva`}
            className="rounded bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700"
          >
            Nueva entrada
          </Link>
        )}
      </div>

      {loading && <p className="mt-4 text-slate-600">Cargando entradas…</p>}

      {error && (
        <p role="alert" className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}

      {event && (
        <p className="mt-4 rounded border border-slate-200 bg-white p-3 text-sm">
          Stock del evento: <strong>{event.total_stock}</strong> · Asignado a entradas:{' '}
          <strong>{assigned}</strong> · Sin asignar: <strong>{unassigned}</strong>
        </p>
      )}

      {!loading && !error && entries.length === 0 && (
        <p className="mt-4 text-slate-600">Este evento todavía no tiene entradas.</p>
      )}

      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedEntries.map((entry) => (
          <li key={entry.id} className="flex flex-col rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="font-semibold">{entry.entry_name}</h2>
            {entry.entry_description && (
              <p className="text-sm text-slate-600">{entry.entry_description}</p>
            )}
            <p className="mt-2 text-lg font-semibold">{formatPrice(entry.unit_price)}</p>
            <p className="text-sm text-slate-600">
              {formatDateTime(entry.date_time_start)} a {formatDateTime(entry.date_time_end)}
            </p>
            <p className="mt-2 text-sm">
              Stock: {entry.stock} · Vendidas: {entry.sold_stock} · Disponibles:{' '}
              {entry.stock - entry.sold_stock}
            </p>

            <div className="mt-4 flex gap-2">
              <Link
                to={`/eventos/${eventId}/entradas/${entry.id}/editar`}
                className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
              >
                Editar
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(entry)}
                className="rounded border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default EntriesPage