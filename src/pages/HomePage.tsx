import { SearchX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import EventCardSkeleton from '../components/EventCardSkeleton';
import EventStatusBadge from '../components/EventStatusBadge';
import PageHeader from '../components/PageHeader';
import SelectField from '../components/SelectField';
import TextField from '../components/TextField';
import { categoryService } from '../services/categoryService';
import { entryService } from '../services/entryService';
import { eventService } from '../services/eventService';
import { placeService } from '../services/placeService';
import type { Category } from '../types/category';
import { EVENT_STATUS_LABELS } from '../types/event';
import {
  buildCatalog, cleanPrice, filterCatalog, uniqueSorted, validateFilters,
} from '../utils/catalog';
import type { CatalogFilters, CatalogItem } from '../utils/catalog';
import { formatDateTime } from '../utils/dates';
import { formatPrice } from '../utils/money';

const initialFilters: CatalogFilters = {
  search: '',
  category: '',
  city: '',
  status: 'CONFIRMED',
  dateFrom: '',
  dateTo: '',
  priceMin: '',
  priceMax: '',
  order: 'date',
};

const statusOptions = Object.entries(EVENT_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

// Los campos de precio se quedan solo con los dígitos.
const PRICE_FIELDS = ['priceMin', 'priceMax'];

const orderOptions = [
  { value: 'date', label: 'Fecha (más próximos primero)' },
  { value: 'popularity', label: 'Popularidad (más vendidos primero)' },
];

function HomePage() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<CatalogFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    Promise.all([
      eventService.getAll(),
      placeService.getAll(),
      entryService.getAll(),
      categoryService.getAll(),
    ])
      .then(([events, places, entries, categoryList]) => {
        if (ignore) return;
        setItems(buildCatalog(events, places, entries));
        // Salen de su propia tabla: aparecen todas, incluso las que todavía no tienen eventos.
        setCategories(categoryList);
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

  const handleChange = (name: string, value: string) => {
    // Si alguien escribe "500.000", como se escribe acá, el filtro toma 500000 y no 500.
    // Pasadas las 8 cifras, lo que se escribe no entra: ningún precio puede ser tan alto.
    const clean = PRICE_FIELDS.includes(name) ? cleanPrice(value) : value;
    setFilters({ ...filters, [name]: clean });
  };

  const cities = uniqueSorted(items.flatMap((item) => (item.place ? [item.place.city] : [])));
  const errors = validateFilters(filters);
  const visibleItems = filterCatalog(items, filters);

  return (
    <section className="space-y-6">
      <PageHeader title="Cartelera" description="Encontrá un evento y conseguí tus entradas." />

      <button
        type="button"
        className="rounded-full border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 md:hidden"
        aria-expanded={showFilters}
        aria-controls="filters"
        onClick={() => setShowFilters(!showFilters)}
      >
        {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
      </button>

      <form
        id="filters"
        className={`${showFilters ? 'grid' : 'hidden'} gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 md:grid lg:grid-cols-4`}
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="sm:col-span-2">
          <TextField
            label="Buscar por título"
            name="search"
            value={filters.search}
            onChange={handleChange}
          />
        </div>
        <SelectField
          label="Categoría"
          name="category"
          value={filters.category}
          placeholder="Todas"
          options={categories.map((category) => ({
            value: String(category.id),
            label: category.name,
          }))}
          onChange={handleChange}
        />
        <SelectField
          label="Ciudad"
          name="city"
          value={filters.city}
          placeholder="Todas"
          options={cities.map((city) => ({ value: city, label: city }))}
          onChange={handleChange}
        />
        <SelectField
          label="Estado"
          name="status"
          value={filters.status}
          placeholder="Todos"
          options={statusOptions}
          onChange={handleChange}
        />
        <TextField
          label="Desde"
          name="dateFrom"
          type="date"
          value={filters.dateFrom}
          onChange={handleChange}
        />
        <TextField
          label="Hasta"
          name="dateTo"
          type="date"
          value={filters.dateTo}
          onChange={handleChange}
          error={errors.dateTo}
        />
        <TextField
          label="Precio mínimo"
          name="priceMin"
          inputMode="numeric"
          value={filters.priceMin}
          onChange={handleChange}
        />
        <TextField
          label="Precio máximo"
          name="priceMax"
          inputMode="numeric"
          value={filters.priceMax}
          error={errors.priceMax}
          onChange={handleChange}
        />
        <SelectField
          label="Ordenar por"
          name="order"
          value={filters.order}
          options={orderOptions}
          onChange={handleChange}
        />
        <div className="flex items-end">
          <Button variant="secondary" onClick={() => setFilters(initialFilters)} fullWidth>
            Limpiar filtros
          </Button>
        </div>
      </form>

      {loading && (
      <div
        role="status"
        aria-label="Cargando eventos"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {[1, 2, 3, 4, 5, 6].map((number) => (
          <EventCardSkeleton key={number} />
        ))}
      </div>
      )}

      {error && <Alert>{error}</Alert>}

      {!loading && !error && visibleItems.length === 0 && (
      <EmptyState
        icon={SearchX}
        title="No hay eventos que coincidan con los filtros"
        description="Probá con otra búsqueda o sacá algunos filtros."
        action={(
          <Button variant="secondary" onClick={() => setFilters(initialFilters)}>
            Limpiar filtros
          </Button>
          )}
      />
      )}

      {!loading && !error && visibleItems.length > 0 && (
      <p className="text-sm text-slate-600">
        {visibleItems.length === 1
          ? '1 evento encontrado'
          : `${visibleItems.length} eventos encontrados`}
      </p>
      )}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map(({
          event, place, minPrice, available,
        }) => (
          <li key={event.id}>
            <Link
              to={`/eventos/${event.id}`}
              className="group block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
            >
              <Card className="flex h-full flex-col transition-shadow group-hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold group-hover:text-blue-800">{event.title}</h2>
                  <EventStatusBadge status={event.status} />
                </div>
                <p className="text-sm text-slate-600">{event.FK_category.name}</p>
                <p className="mt-2 text-sm">{formatDateTime(event.date_time_start)}</p>
                <p className="text-sm text-slate-600">
                  {place ? `${place.name}, ${place.city}` : 'Lugar a confirmar'}
                </p>
                <p className="mt-auto pt-3 font-semibold tabular-nums">
                  {minPrice === null ? 'Entradas próximamente' : `Desde ${formatPrice(minPrice)}`}
                </p>
                {minPrice !== null && (
                <p className="text-sm text-slate-600">
                  {available > 0 ? `${available} entradas disponibles` : 'Agotado'}
                </p>
                )}
              </Card>
            </Link>
          </li>
        ))}
      </ul>

    </section>
  );
}

export default HomePage;
