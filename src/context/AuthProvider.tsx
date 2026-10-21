import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { authService } from '../services/authService'
import { clearSession, loadSession, saveSession, SESSION_EXPIRED } from '../services/sessionStore'
import type { User } from '../types/user'
import { AuthContext } from './AuthContext'

interface AuthProviderProps {
  children: ReactNode
}

/** Guarda quién inició sesión y lo comparte con todos los componentes de adentro. */
function AuthProvider({ children }: AuthProviderProps) {
  // Al abrir la aplicación, retoma la sesión que haya quedado guardada.
  const [user, setUser] = useState<User | null>(() => loadSession()?.user ?? null)

  useEffect(() => {
    // Si el backend rechaza el token (por ejemplo, porque venció), http.ts avisa con este evento.
    const handleExpired = () => setUser(null)
    window.addEventListener(SESSION_EXPIRED, handleExpired)
    return () => window.removeEventListener(SESSION_EXPIRED, handleExpired)
  }, [])

  const login = async (email: string, password: string) => {
    const session = await authService.login({ email, password })
    saveSession(session)
    setUser(session.user)
  }

  const logout = () => {
    clearSession()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export default AuthProvider