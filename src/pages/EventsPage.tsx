import { CalendarDays } from 'lucide-react';
import { useEffect, useState } from 'react';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Card from '../components/Card';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import EventStatusBadge from '../components/EventStatusBadge';
import Loading from '../components/Loading';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { eventService } from '../services/eventService';
import { placeService } from '../services/placeService';
import type { EventModel } from '../types/event';
import type { Place } from '../types/place';
import { formatDateTime } from '../utils/dates';
import { canManage } from '../utils/permissions';

function EventsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'ADMIN';

  const [events, setEvents] = useState<EventModel[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // El evento que se quiere cancelar, mientras se espera la confirmación.
  const [toCancel, setToCancel] = useState<EventModel | null>(null);

  useEffect(() => {
    let ignore = false;

    Promise.all([eventService.getAll(), placeService.getAll()])
      .then(([eventList, placeList]) => {
        if (ignore) return;
        setEvents(eventList);
        setPlaces(placeList);
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

  const handleCancel = async (event: EventModel) => {
    setToCancel(null);
    try {
      const cancelled = await eventService.cancel(event.id);
      setEvents(events.map((item) => (item.id === cancelled.id ? cancelled : item)));
      showToast(`Se canceló el evento "${event.title}"`);
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const placeName = (id: number) => places.find((place) => place.id === id)?.name ?? 'Lugar no disponible';

  // Un organizador ve solo sus eventos; un admin, todos.
  const visibleEvents = events
    .filter((event) => canManage(user, event.id_user))
    .sort((a, b) => a.date_time_start.localeCompare(b.date_time_start));

  return (
    <section className="space-y-6">
      <PageHeader
        title={isAdmin ? 'Gestión de eventos' : 'Mis eventos'}
        action={<Button to="/eventos/nuevo">Nuevo evento</Button>}
      />

      {loading && <Loading label="Cargando eventos…" />}

      {error && <Alert>{error}</Alert>}

      {!loading && !error && visibleEvents.length === 0 && (
        <EmptyState
          icon={CalendarDays}
          title={isAdmin ? 'Todavía no hay eventos' : 'Todavía no creaste ningún evento'}
          description="Creá un evento y después cargale los tipos de entrada que se van a vender."
        />
      )}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleEvents.map((event) => (
          <li key={event.id}>
            <Card className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold">{event.title}</h2>
                <EventStatusBadge status={event.status} />
              </div>
              <p className="text-sm text-slate-600">{event.category}</p>
              <p className="mt-2 text-sm">
                {formatDateTime(event.date_time_start)} a {formatDateTime(event.date_time_end)}
              </p>
              <p className="text-sm text-slate-600">{placeName(event.id_place)}</p>
              {isAdmin && (
                <p className="text-sm text-slate-600">
                  Organiza: {event.FK_user.name} {event.FK_user.surname}
                </p>
              )}
              <p className="mt-2 text-sm">Stock total: {event.total_stock} entradas</p>

              <div className="mt-auto flex flex-wrap gap-2 pt-4">
                <Button to={`/eventos/${event.id}/editar`} variant="secondary" size="sm">
                  Editar
                </Button>
                <Button to={`/eventos/${event.id}/entradas`} variant="secondary" size="sm">
                  Entradas
                </Button>
                {event.status !== 'CANCELLED' && (
                  <Button variant="dangerOutline" size="sm" onClick={() => setToCancel(event)}>
                    Cancelar evento
                  </Button>
                )}
              </div>
            </Card>
          </li>
        ))}
      </ul>

      {toCancel && (
        <ConfirmDialog
          title="¿Cancelar el evento?"
          message={`"${toCancel.title}" va a quedar cancelado y no se van a poder vender más entradas.`}
          confirmLabel="Cancelar evento"
          onConfirm={() => handleCancel(toCancel)}
          onCancel={() => setToCancel(null)}
        />
      )}
    </section>
  );
}

export default EventsPage;
