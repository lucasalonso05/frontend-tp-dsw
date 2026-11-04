export type TicketStatus = 'UNSCANNED' | 'SCANNED';

/**
 * Un ticket digital: una entrada comprada, lista para mostrar en la puerta.
 * El backend emite uno por cada entrada cuando se paga la orden.
 */
export interface DigitalTicket {
  id: number;
  /** El código que se dibuja como QR. Es la llave de entrada al evento: no se comparte. */
  qr_code: string;
  status: TicketStatus;
  date_time_scan: string | null;
  id_order_item: number;
  /** El titular del ticket. */
  id_user: number;
  createdAt: string;
  updatedAt: string;
}

/** Nombre de cada estado para mostrar en pantalla. */
export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  UNSCANNED: 'Sin usar',
  SCANNED: 'Usada',
};
