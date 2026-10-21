import { createContext } from 'react'
import type { User } from '../types/user'

export interface AuthContextValue {
  /** Quién inició sesión, o null si nadie. */
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

/** La sesión, compartida con toda la aplicación. */
export const AuthContext = createContext<AuthContextValue | null>(null)