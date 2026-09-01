import type { ISODateTime } from './api'

/** Endpoints: /events */

export const EVENT_STATUSES = ['CONFIRMED', 'FINISHED', 'CANCELLED'] as const
export type EventStatus = (typeof EVENT_STATUSES)[number]

/**
 * Evento tal como lo devuelve la API.
 *
 * CUIDADO: `Event` también es un tipo global del DOM. Dentro de un archivo que
 * importe este, el nombre queda pisado por el nuestro. Si en ese mismo archivo
 * necesitás el del navegador, usá `globalThis.Event`; o importá este con alias:
 * `import type { Event as EventoApi } from '../types'`.
 */
export interface Event {
  id: number
  title: string
  category: string
  date_time_start: ISODateTime
  date_time_end: ISODateTime
  status: EventStatus
  /** Tope declarado del evento. Nunca supera la capacity del lugar. */
  total_stock: number
  /** Solo tiene valor cuando el evento fue cancelado. */
  date_time_cancellation: ISODateTime | null
  /** Organizador. El backend valida que su role sea ORGANISER. */
  id_user: number
  id_place: number
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

/** Body de POST /events. `status` es opcional: el backend usa CONFIRMED por defecto. */
export interface CreateEventDTO {
  title: string
  category: string
  total_stock: number
  date_time_start: ISODateTime
  date_time_end: ISODateTime
  date_time_cancellation?: ISODateTime | null
  status?: EventStatus
  id_user: number
  id_place: number
}

/** Body de PUT /events/:id. Todos los campos son opcionales. */
export type UpdateEventDTO = Partial<CreateEventDTO>
