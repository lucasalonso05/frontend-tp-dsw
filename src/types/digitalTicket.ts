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

/**
 * El ticket que devuelve el escaneo cuando el backend lo aprueba:
 * viene con su titular, su tipo de entrada y su evento, para mostrarlos en la puerta.
 */
export interface ScannedTicket extends DigitalTicket {
  FK_user: { id: number; name: string; surname: string };
  FK_order_item: {
    FK_entry: {
      entry_name: string;
      FK_event: { id: number; title: string };
    };
  };
}

/** Nombre de cada estado para mostrar en pantalla. */
export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  UNSCANNED: 'Sin usar',
  SCANNED: 'Usada',
};
