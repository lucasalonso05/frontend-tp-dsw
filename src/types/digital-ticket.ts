import type { ISODateTime } from './api'

/** Endpoints: /digital-tickets */

export const TICKET_STATUSES = ['UNSCANNED', 'SCANNED'] as const
export type TicketStatus = (typeof TICKET_STATUSES)[number]

/**
 * Ticket digital: una unidad concreta de acceso, con su QR.
 * Se emite uno por cada unidad comprada en un order_item.
 */
export interface DigitalTicket {
  id: number
  /** UUID que va dentro del QR. Nunca es el id, para que no sea adivinable. */
  qr_code: string
  status: TicketStatus
  /** Se completa al escanear el ticket en la puerta. */
  date_time_scan: ISODateTime | null
  id_order_item: number
  /** Titular del ticket. Puede no ser quien pagó la orden. */
  id_user: number
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

/**
 * Body de POST /digital-tickets.
 * El `qr_code` lo genera el backend, no se manda.
 */
export interface CreateDigitalTicketDTO {
  id_order_item: number
  id_user: number
}

/** Body del endpoint de actualización de estado. */
export interface UpdateDigitalTicketDTO {
  status: TicketStatus
}
