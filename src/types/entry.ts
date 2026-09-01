import type { DecimalString, ISODateTime } from './api'

/** Endpoints: /entries */

/**
 * Tipo de entrada de un evento (General, VIP, Early bird...).
 * El cupo real vive acá, no en el evento: se valida que la suma de los `stock`
 * de todas las entries no supere el `total_stock` del evento.
 */
export interface Entry {
  id: number
  entry_name: string
  entry_description: string | null
  /** Decimal(10,2) serializado como string. Ej: "1500.00" */
  unit_price: DecimalString
  date_time_start: ISODateTime
  date_time_end: ISODateTime
  /** Cupo fijo de este tipo de entrada. Al editar, nunca menor a sold_stock. */
  stock: number
  /** Vendidas o reservadas. Disponibles = stock - sold_stock. */
  sold_stock: number
  id_event: number
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

/**
 * Body de POST /entries.
 *
 * `unit_price` va como number acá (así lo valida Zod en el backend), aunque
 * en las respuestas vuelva como string. No es un error: entra number, sale string.
 */
export interface CreateEntryDTO {
  entry_name: string
  entry_description?: string
  /** Number con hasta 2 decimales. */
  unit_price: number
  date_time_start: ISODateTime
  date_time_end: ISODateTime
  stock: number
  id_event: number
}

/** Body de PUT /entries/:id. Todos los campos son opcionales. */
export type UpdateEntryDTO = Partial<CreateEntryDTO>
