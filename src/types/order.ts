import type { DecimalString, ISODateTime } from './api'
import type { DigitalTicket } from './digital-ticket'


export const ORDER_STATUSES = ['PENDING', 'PAID', 'CANCELLED', 'EXPIRED'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export interface OrderItem {
  id: number
  quantity: number
  /** Precio congelado al momento de la compra. */
  unit_price: DecimalString
  /** unit_price * quantity, calculado por el backend. */
  subtotal: DecimalString
  id_order: number
  id_entry: number
  /**
   * Tickets emitidos para este ítem. Vienen vacíos mientras la orden está
   * PENDING y se llenan solos al pasar a PAID (el backend los emite en la
   * misma transacción del pago).
   */
  tickets: DigitalTicket[]
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

/**
 * Orden de compra.
 * Todos los endpoints de /orders devuelven `items` incluido, así que no es
 * opcional. PENDING descuenta stock; CANCELLED y EXPIRED lo devuelven.
 */
export interface Order {
  id: number
  status: OrderStatus
  /** Suma de los subtotales, calculada por el backend. */
  total: DecimalString
  /** Se completa solo cuando la orden pasa a PAID. */
  date_time_payment: ISODateTime | null
  /** Id de la transacción en la pasarela de pago. */
  payment_reference: string | null
  id_user: number
  items: OrderItem[]
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

/** Una línea del carrito al crear la orden. */
export interface CreateOrderItemDTO {
  id_entry: number
  quantity: number
}

/**
 * Sin `id_user`: el backend lo toma del JWT, no del body. Mandarlo se ignora.
 */
export interface CreateOrderDTO {
  /** Mínimo, un ítem. */
  items: CreateOrderItemDTO[]
}

export interface UpdateOrderDTO {
  status?: OrderStatus
  payment_reference?: string
}
