export type EventStatus = 'CONFIRMED' | 'FINISHED' | 'CANCELLED'

/** Los datos públicos del organizador que el backend manda dentro de cada evento. */
export interface EventOrganiser {
  id: number
  name: string
  surname: string
}

/**
 * Un evento tal como lo devuelve el backend.
 * Se llama EventModel porque `Event` ya existe en el navegador (es el tipo de un clic o una tecla).
 */
export interface EventModel {
  id: number
  title: string
  category: string
  date_time_start: string
  date_time_end: string
  status: EventStatus
  total_stock: number
  date_time_cancellation: string | null
  id_user: number
  id_place: number
  /** El organizador del evento, incluido por el backend. */
  FK_user: EventOrganiser
  createdAt: string
  updatedAt: string
}

export interface CreateEventDTO {
  title: string
  category: string
  total_stock: number
  date_time_start: string
  date_time_end: string
  status?: EventStatus
  date_time_cancellation?: string | null
  /** Solo lo manda un admin, para crear a nombre de un organizador. Si no, sale del token. */
  id_user?: number
  id_place: number
}

export type UpdateEventDTO = Partial<CreateEventDTO>

/** Nombre de cada estado para mostrar en pantalla. */
export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  CONFIRMED: 'Activo',
  FINISHED: 'Finalizado',
  CANCELLED: 'Cancelado',
}