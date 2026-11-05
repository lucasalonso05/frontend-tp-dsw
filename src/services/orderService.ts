import type { CreateOrderDTO, Order, UpdateOrderDTO } from '../types/order';
import { CrudService } from './CrudService';

class OrderService extends CrudService<Order, CreateOrderDTO, UpdateOrderDTO> {
  constructor() {
    super('/orders');
  }

  /** Pago simulado: no hay pasarela. El backend marca la orden como pagada y emite los tickets. */
  pay(id: number): Promise<Order> {
    return this.update(id, { status: 'PAID' });
  }

  /** Cancela una orden pendiente: el backend libera las entradas que tenía reservadas. */
  cancel(id: number): Promise<Order> {
    return this.update(id, { status: 'CANCELLED' });
  }
}

export const orderService = new OrderService();
