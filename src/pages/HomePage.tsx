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
import { entryService } from '../services/entryService';
import { eventService } from '../services/eventService';
import { placeService } from '../services/placeService';
import { EVENT_STATUS_LABELS } from '../types/event';
import { buildCatalog, filterCatalog, uniqueSorted } from '../utils/catalog';
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

const orderOptions = [
  { value: 'date', label: 'Fecha (más próximos primero)' },
  { value: 'popularity', label: 'Popularidad (más vendidos primero)' },
];

function HomePage() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [filters, setFilters] = useState<CatalogFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    Promise.all([eventService.getAll(), placeService.getAll(), entryService.getAll()])
      .then(([events, places, entries]) => {
        if (!ignore) setItems(buildCatalog(events, places, entries));
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
    setFilters({ ...filters, [name]: value });
  };

  const categories = uniqueSorted(items.map((item) => item.event.category));
  const cities = uniqueSorted(items.flatMap((item) => (item.place ? [item.place.city] : [])));
  const visibleItems = filterCatalog(items, filters);

  return (
    <section className="space-y-6">
      <PageHeader title="Cartelera" description="Encontrá un evento y conseguí tus entradas." />

      <button
        type="button"
        className={`${showFilters ? 'grid' : 'hidden'} gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 md:grid lg:grid-cols-4`}
        aria-expanded={showFilters}
        aria-controls="filters"
        onClick={() => setShowFilters(!showFilters)}
      >
        {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
      </button>

      <form
        id="filters"
        className={`${showFilters ? 'grid' : 'hidden'} mt-4 gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2 md:grid lg:grid-cols-4`}
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
          options={categories.map((category) => ({ value: category, label: category }))}
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
        />
        <TextField
          label="Precio mínimo"
          name="priceMin"
          type="number"
          value={filters.priceMin}
          onChange={handleChange}
        />
        <TextField
          label="Precio máximo"
          name="priceMax"
          type="number"
          value={filters.priceMax}
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
                <p className="text-sm text-slate-600">{event.category}</p>
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
