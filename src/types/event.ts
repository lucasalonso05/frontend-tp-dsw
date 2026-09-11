import type { ISODateTime } from './api'
import type { Place } from './place'
import type { User } from './user'
import type { EntryWithAvailability } from './entry'


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


/**
 * Filtros de `GET /events`. Todos opcionales; se mandan como query params.
 *
 * Cubre el requisito del TP (categoría, ubicación, rango de fechas y estado)
 * más búsqueda por texto, rango de precio y ordenamiento.
 */
export interface EventFilters {
  /** Busca en el título, sin distinguir mayúsculas. */
  q?: string
  category?: string
  /** Ciudad y provincia viven en el LUGAR, no en el evento. */
  city?: string
  province?: string
  status?: EventStatus
  /** ISO. El evento entra si EMPIEZA dentro del rango. */
  desde?: ISODateTime
  hasta?: ISODateTime
  /** El evento entra si tiene al menos una entrada en el rango de precio. */
  precio_min?: number
  precio_max?: number
  orden?: 'fecha' | 'fecha_desc' | 'popularidad'
  page?: number
  /** Máximo 100: el backend rechaza valores mayores con 400. */
  limit?: number
}

/**
 * Un evento tal como lo devuelven `GET /events` y `GET /events/:id`: con el
 * lugar, el organizador y sus entradas ya incluidos.
 *
 * `Event` (arriba) es la fila pelada; esto es lo que viaja por la API.
 */
export interface EventWithRelations extends Event {
  FK_place: Place
  /** Lista blanca: el backend nunca manda el password ni el documento. */
  FK_user: Pick<User, 'id' | 'name' | 'surname' | 'email'>
  entries: EntryWithAvailability[]
}
