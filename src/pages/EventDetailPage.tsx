import { CalendarDays, MapPin, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Card from '../components/Card';
import EventStatusBadge from '../components/EventStatusBadge';
import Loading from '../components/Loading';
import PageHeader from '../components/PageHeader';
import { entryService } from '../services/entryService';
import { eventService } from '../services/eventService';
import { placeService } from '../services/placeService';
import type { Entry } from '../types/entry';
import type { EventModel } from '../types/event';
import type { Place } from '../types/place';
import { formatDateTime } from '../utils/dates';
import { formatPrice } from '../utils/money';

interface EventDetail {
  event: EventModel;
  place: Place;
  entries: Entry[];
}

async function loadDetail(eventId: number): Promise<EventDetail> {
  const event = await eventService.getById(eventId);
  const [place, entries] = await Promise.all([
    placeService.getById(event.id_place),
    entryService.getByEvent(eventId),
  ]);
  return { event, place, entries };
}

function EventDetailPage() {
  const { id } = useParams();
  const eventId = Number(id);

  const [detail, setDetail] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <section className="space-y-6">
      <PageHeader
        title={event.title}
        description={event.category}
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
              const available = entry.stock - entry.sold_stock;

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
                      <p className={`text-sm ${available > 0 ? 'text-slate-600' : 'text-red-700'}`}>
                        {available > 0 ? `${available} disponibles` : 'Agotada'}
                      </p>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default EventDetailPage;
