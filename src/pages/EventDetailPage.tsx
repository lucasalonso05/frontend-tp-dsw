import { CalendarDays, MapPin, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Card from '../components/Card';
import ConfirmDialog from '../components/ConfirmDialog';
import EventStatusBadge from '../components/EventStatusBadge';
import Loading from '../components/Loading';
import PageHeader from '../components/PageHeader';
import SelectField from '../components/SelectField';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { entryService } from '../services/entryService';
import { eventService } from '../services/eventService';
import { orderService } from '../services/orderService';
import { placeService } from '../services/placeService';
import type { Entry } from '../types/entry';
import type { EventModel } from '../types/event';
import type { Order } from '../types/order';
import type { Place } from '../types/place';
import { formatDateTime } from '../utils/dates';
import { formatPrice } from '../utils/money';

interface EventDetail {
  event: EventModel;
  place: Place;
  entries: Entry[];
}

// Tope de la pantalla, no del negocio: el backend solo controla que alcance el stock.
const MAX_PER_ENTRY = 10;

async function loadDetail(eventId: number): Promise<EventDetail> {
  const event = await eventService.getById(eventId);
  const [place, entries] = await Promise.all([
    placeService.getById(event.id_place),
    entryService.getByEvent(eventId),
  ]);
  return { event, place, entries };
}

/** Cuántas quedan de una entrada. */
function availableOf(entry: Entry): number {
  return entry.stock - entry.sold_stock;
}

/** Se vende si queda stock y no venció: la misma regla que aplica el backend al comprar. */
function isOnSale(entry: Entry, now: Date): boolean {
  return availableOf(entry) > 0 && new Date(entry.date_time_end) > now;
}

/** Lo que se muestra debajo del precio: cuántas quedan o por qué no se vende. */
function availabilityLabel(entry: Entry, now: Date): string {
  if (new Date(entry.date_time_end) <= now) return 'Venta finalizada';
  const available = availableOf(entry);
  return available > 0 ? `${available} disponibles` : 'Agotada';
}

/** De 0 a lo que queda, sin pasar el tope de la pantalla. */
function quantityOptions(entry: Entry) {
  const max = Math.min(availableOf(entry), MAX_PER_ENTRY);
  return Array.from({ length: max + 1 }, (_, quantity) => ({
    value: String(quantity),
    label: String(quantity),
  }));
}

function EventDetailPage() {
  const { id } = useParams();
  const eventId = Number(id);
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [detail, setDetail] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Cuántas se eligieron de cada entrada, por id de entrada.
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [confirming, setConfirming] = useState(false);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    let ignore = false;

    loadDetail(eventId)
      .then((data) => {
        if (!ignore) setDetail(data);
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
  }, [eventId]);

  if (loading) return <Loading label="Cargando evento…" />;

  if (!detail) {
    return (
      <section className="space-y-6">
        <Alert>{error ?? 'No se pudo cargar el evento'}</Alert>
        <Button to="/" variant="secondary">
          Volver a la cartelera
        </Button>
      </section>
    );
  }

  const { event, place, entries } = detail;
  const sortedEntries = [...entries].sort((a, b) => Number(a.unit_price) - Number(b.unit_price));

  const now = new Date();
  // Solo se vende si el evento está activo y la entrada tiene stock y no venció.
  const onSaleEntries = event.status === 'CONFIRMED'
    ? sortedEntries.filter((entry) => isOnSale(entry, now))
    : [];
  const canBuy = user !== null && onSaleEntries.length > 0;

  const selected = onSaleEntries.filter((entry) => (quantities[entry.id] ?? 0) > 0);
  const count = selected.reduce((sum, entry) => sum + quantities[entry.id], 0);
  const countLabel = count === 1 ? '1 entrada' : `${count} entradas`;
  // Solo para mostrar: el total que se cobra lo calcula el backend con los precios de la base.
  const total = selected.reduce(
    (sum, entry) => sum + Number(entry.unit_price) * quantities[entry.id],
    0,
  );

  const setQuantity = (entryId: number, value: string) => {
    setQuantities({ ...quantities, [entryId]: Number(value) });
  };

  // Después de iniciar sesión, el login vuelve solo a este evento.
  const goToLogin = () => navigate('/ingresar', { state: { from: location.pathname } });

  const buy = async () => {
    setConfirming(false);
    setBuying(true);
    const items = selected.map((entry) => ({
      id_entry: entry.id,
      quantity: quantities[entry.id],
    }));

    // 1) Crear la orden, que reserva el stock. Si falla, no se compró nada.
    let order: Order;
    try {
      order = await orderService.create({ items });
    } catch (err) {
      showToast((err as Error).message, 'error');
      setQuantities({});
      setBuying(false);
      // Se recargan las entradas, por si el stock cambió mientras elegías.
      try {
        setDetail(await loadDetail(eventId));
      } catch {
        // Si la recarga falla, queda en pantalla lo que ya estaba.
      }
      return;
    }

    // 2) Pagarla. El pago es simulado, y es lo que emite los tickets.
    try {
      await orderService.pay(order.id);
      showToast('¡Listo! Tus entradas ya están en "Mis entradas"');
    } catch (err) {
      // La orden existe pero quedó pendiente: en "Mis entradas" se puede pagar o cancelar.
      showToast(`Tu orden quedó pendiente de pago: ${(err as Error).message}`, 'error');
    }
    navigate('/mis-entradas');
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title={event.title}
        description={event.FK_category.name}
        badge={<EventStatusBadge status={event.status} />}
        back={{ to: '/', label: 'Volver a la cartelera' }}
      />

      {event.status === 'CANCELLED' && (
        <Alert>
          Este evento fue cancelado
          {event.date_time_cancellation
            ? ` el ${formatDateTime(event.date_time_cancellation)}`
            : ''}
          .
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <Card>
            <h2 className="flex items-center gap-2 font-semibold">
              <CalendarDays className="size-4 text-slate-500" />
              Cuándo
            </h2>
            <p className="mt-1 text-sm">Empieza: {formatDateTime(event.date_time_start)}</p>
            <p className="text-sm">Termina: {formatDateTime(event.date_time_end)}</p>
          </Card>

          <Card>
            <h2 className="flex items-center gap-2 font-semibold">
              <MapPin className="size-4 text-slate-500" />
              Dónde
            </h2>
            <p className="mt-1 text-sm">{place.name}</p>
            <p className="text-sm text-slate-600">
              {place.street} {place.street_number}, {place.city}, {place.province}
            </p>
            <p className="text-sm text-slate-600">Capacidad: {place.capacity} personas</p>
            {place.description && <p className="mt-2 text-sm">{place.description}</p>}
          </Card>

          <Card>
            <h2 className="flex items-center gap-2 font-semibold">
              <UserRound className="size-4 text-slate-500" />
              Organiza
            </h2>
            <p className="mt-1 text-sm">
              {event.FK_user.name} {event.FK_user.surname}
            </p>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold">Entradas</h2>

          {sortedEntries.length === 0 && (
            <p className="mt-3 text-slate-600">Todavía no hay entradas a la venta.</p>
          )}

          <ul className="mt-3 space-y-3">
            {sortedEntries.map((entry) => {
              const onSale = isOnSale(entry, now);

              return (
                <li key={entry.id}>
                  <Card className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold">{entry.entry_name}</h3>
                      {entry.entry_description && (
                        <p className="text-sm text-slate-600">{entry.entry_description}</p>
                      )}
                      <p className="text-sm text-slate-600">
                        {formatDateTime(entry.date_time_start)} a{' '}
                        {formatDateTime(entry.date_time_end)}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-lg font-semibold tabular-nums">
                        {formatPrice(entry.unit_price)}
                      </p>
                      <p className={`text-sm ${onSale ? 'text-slate-600' : 'text-red-700'}`}>
                        {availabilityLabel(entry, now)}
                      </p>
                      {canBuy && onSaleEntries.includes(entry) && (
                        <div className="mt-2 sm:ml-auto sm:w-28">
                          <SelectField
                            label="Cantidad"
                            name={`quantity-${entry.id}`}
                            value={String(quantities[entry.id] ?? 0)}
                            options={quantityOptions(entry)}
                            onChange={(_, value) => setQuantity(entry.id, value)}
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>

          {onSaleEntries.length > 0 && (
            <Card className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {user ? (
                <>
                  <div>
                    <p className="text-sm text-slate-600">
                      {count === 0 ? 'Elegí cuántas querés de cada tipo de entrada' : countLabel}
                    </p>
                    <p className="text-lg font-semibold tabular-nums">Total: {formatPrice(total)}</p>
                  </div>
                  <Button onClick={() => setConfirming(true)} disabled={count === 0 || buying}>
                    {buying ? 'Comprando…' : 'Comprar'}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-600">
                    Para comprar entradas tenés que iniciar sesión.
                  </p>
                  <Button onClick={goToLogin}>Ingresá para comprar</Button>
                </>
              )}
            </Card>
          )}
        </div>
      </div>

      {confirming && (
        <ConfirmDialog
          title="¿Confirmás la compra?"
          message={`Vas a pagar ${formatPrice(total)} por ${countLabel} de "${event.title}". El pago es simulado: no se cobra nada de verdad.`}
          confirmLabel="Pagar"
          confirmVariant="primary"
          onConfirm={buy}
          onCancel={() => setConfirming(false)}
        />
      )}
    </section>
  );
}

export default EventDetailPage;
