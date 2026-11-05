import { ORDER_STATUS_LABELS } from '../types/order';
import type { OrderStatus } from '../types/order';
import Badge from './Badge';
import type { BadgeTone } from './Badge';

// Verde = pagada, ámbar = falta pagar, rojo = cancelada, gris = vencida.
const statusTones: Record<OrderStatus, BadgeTone> = {
  PAID: 'green',
  PENDING: 'amber',
  CANCELLED: 'red',
  EXPIRED: 'slate',
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return <Badge tone={statusTones[status]}>{ORDER_STATUS_LABELS[status]}</Badge>;
}

export default OrderStatusBadge;
