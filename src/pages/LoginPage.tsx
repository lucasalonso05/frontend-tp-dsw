import { useState } from 'react'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Completá todos los campos')
      return
    }

    setCargando(true)
    try {
      // acá va la llamada al backend
      await new Promise((r) => setTimeout(r, 1500))
      console.log('Enviando:', { email, password })
    } catch {
      setError('Email o contraseña incorrectos')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-surface p-10 rounded-2xl border border-white/10 w-full max-w-md"
      >
        <h1 className="font-display text-3xl text-accent mb-6">Eventify</h1>

        <label htmlFor="email" className="block text-sm text-white/70 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-bg border border-white/15 rounded-lg px-3 py-2 mb-4 outline-none focus:border-accent"
        />

        <label htmlFor="password" className="block text-sm text-white/70 mb-1">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-bg border border-white/15 rounded-lg px-3 py-2 mb-4 outline-none focus:border-accent"
        />

        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}

        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-accent text-black font-medium rounded-lg py-2 hover:bg-accent-deep transition-colors disabled:opacity-50"
        >
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}

export default LoginPage