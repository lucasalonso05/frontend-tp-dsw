import type { CreateEventDTO, EventModel, UpdateEventDTO } from '../types/event';
import { CrudService } from './CrudService';
import { http } from './http';

class EventService extends CrudService<EventModel, CreateEventDTO, UpdateEventDTO> {
  constructor() {
    super('/events');
  }

  /** El DELETE del backend no borra el evento: lo marca como cancelado y lo devuelve. */
  cancel(id: number): Promise<EventModel> {
    return http.delete<EventModel>(`${this.path}/${id}`);
  }
}

export const eventService = new EventService();
