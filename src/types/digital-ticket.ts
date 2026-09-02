import type { ISODateTime } from './api'

/** Endpoints: /digital-tickets */

export const TICKET_STATUSES = ['UNSCANNED', 'SCANNED'] as const
export type TicketStatus = (typeof TICKET_STATUSES)[number]

//Se emite uno por cada unidad comprada en un order_item.

export interface DigitalTicket {
  id: number
  qr_code: string
  status: TicketStatus
  date_time_scan: ISODateTime | null
  id_order_item: number
  id_user: number
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

export interface CreateDigitalTicketDTO {
  id_order_item: number
  id_user: number
}

export interface UpdateDigitalTicketDTO {
  status: TicketStatus
}
