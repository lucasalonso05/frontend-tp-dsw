import type { ISODateTime } from './api'

/** Endpoints: /users */

export const USER_ROLES = ['ASSISTANT', 'ORGANISER', 'ADMIN'] as const
export type UserRole = (typeof USER_ROLES)[number]

/**
 * Usuario tal como lo devuelve la API.
 *
 * `password` existe en la base pero no se declara acá a propósito: el frontend
 * no debe leerla nunca. Ver la nota de seguridad al final del archivo.
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

/** Body de POST /users. `role` es opcional: el backend usa ASSISTANT por defecto. */
export interface CreateUserDTO {
  role?: UserRole
  doc_type: string
  /** Entre 7 y 10 caracteres. */
  doc_number: string
  name: string
  surname: string
  email: string
  /** Mínimo 8 caracteres. Solo se envía, nunca se recibe. */
  password: string
  /** Máximo 15 caracteres. */
  telephone: string
  /** Máximo 12 caracteres. */
  cuit?: string
}

/** Body de PUT /users/:id. Todos los campos son opcionales. */
export type UpdateUserDTO = Partial<CreateUserDTO>

/**
 * OJO: hoy GET /users y GET /users/:id devuelven el objeto completo de Prisma,
 * incluido el hash de `password`. Es un problema del backend que conviene
 * arreglar allá (con un `select` o un `omit` en user.service.ts), no acá.
 * Este tipo ya lo excluye para que nadie lo use sin querer desde el frontend.
 */
