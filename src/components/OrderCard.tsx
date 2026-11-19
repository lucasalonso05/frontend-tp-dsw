import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import type { Order, OrderItem, OrderItemEntry } from '../types/order';
import { formatDateTime } from '../utils/dates';
import { formatPrice } from '../utils/money';
import Card from './Card';
import TicketQr from './TicketQr';

interface EventGroup {
  event: OrderItemEntry['FK_event'];
  items: OrderItem[];
}

/**
 * Junta las líneas de una orden por evento, para mostrar cada evento una sola vez.
 * La pantalla de compra arma órdenes de un solo evento, pero el modelo permite mezclar.
 */
function groupByEvent(items: OrderItem[]): EventGroup[] {
  const groups = new Map<number, EventGroup>();
  items.forEach((item) => {
    const event = item.FK_entry.FK_event;
    const group = groups.get(event.id) ?? { event, items: [] };
    group.items.push(item);
    groups.set(event.id, group);
  });
  return [...groups.values()];
}

interface OrderCardProps {
  order: Order;
  /** Si arranca abierta. Se lee una sola vez: después decide el comprador. */
  defaultOpen?: boolean;
}

/**
 * Una orden pagada como fila desplegable. Cerrada muestra lo justo para reconocerla;
 * abierta, sus entradas con el QR de cada una. Cada orden guarda si está abierta,
 * igual que cada TicketQr guarda si muestra su QR.
 */
function OrderCard({ order, defaultOpen = false }: OrderCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  // Une el botón con el panel que abre, para los lectores de pantalla.
  const panelId = useId();

  const groups = groupByEvent(order.items);
  const [first] = groups;
  // Una orden siempre tiene al menos una línea; si no, no hay nada que mostrar.
  if (!first) return null;

  const otherEvents = groups.length - 1;
  const ticketCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card className="sm:p-6">
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(!open)}
          className="flex w-full items-start gap-3 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-800"
        >
          <ChevronDown
            aria-hidden="true"
            className={`mt-0.5 size-5 shrink-0 text-slate-500 transition-transform ${open ? '' : '-rotate-90'}`}
          />
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">
              {first.event.title}
              {otherEvents > 0 && ` y ${otherEvents} evento${otherEvents > 1 ? 's' : ''} más`}
            </span>
            <span className="block text-sm text-slate-600">
              {formatDateTime(first.event.date_time_start)} · {first.event.FK_place.name},{' '}
              {first.event.FK_place.city}
            </span>
            <span className="block text-sm text-slate-500">
              {ticketCount === 1 ? '1 entrada' : `${ticketCount} entradas`} · Orden #{order.id}
              {order.date_time_payment && ` · comprada el ${formatDateTime(order.date_time_payment)}`}
            </span>
          </span>
          <span className="shrink-0 text-lg font-semibold tabular-nums">{formatPrice(order.total)}</span>
        </button>
      </h2>

      {/* Cerrada se oculta pero no se desarma: un QR abierto sigue abierto al volver. */}
      <div id={panelId} hidden={!open} className="mt-4 space-y-4 border-t border-slate-200 pt-4">
        {groups.map(({ event, items }) => (
          <div key={event.id} className="space-y-3">
            {/* El evento ya está en la cabecera; solo se repite si la orden tiene más de uno. */}
            {groups.length > 1 && <h3 className="font-semibold">{event.title}</h3>}

            {items.map((item) => (
              <div key={item.id} className="space-y-2">
                <p className="text-sm">
                  {item.quantity} × {item.FK_entry.entry_name} · {formatPrice(item.unit_price)} c/u
                </p>
                <ul className="grid items-start gap-2 sm:grid-cols-2">
                  {item.tickets.map((ticket, index) => (
                    <li key={ticket.id}>
                      <TicketQr
                        ticket={ticket}
                        label={`${item.FK_entry.entry_name} · ${index + 1} de ${item.tickets.length}`}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

export default OrderCard;
