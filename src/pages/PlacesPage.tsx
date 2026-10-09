import { useEffect, useState } from 'react'
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

  return (
    <section>
      <h1 className="text-2xl font-bold md:text-3xl">Lugares</h1>

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
          <li key={place.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="font-semibold">{place.name}</h2>
            <p className="text-sm text-slate-600">
              {place.street} {place.street_number}, {place.city}, {place.province}
            </p>
            <p className="mt-2 text-sm">Capacidad: {place.capacity} personas</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default PlacesPage