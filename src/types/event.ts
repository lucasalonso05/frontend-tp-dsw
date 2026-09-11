import type { ISODateTime } from './api'


export const EVENT_STATUSES = ['CONFIRMED', 'FINISHED', 'CANCELLED'] as const
export type EventStatus = (typeof EVENT_STATUSES)[number]


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

/**
 * Sin `id_user`: el backend toma el dueño del JWT, no del body. Mandarlo se
 * ignora. Solo un ORGANISER (o un ADMIN) puede crear.
 */
export interface CreateEventDTO {
  title: string
  category: string
  total_stock: number
  date_time_start: ISODateTime
  date_time_end: ISODateTime
  date_time_cancellation?: ISODateTime | null
  status?: EventStatus
  id_place: number
}

export type UpdateEventDTO = Partial<CreateEventDTO>
