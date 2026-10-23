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
export function filterCatalog(items: CatalogItem[], filters: CatalogFilters): CatalogItem[] {
  const search = filters.search.trim().toLowerCase();
  const priceMin = filters.priceMin === '' ? null : Number(filters.priceMin);
  const priceMax = filters.priceMax === '' ? null : Number(filters.priceMax);

  const filtered = items.filter(({ event, place, entries }) => {
    if (search !== '' && !event.title.toLowerCase().includes(search)) return false;
    if (filters.category !== '' && event.category !== filters.category) return false;
    if (filters.city !== '' && place?.city !== filters.city) return false;
    if (filters.status !== '' && event.status !== filters.status) return false;

    // Día local del evento en formato AAAA-MM-DD, el mismo que entrega <input type="date">.
    const day = toDateTimeInput(event.date_time_start).slice(0, 10);
    if (filters.dateFrom !== '' && day < filters.dateFrom) return false;
    if (filters.dateTo !== '' && day > filters.dateTo) return false;

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
