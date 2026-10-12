import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import SelectField from '../components/SelectField'
import TextField from '../components/TextField'
import { eventService } from '../services/eventService'
import { placeService } from '../services/placeService'
import { userService } from '../services/userService'
import { EVENT_STATUS_LABELS } from '../types/event'
import type { CreateEventDTO, EventModel, EventStatus } from '../types/event'
import type { Place } from '../types/place'
import type { User } from '../types/user'
import { toDateTimeInput, toISO } from '../utils/dates'

interface EventFormValues {
  title: string
  category: string
  total_stock: string
  date_time_start: string
  date_time_end: string
  id_place: string
  id_user: string
  status: string
}

type EventFormErrors = Partial<Record<keyof EventFormValues, string>>

interface FieldConfig {
  name: keyof EventFormValues
  label: string
  type?: 'text' | 'number' | 'datetime-local'
  options?: { value: string; label: string }[]
  placeholder?: string
  wide?: boolean
}

const statusOptions = Object.entries(EVENT_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}))

const emptyValues: EventFormValues = {
  title: '',
  category: '',
  total_stock: '',
  date_time_start: '',
  date_time_end: '',
  id_place: '',
  id_user: '',
  status: 'CONFIRMED',
}

function validate(values: EventFormValues, place: Place | undefined): EventFormErrors {
  const errors: EventFormErrors = {}

  if (values.title.trim() === '') errors.title = 'Este campo es obligatorio'
  if (values.category.trim() === '') errors.category = 'Este campo es obligatorio'
  if (values.id_place === '') errors.id_place = 'Elegí un lugar'
  if (values.id_user === '') errors.id_user = 'Elegí un organizador'

  const stock = Number(values.total_stock)
  if (!Number.isInteger(stock) || stock <= 0) {
    errors.total_stock = 'Ingresá un número entero mayor a 0'
  } else if (place && stock > place.capacity) {
    errors.total_stock = `El lugar admite hasta ${place.capacity} personas`
  }

  if (values.date_time_start === '') errors.date_time_start = 'Elegí fecha y hora de inicio'
  if (values.date_time_end === '') {
    errors.date_time_end = 'Elegí fecha y hora de fin'
  } else if (values.date_time_start !== '' && values.date_time_end <= values.date_time_start) {
    errors.date_time_end = 'El fin tiene que ser posterior al inicio'
  }

  return errors
}

function toDTO(values: EventFormValues, original: EventModel | null): CreateEventDTO {
  const status = values.status as EventStatus
  const dto: CreateEventDTO = {
    title: values.title.trim(),
    category: values.category.trim(),
    total_stock: Number(values.total_stock),
    date_time_start: toISO(values.date_time_start),
    date_time_end: toISO(values.date_time_end),
    status,
    id_place: Number(values.id_place),
    id_user: Number(values.id_user),
  }

  // Si se cancela desde el formulario, se registra el momento de la cancelación.
  if (status === 'CANCELLED' && original?.status !== 'CANCELLED') {
    dto.date_time_cancellation = new Date().toISOString()
  }

  return dto
}

function EventFormPage() {
  const { id } = useParams()
  const eventId = id === undefined ? null : Number(id)
  const isEdit = eventId !== null
  const navigate = useNavigate()

  const [values, setValues] = useState<EventFormValues>(emptyValues)
  const [errors, setErrors] = useState<EventFormErrors>({})
  const [original, setOriginal] = useState<EventModel | null>(null)
  const [places, setPlaces] = useState<Place[]>([])
  const [organisers, setOrganisers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    Promise.all([
      placeService.getAll(),
      userService.getAll(),
      eventId === null ? null : eventService.getById(eventId),
    ])
      .then(([placeList, users, event]) => {
        if (ignore) return
        setPlaces(placeList)
        setOrganisers(users.filter((user) => user.role === 'ORGANISER'))
        if (event) {
          setOriginal(event)
          setValues({
            title: event.title,
            category: event.category,
            total_stock: String(event.total_stock),
            date_time_start: toDateTimeInput(event.date_time_start),
            date_time_end: toDateTimeInput(event.date_time_end),
            id_place: String(event.id_place),
            id_user: String(event.id_user),
            status: event.status,
          })
        }
      })
      .catch((err: Error) => {
        if (!ignore) setApiError(err.message)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [eventId])

  const handleChange = (name: string, value: string) => {
    setValues({ ...values, [name]: value })
  }

  const save = async () => {
    const selectedPlace = places.find((place) => place.id === Number(values.id_place))
    const validationErrors = validate(values, selectedPlace)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSaving(true)
    setApiError(null)
    try {
      const dto = toDTO(values, original)
      if (eventId === null) {
        await eventService.create(dto)
      } else {
        await eventService.update(eventId, dto)
      }
      navigate('/eventos')
    } catch (err) {
      setApiError((err as Error).message)
      setSaving(false)
    }
  }

  if (loading) return <p className="text-slate-600">Cargando…</p>

  const fields: FieldConfig[] = [
    { name: 'title', label: 'Título', wide: true },
    { name: 'category', label: 'Categoría' },
    { name: 'total_stock', label: 'Stock total de entradas', type: 'number' },
    { name: 'date_time_start', label: 'Inicio', type: 'datetime-local' },
    { name: 'date_time_end', label: 'Fin', type: 'datetime-local' },
    {
      name: 'id_place',
      label: 'Lugar',
      placeholder: 'Elegí un lugar',
      options: places.map((place) => ({
        value: String(place.id),
        label: `${place.name} (${place.city}), hasta ${place.capacity} personas`,
      })),
    },
    {
      name: 'id_user',
      label: 'Organizador',
      placeholder: 'Elegí un organizador',
      options: organisers.map((user) => ({
        value: String(user.id),
        label: `${user.name} ${user.surname}`,
      })),
    },
  ]

  if (isEdit) fields.push({ name: 'status', label: 'Estado', options: statusOptions })

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold md:text-3xl">
        {isEdit ? 'Editar evento' : 'Nuevo evento'}
      </h1>

      {apiError && (
        <p role="alert" className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-red-700">
          {apiError}
        </p>
      )}

      <form
        noValidate
        className="mt-6 grid gap-4 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault()
          save()
        }}
      >
        {fields.map((field) => (
          <div key={field.name} className={field.wide ? 'sm:col-span-2' : undefined}>
            {field.options ? (
              <SelectField
                label={field.label}
                name={field.name}
                value={values[field.name]}
                options={field.options}
                placeholder={field.placeholder}
                error={errors[field.name]}
                required
                onChange={handleChange}
              />
            ) : (
              <TextField
                label={field.label}
                name={field.name}
                type={field.type}
                value={values[field.name]}
                error={errors[field.name]}
                required
                onChange={handleChange}
              />
            )}
          </div>
        ))}

        <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
          <Link to="/eventos" className="rounded border border-slate-300 px-4 py-2 text-center">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default EventFormPage