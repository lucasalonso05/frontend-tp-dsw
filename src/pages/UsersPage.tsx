import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import PageHeader from '../components/PageHeader';
import { useToast } from '../hooks/useToast';
import { userService } from '../services/userService';
import { USER_ROLE_LABELS } from '../types/user';
import type { User, UserRole } from '../types/user';

type RoleFilter = UserRole | 'ALL';

const filters: { value: RoleFilter; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'ASSISTANT', label: 'Asistentes' },
  { value: 'ORGANISER', label: 'Organizadores' },
  { value: 'ADMIN', label: 'Administradores' },
];

function UsersPage() {
  const { showToast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // La persona que se quiere eliminar, mientras se espera la confirmación.
  const [toDelete, setToDelete] = useState<User | null>(null);

  useEffect(() => {
    let ignore = false;

    userService
      .getAll()
      .then((data) => {
        if (!ignore) setUsers(data);
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

  const handleDelete = async (user: User) => {
    setToDelete(null);
    try {
      await userService.remove(user.id);
      setUsers(users.filter((item) => item.id !== user.id));
      showToast(`Se eliminó a ${user.name} ${user.surname}`);
    } catch {
      showToast(
        'No se pudo eliminar a la persona. Si tiene eventos, lugares, compras o entradas asociadas, no se puede borrar.',
        'error',
      );
    }
  };

  const visibleUsers = roleFilter === 'ALL' ? users : users.filter((user) => user.role === roleFilter);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Personas"
        action={<Button to="/personas/nueva">Nueva persona</Button>}
      />

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            aria-pressed={roleFilter === filter.value}
            onClick={() => setRoleFilter(filter.value)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
              roleFilter === filter.value
                ? 'border-blue-800 bg-blue-800 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {loading && <Loading label="Cargando personas…" />}

      {error && <Alert>{error}</Alert>}

      {!loading && !error && visibleUsers.length === 0 && (
        <EmptyState icon={Users} title="No hay personas para mostrar" />
      )}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleUsers.map((user) => (
          <li key={user.id}>
            <Card className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold">
                  {user.name} {user.surname}
                </h2>
                <Badge>{USER_ROLE_LABELS[user.role]}</Badge>
              </div>
              <p className="mt-1 text-sm break-all text-slate-600">{user.email}</p>
              <p className="text-sm text-slate-600">{user.telephone}</p>
              <p className="mt-2 text-sm">
                {user.doc_type} {user.doc_number}
              </p>

              <div className="mt-auto flex gap-2 pt-4">
                <Button to={`/personas/${user.id}/editar`} variant="secondary" size="sm">
                  Editar
                </Button>
                <Button variant="dangerOutline" size="sm" onClick={() => setToDelete(user)}>
                  Eliminar
                </Button>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      {toDelete && (
        <ConfirmDialog
          title="¿Eliminar a esta persona?"
          message={`Se va a eliminar a ${toDelete.name} ${toDelete.surname}. Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          onConfirm={() => handleDelete(toDelete)}
          onCancel={() => setToDelete(null)}
        />
      )}
    </section>
  );
}

export default UsersPage;
