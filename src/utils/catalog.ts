import type { Entry } from '../types/entry';
import type { EventModel } from '../types/event';
import type { Place } from '../types/place';
import { toDateTimeInput } from './dates';

/** Un evento con todo lo que la cartelera necesita mostrar y filtrar. */
export interface CatalogItem {
  event: EventModel;
  place: Place | undefined;
  entries: Entry[];
  /** Precio de la entrada más barata, o null si todavía no tiene entradas. */
  minPrice: number | null;
  /** Entradas vendidas en total: mide la popularidad. */
  sold: number;
  available: number;
}

/** Valores de los filtros. Son todos texto porque salen de campos de formulario. */
export interface CatalogFilters {
  search: string;
  category: string;
  city: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  priceMin: string;
  priceMax: string;
  order: string;
}

/** Errores de los filtros, por campo. Un campo que no aparece está bien. */
export type FilterErrors = Partial<Record<'priceMax' | 'dateTo', string>>;

/**
 * Deja solo los dígitos: "500.000" queda 500000, y el "-" o la "e" no entran.
 * Para filtrar por precio alcanzan los pesos enteros.
 */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/** Revisa que ningún rango esté al revés. El error va en el campo que cierra el rango. */
export function validateFilters(filters: CatalogFilters): FilterErrors {
  const errors: FilterErrors = {};

  if (
    filters.priceMin !== ''
    && filters.priceMax !== ''
    && Number(filters.priceMin) > Number(filters.priceMax)
  ) {
    errors.priceMax = 'Tiene que ser mayor o igual al mínimo';
  }

  // Las fechas llegan como AAAA-MM-DD: comparadas como texto, quedan en orden cronológico.
  if (filters.dateFrom !== '' && filters.dateTo !== '' && filters.dateFrom > filters.dateTo) {
    errors.dateTo = 'Tiene que ser igual o posterior a "Desde"';
  }

  return errors;
}

/** Une cada evento con su lugar y sus entradas. */
export function buildCatalog(
  events: EventModel[],
  places: Place[],
  entries: Entry[],
): CatalogItem[] {
  return events.map((event) => {
    const eventEntries = entries.filter((entry) => entry.id_event === event.id);
    const prices = eventEntries.map((entry) => Number(entry.unit_price));

    return {
      event,
      place: places.find((place) => place.id === event.id_place),
      entries: eventEntries,
      minPrice: prices.length > 0 ? Math.min(...prices) : null,
      sold: eventEntries.reduce((sum, entry) => sum + entry.sold_stock, 0),
      available: eventEntries.reduce((sum, entry) => sum + entry.stock - entry.sold_stock, 0),
    };
  });
}

/** Aplica todos los filtros a la vez y ordena el resultado. */
/**
 * Aplica todos los filtros a la vez y ordena el resultado.
 * Un rango al revés no se aplica: la pantalla muestra el error,
 * y la lista no queda vacía sin motivo.
 */
export function filterCatalog(items: CatalogItem[], filters: CatalogFilters): CatalogItem[] {
  const errors = validateFilters(filters);
  const search = filters.search.trim().toLowerCase();
  const priceMin = filters.priceMin === '' || errors.priceMax ? null : Number(filters.priceMin);
  const priceMax = filters.priceMax === '' || errors.priceMax ? null : Number(filters.priceMax);
  const dateFrom = errors.dateTo ? '' : filters.dateFrom;
  const dateTo = errors.dateTo ? '' : filters.dateTo;

  const filtered = items.filter(({ event, place, entries }) => {
    if (search !== '' && !event.title.toLowerCase().includes(search)) return false;
    // La categoría se filtra por id: el desplegable lo guarda como texto, como todo filtro.
    if (filters.category !== '' && String(event.id_category) !== filters.category) return false;
    if (filters.city !== '' && place?.city !== filters.city) return false;
    if (filters.status !== '' && event.status !== filters.status) return false;

    // Día local del evento en formato AAAA-MM-DD, el mismo que entrega <input type="date">.
    const day = toDateTimeInput(event.date_time_start).slice(0, 10);
    if (dateFrom !== '' && day < dateFrom) return false;
    if (dateTo !== '' && day > dateTo) return false;

    if (priceMin !== null || priceMax !== null) {
      const inRange = entries.some((entry) => {
        const price = Number(entry.unit_price);
        return (priceMin === null || price >= priceMin) && (priceMax === null || price <= priceMax);
      });
      if (!inRange) return false;
    }

    return true;
  });

  return filtered.sort((a, b) => (filters.order === 'popularity'
    ? b.sold - a.sold
    : a.event.date_time_start.localeCompare(b.event.date_time_start)));
}

/** Valores sin repetir y en orden alfabético, para armar las opciones de un desplegable. */
export function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}
