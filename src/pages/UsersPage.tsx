import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { userService } from '../services/userService'
import { USER_ROLE_LABELS } from '../types/user'
import type { User, UserRole } from '../types/user'

type RoleFilter = UserRole | 'ALL'

const filters: { value: RoleFilter; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'ASSISTANT', label: 'Asistentes' },
  { value: 'ORGANISER', label: 'Organizadores' },
  { value: 'ADMIN', label: 'Administradores' },
]

function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    userService
      .getAll()
      .then((data) => {
        if (!ignore) setUsers(data)
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

  const handleDelete = async (user: User) => {
    if (!window.confirm(`¿Eliminar a ${user.name} ${user.surname}?`)) return

    setError(null)
    try {
      await userService.remove(user.id)
      setUsers(users.filter((item) => item.id !== user.id))
    } catch {
      setError(
        'No se pudo eliminar a la persona. Si tiene eventos, lugares, compras o entradas asociadas, no se puede borrar.',
      )
    }
  }

  const visibleUsers =
    roleFilter === 'ALL' ? users : users.filter((user) => user.role === roleFilter)

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">Personas</h1>
        <Link
          to="/personas/nueva"
          className="rounded bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700"
        >
          Nueva persona
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            aria-pressed={roleFilter === filter.value}
            onClick={() => setRoleFilter(filter.value)}
            className={`rounded-full border px-3 py-1 text-sm ${
              roleFilter === filter.value
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {loading && <p className="mt-4 text-slate-600">Cargando personas…</p>}

      {error && (
        <p role="alert" className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && visibleUsers.length === 0 && (
        <p className="mt-4 text-slate-600">No hay personas para mostrar.</p>
      )}

      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleUsers.map((user) => (
          <li key={user.id} className="flex flex-col rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold">
                {user.name} {user.surname}
              </h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                {USER_ROLE_LABELS[user.role]}
              </span>
            </div>
            <p className="mt-1 break-all text-sm text-slate-600">{user.email}</p>
            <p className="text-sm text-slate-600">{user.telephone}</p>
            <p className="mt-2 text-sm">
              {user.doc_type} {user.doc_number}
            </p>

            <div className="mt-4 flex gap-2">
              <Link
                to={`/personas/${user.id}/editar`}
                className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
              >
                Editar
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(user)}
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

export default UsersPage