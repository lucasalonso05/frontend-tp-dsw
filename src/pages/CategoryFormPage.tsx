import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Card from '../components/Card';
import Loading from '../components/Loading';
import PageHeader from '../components/PageHeader';
import TextField from '../components/TextField';
import { useToast } from '../hooks/useToast';
import { categoryService } from '../services/categoryService';
import type { Category } from '../types/category';
import { findCategoryByName } from '../utils/categories';

// Devuelve el mensaje de error del nombre, o undefined si está bien.
function validate(name: string, categories: Category[], categoryId: number | null) {
  const value = name.trim();
  if (value === '') return 'Este campo es obligatorio';

  const existing = findCategoryByName(categories, value, categoryId);
  if (existing) return `Ya existe la categoría "${existing.name}"`;

  return undefined;
}

function CategoryFormPage() {
  const { id } = useParams();
  const categoryId = id === undefined ? null : Number(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  // Todas las categorías: se usan para avisar si el nombre ya está cargado.
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    Promise.all([
      categoryService.getAll(),
      categoryId === null ? null : categoryService.getById(categoryId),
    ])
      .then(([list, category]) => {
        if (ignore) return;
        setCategories(list);
        if (category) setName(category.name);
      })
      .catch((err: Error) => {
        if (!ignore) setApiError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [categoryId]);

  const save = async () => {
    const validationError = validate(name, categories, categoryId);
    setError(validationError);
    if (validationError) return;

    setSaving(true);
    setApiError(null);
    try {
      if (categoryId === null) {
        await categoryService.create({ name: name.trim() });
      } else {
        await categoryService.update(categoryId, { name: name.trim() });
      }
      showToast(categoryId === null ? 'Categoría creada' : 'Cambios guardados');
      navigate('/categorias');
    } catch (err) {
      setApiError((err as Error).message);
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <PageHeader title={categoryId === null ? 'Nueva categoría' : 'Editar categoría'} />

      {apiError && <Alert>{apiError}</Alert>}

      <Card className="sm:p-6">
        <form
          noValidate
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
        >
          <TextField
            label="Nombre"
            name="name"
            value={name}
            error={error}
            required
            onChange={(_, value) => setName(value)}
          />

          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button to="/categorias" variant="secondary">
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
}

export default CategoryFormPage;
