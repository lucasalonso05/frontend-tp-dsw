/** Un tipo de entrada de un evento (General, VIP...) tal como lo devuelve el backend. */
export interface Entry {
  id: number;
  entry_name: string;
  entry_description: string | null;
  /** El backend lo devuelve como texto ("1500.5"), no como número. */
  unit_price: string;
  date_time_start: string;
  date_time_end: string;
  stock: number;
  /** Vendidas o reservadas. Lo actualiza el backend con cada compra. */
  sold_stock: number;
  id_event: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntryDTO {
  entry_name: string;
  entry_description?: string;
  /** Al enviar va como número. */
  unit_price: number;
  date_time_start: string;
  date_time_end: string;
  stock: number;
  id_event: number;
}

export type UpdateEntryDTO = Partial<CreateEntryDTO>;
