import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

/** Devuelve quién inició sesión y las funciones para entrar y salir. */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth tiene que usarse dentro de <AuthProvider>')
  }
  return context
}