import type { ScannedTicket } from '../types/digitalTicket';
import { http } from './http';

export const ticketService = {
  /**
   * Canjea un ticket en la puerta de un evento. El backend decide si habilita el ingreso:
   * revisa que el ticket exista, que sea de este evento y que no se haya usado.
   * Si lo rechaza, el motivo llega en el mensaje del error.
   */
  scan(qrCode: string, idEvent: number): Promise<ScannedTicket> {
    return http.post<ScannedTicket>('/digital-tickets/scan', { qr_code: qrCode, id_event: idEvent });
  },
};
