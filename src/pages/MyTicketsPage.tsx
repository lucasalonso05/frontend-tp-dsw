import { Tickets } from 'lucide-react';
import { useEffect, useState } from 'react';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Card from '../components/Card';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import OrderStatusBadge from '../components/OrderStatusBadge';
import PageHeader from '../components/PageHeader';
import TicketQr from '../components/TicketQr';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { orderService } from '../services/orderService';
import type { Order, OrderItem, OrderItemEntry } from '../types/order';
import { formatDateTime } from '../utils/dates';
import { formatPrice } from '../utils/money';

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

function MyTicketsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // La orden pendiente que se quiere cancelar, mientras se espera la confirmación.
  const [toCancel, setToCancel] = useState<Order | null>(null);

  useEffect(() => {
    let ignore = false;

    orderService
      .getAll()
      .then((data) => {
        if (!ignore) setOrders(data);
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // El backend devuelve la orden ya actualizada: se reemplaza en la lista.
  const replaceOrder = (updated: Order) => {
    setOrders(orders.map((order) => (order.id === updated.id ? updated : order)));
  };

  const handlePay = async (order: Order) => {
    try {
      replaceOrder(await orderService.pay(order.id));
      showToast('Orden pagada: ya podés generar los QR de tus entradas');
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleCancel = async (order: Order) => {
    setToCancel(null);
    try {
      replaceOrder(await orderService.cancel(order.id));
      showToast(`Se canceló la orden #${order.id}`);
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  // A un admin el backend le devuelve las órdenes de todos; esta pantalla es la de cada uno.
  const myOrders = orders.filter((order) => order.id_user === user?.id);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Mis entradas"
        description="Tus compras, de la más nueva a la más vieja. Generá el QR de cada entrada y mostralo en la puerta."
      />

      {loading && <Loading label="Cargando tus entradas…" />}

      {error && <Alert>{error}</Alert>}

      {!loading && !error && myOrders.length === 0 && (
        <EmptyState
          icon={Tickets}
          title="Todavía no compraste entradas"
          description="Elegí un evento de la cartelera: tus compras van a aparecer acá."
          action={<Button to="/">Ir a la cartelera</Button>}
        />
      )}

      <ul className="space-y-4">
        {myOrders.map((order) => (
          <li key={order.id}>
            <Card className="space-y-4 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold">Orden #{order.id}</h2>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-slate-600">
                    {order.date_time_payment
                      ? `Pagada el ${formatDateTime(order.date_time_payment)}`
                      : `Creada el ${formatDateTime(order.createdAt)}`}
                  </p>
                </div>
                <p className="text-lg font-semibold tabular-nums">{formatPrice(order.total)}</p>
              </div>

              {groupByEvent(order.items).map(({ event, items }) => (
                <div key={event.id} className="space-y-3 border-t border-slate-200 pt-4">
                  <div>
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-sm text-slate-600">
                      {formatDateTime(event.date_time_start)} · {event.FK_place.name},{' '}
                      {event.FK_place.city}
                    </p>
                  </div>

                  {items.map((item) => (
                    <div key={item.id} className="space-y-2">
                      <p className="text-sm">
                        {item.quantity} × {item.FK_entry.entry_name} ·{' '}
                        {formatPrice(item.unit_price)} c/u
                      </p>
                      {item.tickets.length > 0 && (
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
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {order.status === 'PENDING' && (
                <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-600">
                    Falta pagarla: las entradas quedan reservadas hasta que la pagues o la canceles.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="dangerOutline" size="sm" onClick={() => setToCancel(order)}>
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={() => handlePay(order)}>
                      Pagar
                    </Button>
                  </div>
                </div>
              )}

              {(order.status === 'CANCELLED' || order.status === 'EXPIRED') && (
                <p className="border-t border-slate-200 pt-4 text-sm text-slate-600">
                  Esta orden no tiene entradas: las que reservaba volvieron a la venta.
                </p>
              )}
            </Card>
          </li>
        ))}
      </ul>

      {toCancel && (
        <ConfirmDialog
          title="¿Cancelar la orden?"
          message={`La orden #${toCancel.id} se cancela y sus entradas vuelven a estar a la venta.`}
          confirmLabel="Cancelar orden"
          onConfirm={() => handleCancel(toCancel)}
          onCancel={() => setToCancel(null)}
        />
      )}
    </section>
  );
}

export default MyTicketsPage;
