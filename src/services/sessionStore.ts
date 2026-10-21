import type { Session } from '../types/auth'

const KEY = 'eventify.session'

/** Nombre del evento que se dispara cuando el backend rechaza el token. */
export const SESSION_EXPIRED = 'eventify:session-expired'

/** La sesión guardada en el navegador, o null si no hay ninguna. */
export function loadSession(): Session | null {
  try {
    const saved = localStorage.getItem(KEY)
    return saved ? (JSON.parse(saved) as Session) : null
  } catch {
    return null
  }
}

export function saveSession(session: Session): void {
  localStorage.setItem(KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.removeItem(KEY)
}