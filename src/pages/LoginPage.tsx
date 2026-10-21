import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import TextField from '../components/TextField'
import { useAuth } from '../hooks/useAuth'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // Si llegó acá porque quiso entrar a una página que pide sesión, después vuelve a esa página.
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [values, setValues] = useState({ email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const handleChange = (name: string, value: string) => {
    setValues({ ...values, [name]: value })
  }

  const submit = async () => {
    if (values.email.trim() === '' || values.password === '') {
      setError('Completá el email y la contraseña')
      return
    }

    setSending(true)
    setError(null)
    try {
      await login(values.email.trim(), values.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError((err as Error).message)
      setSending(false)
    }
  }

  return (
    <section className="mx-auto max-w-sm">
      <h1 className="text-2xl font-bold md:text-3xl">Iniciar sesión</h1>

      {error && (
        <p role="alert" className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}

      <form
        noValidate
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <TextField
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
        />
        <TextField
          label="Contraseña"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
        />
        <button
          type="submit"
          disabled={sending}
          className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {sending ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </section>
  )
}

export default LoginPage