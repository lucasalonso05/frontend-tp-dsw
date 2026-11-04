import type { DigitalTicket } from './digitalTicket';

export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED';

/** El tipo de entrada de una línea, con su evento, tal como los incluye el backend. */
export interface OrderItemEntry {
  entry_name: string;
  FK_event: {
    id: number;
    title: string;
    date_time_start: string;
    FK_place: { name: string; city: string };
  };
}

/** Una línea de la orden: cuántas entradas de un tipo se compraron y a qué precio. */
export interface OrderItem {
  id: number;
  quantity: number;
  /** Precio congelado al comprar. Llega como texto, igual que todos los montos. */
  unit_price: string;
  subtotal: string;
  id_order: number;
  id_entry: number;
  /** Uno por entrada comprada. Está vacío hasta que la orden se paga. */
  tickets: DigitalTicket[];
  FK_entry: OrderItemEntry;
  createdAt: string;
  updatedAt: string;
}

/** Una orden de compra tal como la devuelve el backend, con sus líneas y sus tickets. */
export interface Order {
  id: number;
  status: OrderStatus;
  total: string;
  date_time_payment: string | null;
  payment_reference: string | null;
  /** El comprador. */
  id_user: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

/** Lo que se manda para comprar: qué entradas y cuántas. El comprador sale del token. */
export interface CreateOrderDTO {
  items: { id_entry: number; quantity: number }[];
}

/** Una orden solo cambia de estado. Sin pasarela, la referencia del pago la inventa el backend. */
export interface UpdateOrderDTO {
  status: 'PAID' | 'CANCELLED' | 'EXPIRED';
  payment_reference?: string;
}

/** Nombre de cada estado para mostrar en pantalla. */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente de pago',
  PAID: 'Pagada',
  CANCELLED: 'Cancelada',
  EXPIRED: 'Vencida',
};
