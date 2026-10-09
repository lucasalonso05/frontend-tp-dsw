import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { placeService } from '../services/placeService'
import type { Place } from '../types/place'

function PlacesPage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    placeService
      .getAll()
      .then((data) => {
        if (!ignore) setPlaces(data)
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

  const handleDelete = async (place: Place) => {
    if (!window.confirm(`¿Eliminar el lugar "${place.name}"?`)) return

    setError(null)
    try {
      await placeService.remove(place.id)
      setPlaces(places.filter((item) => item.id !== place.id))
    } catch {
      setError('No se pudo eliminar el lugar. Si tiene eventos asociados, no se puede borrar.')
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">Lugares</h1>
        <Link
          to="/lugares/nuevo"
          className="rounded bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700"
        >
          Nuevo lugar
        </Link>
      </div>

      {loading && <p className="mt-4 text-slate-600">Cargando lugares…</p>}

      {error && (
        <p role="alert" className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && places.length === 0 && (
        <p className="mt-4 text-slate-600">Todavía no hay lugares cargados.</p>
      )}

      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {places.map((place) => (
          <li key={place.id} className="flex flex-col rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="font-semibold">{place.name}</h2>
            <p className="text-sm text-slate-600">
              {place.street} {place.street_number}, {place.city}, {place.province}
            </p>
            <p className="mt-2 text-sm">Capacidad: {place.capacity} personas</p>

            <div className="mt-4 flex gap-2">
              <Link
                to={`/lugares/${place.id}/editar`}
                className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
              >
                Editar
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(place)}
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

export default PlacesPage