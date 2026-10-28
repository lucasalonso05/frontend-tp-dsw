import { Ticket } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Card from '../components/Card';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { entryService } from '../services/entryService';
import { eventService } from '../services/eventService';
import type { Entry } from '../types/entry';
import type { EventModel } from '../types/event';
import { formatDateTime } from '../utils/dates';
import { formatPrice } from '../utils/money';
import { canManage } from '../utils/permissions';
import ForbiddenPage from './ForbiddenPage';

function EntriesPage() {
  const { id } = useParams();
  const eventId = Number(id);
  const { user } = useAuth();
  const { showToast } = useToast();

  const [event, setEvent] = useState<EventModel | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // La entrada que se quiere eliminar, mientras se espera la confirmación.
  const [toDelete, setToDelete] = useState<Entry | null>(null);

  useEffect(() => {
    let ignore = false;

    Promise.all([eventService.getById(eventId), entryService.getByEvent(eventId)])
      .then(([eventData, entryList]) => {
        if (ignore) return;
        setEvent(eventData);
        setEntries(entryList);
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

  const handleDelete = async (entry: Entry) => {
    setToDelete(null);
    try {
      await entryService.remove(entry.id);
      setEntries(entries.filter((item) => item.id !== entry.id));
      showToast(`Se eliminó la entrada "${entry.entry_name}"`);
    } catch {
      showToast('No se pudo eliminar la entrada. Si ya tiene ventas, no se puede borrar.', 'error');
    }
  };

  // Un organizador no puede gestionar las entradas del evento de otro.
  if (event && !canManage(user, event.id_user)) return <ForbiddenPage />;
  const assigned = entries.reduce((sum, entry) => sum + entry.stock, 0);
  const unassigned = event ? event.total_stock - assigned : 0;
  const sortedEntries = [...entries].sort((a, b) => Number(a.unit_price) - Number(b.unit_price));

  return (
    <section className="space-y-6">
      <PageHeader
        title={event ? `Entradas de ${event.title}` : 'Entradas'}
        back={{ to: '/eventos', label: 'Volver a eventos' }}
        action={event && unassigned > 0 && (
          <Button to={`/eventos/${eventId}/entradas/nueva`}>Nueva entrada</Button>
        )}
      />

      {loading && <Loading label="Cargando entradas…" />}

      {error && <Alert>{error}</Alert>}

      {event && (
        <Card className="text-sm">
          Stock del evento: <strong>{event.total_stock}</strong> · Asignado a entradas:{' '}
          <strong>{assigned}</strong> · Sin asignar: <strong>{unassigned}</strong>
        </Card>
      )}

      {!loading && !error && entries.length === 0 && (
        <EmptyState
          icon={Ticket}
          title="Este evento todavía no tiene entradas"
          description="Creá al menos un tipo de entrada (por ejemplo, General o VIP) para que se pueda vender."
        />
      )}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedEntries.map((entry) => (
          <li key={entry.id}>
            <Card className="flex h-full flex-col">
              <h2 className="font-semibold">{entry.entry_name}</h2>
              {entry.entry_description && (
                <p className="text-sm text-slate-600">{entry.entry_description}</p>
              )}
              <p className="mt-2 text-lg font-semibold tabular-nums">
                {formatPrice(entry.unit_price)}
              </p>
              <p className="text-sm text-slate-600">
                {formatDateTime(entry.date_time_start)} a {formatDateTime(entry.date_time_end)}
              </p>
              <p className="mt-2 text-sm">
                Stock: {entry.stock} · Vendidas: {entry.sold_stock} · Disponibles:{' '}
                {entry.stock - entry.sold_stock}
              </p>

              <div className="mt-auto flex gap-2 pt-4">
                <Button
                  to={`/eventos/${eventId}/entradas/${entry.id}/editar`}
                  variant="secondary"
                  size="sm"
                >
                  Editar
                </Button>
                <Button variant="dangerOutline" size="sm" onClick={() => setToDelete(entry)}>
                  Eliminar
                </Button>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      {toDelete && (
        <ConfirmDialog
          title="¿Eliminar la entrada?"
          message={`Se va a eliminar "${toDelete.entry_name}". Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          onConfirm={() => handleDelete(toDelete)}
          onCancel={() => setToDelete(null)}
        />
      )}
    </section>
  );
}

export default EntriesPage;
