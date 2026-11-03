import { Tags } from 'lucide-react';
import { useEffect, useState } from 'react';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Card from '../components/Card';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import PageHeader from '../components/PageHeader';
import { useToast } from '../hooks/useToast';
import { categoryService } from '../services/categoryService';
import type { Category } from '../types/category';

function CategoriesPage() {
  const { showToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // La categoría que se quiere eliminar, mientras se espera la confirmación.
  const [toDelete, setToDelete] = useState<Category | null>(null);

  useEffect(() => {
    let ignore = false;

    categoryService
      .getAll()
      .then((data) => {
        if (!ignore) setCategories(data);
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

  const handleDelete = async (category: Category) => {
    setToDelete(null);
    try {
      await categoryService.remove(category.id);
      setCategories(categories.filter((item) => item.id !== category.id));
      showToast(`Se eliminó la categoría "${category.name}"`);
    } catch (err) {
      // El backend avisa si la categoría tiene eventos: ahí no se puede borrar.
      showToast((err as Error).message, 'error');
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="Categorías"
        description="Son las que los organizadores eligen al cargar un evento."
        action={<Button to="/categorias/nueva">Nueva categoría</Button>}
      />

      {loading && <Loading label="Cargando categorías…" />}

      {error && <Alert>{error}</Alert>}

      {!loading && !error && categories.length === 0 && (
        <EmptyState
          icon={Tags}
          title="Todavía no hay categorías"
          description="Cargá una para que los organizadores puedan clasificar sus eventos."
        />
      )}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <li key={category.id}>
            <Card className="flex h-full flex-col">
              <h2 className="font-semibold">{category.name}</h2>

              <div className="mt-auto flex gap-2 pt-4">
                <Button to={`/categorias/${category.id}/editar`} variant="secondary" size="sm">
                  Editar
                </Button>
                <Button variant="dangerOutline" size="sm" onClick={() => setToDelete(category)}>
                  Eliminar
                </Button>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      {toDelete && (
        <ConfirmDialog
          title="¿Eliminar la categoría?"
          message={`Se va a eliminar "${toDelete.name}". Si tiene eventos, no se va a poder.`}
          confirmLabel="Eliminar"
          onConfirm={() => handleDelete(toDelete)}
          onCancel={() => setToDelete(null)}
        />
      )}
    </section>
  );
}

export default CategoriesPage;
