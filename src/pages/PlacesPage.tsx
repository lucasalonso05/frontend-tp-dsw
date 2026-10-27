import { MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Card from '../components/Card';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { placeService } from '../services/placeService';
import type { Place } from '../types/place';
import { canManage } from '../utils/permissions';

function PlacesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'ADMIN';

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // El lugar que se quiere eliminar, mientras se espera la confirmación.
  const [toDelete, setToDelete] = useState<Place | null>(null);

  useEffect(() => {
    let ignore = false;

    placeService
      .getAll()
      .then((data) => {
        if (!ignore) setPlaces(data);
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

  const handleDelete = async (place: Place) => {
    setToDelete(null);
    try {
      await placeService.remove(place.id);
      setPlaces(places.filter((item) => item.id !== place.id));
      showToast(`Se eliminó el lugar "${place.name}"`);
    } catch {
      showToast('No se pudo eliminar el lugar. Si tiene eventos asociados, no se puede borrar.', 'error');
    }
  };

  // Un organizador ve solo sus lugares; un admin, todos.
  const visiblePlaces = places.filter((place) => canManage(user, place.id_user));

  return (
    <section className="space-y-6">
      <PageHeader
        title={isAdmin ? 'Lugares' : 'Mis lugares'}
        action={<Button to="/lugares/nuevo">Nuevo lugar</Button>}
      />

      {loading && <Loading label="Cargando lugares…" />}

      {error && <Alert>{error}</Alert>}

      {!loading && !error && visiblePlaces.length === 0 && (
        <EmptyState
          icon={MapPin}
          title={isAdmin ? 'Todavía no hay lugares' : 'Todavía no cargaste ningún lugar'}
          description="Los eventos se hacen en un lugar: cargá uno para poder crear eventos."
        />
      )}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visiblePlaces.map((place) => (
          <li key={place.id}>
            <Card className="flex h-full flex-col">
              <h2 className="font-semibold">{place.name}</h2>
              <p className="text-sm text-slate-600">
                {place.street} {place.street_number}, {place.city}, {place.province}
              </p>
              <p className="mt-2 text-sm">Capacidad: {place.capacity} personas</p>

              <div className="mt-auto flex gap-2 pt-4">
                <Button to={`/lugares/${place.id}/editar`} variant="secondary" size="sm">
                  Editar
                </Button>
                <Button variant="dangerOutline" size="sm" onClick={() => setToDelete(place)}>
                  Eliminar
                </Button>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      {toDelete && (
        <ConfirmDialog
          title="¿Eliminar el lugar?"
          message={`Se va a eliminar "${toDelete.name}". Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          onConfirm={() => handleDelete(toDelete)}
          onCancel={() => setToDelete(null)}
        />
      )}
    </section>
  );
}

export default PlacesPage;
