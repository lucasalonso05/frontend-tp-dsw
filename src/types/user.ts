import type { ISODateTime } from './api'


export const USER_ROLES = ['ASSISTANT', 'ORGANISER', 'ADMIN'] as const
export type UserRole = (typeof USER_ROLES)[number]

/*
 * Coincide con el `user_select` del backend: la API nunca devuelve `password`.
 */
export interface User {
  id: number
  role: UserRole
  doc_type: string
  doc_number: string
  name: string
  surname: string
  email: string
  telephone: string
  /** Solo lo cargan los organizadores; en el resto llega null. */
  cuit: string | null
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

export interface CreateUserDTO {
  role?: UserRole
  doc_type: string
  doc_number: string
  name: string
  surname: string
  email: string
  password: string
  telephone: string
  cuit?: string
}

export type UpdateUserDTO = Partial<CreateUserDTO>

/**
 * `password` no figura en este tipo porque la API no la devuelve: el backend
 * aplica un `select` explícito (user_select en user.service.ts) en todas las
 * lecturas, y la guarda hasheada con bcrypt. La interfaz de arriba refleja
 * exactamente ese select.
 */
