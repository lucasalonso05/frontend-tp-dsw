import { describe, expect, it } from 'vitest';
import type { Entry } from '../types/entry';
import type { EventModel } from '../types/event';
import {
  buildCatalog, filterCatalog, onlyDigits, validateFilters,
} from './catalog';
import type { CatalogFilters } from './catalog';

// Filtros vacíos: cada test cambia solo lo que prueba.
const noFilters: CatalogFilters = {
  search: '',
  category: '',
  city: '',
  status: '',
  dateFrom: '',
  dateTo: '',
  priceMin: '',
  priceMax: '',
  order: 'date',
};

// Un evento del 10/12/2026 con una sola entrada de $500.000.
// La hora es al mediodía UTC para que sea el mismo día en cualquier huso horario.
const event = {
  id: 1,
  title: 'Recital',
  status: 'CONFIRMED',
  id_category: 1,
  id_place: 1,
  date_time_start: '2026-12-10T15:00:00.000Z',
} as EventModel;

const entry = {
  id: 1,
  id_event: 1,
  unit_price: '500000.00',
  stock: 100,
  sold_stock: 0,
} as Entry;

const catalog = buildCatalog([event], [], [entry]);

describe('onlyDigits', () => {
  it('saca el punto de miles: "500.000" queda 500000', () => {
    expect(onlyDigits('500.000')).toBe('500000');
  });

  it('no deja entrar signos ni letras', () => {
    expect(onlyDigits('-50')).toBe('50');
    expect(onlyDigits('1e3')).toBe('13');
  });
});

describe('validateFilters', () => {
  it('acepta un rango de precios en orden, o con un solo extremo', () => {
    expect(validateFilters({ ...noFilters, priceMin: '100', priceMax: '500' })).toEqual({});
    expect(validateFilters({ ...noFilters, priceMin: '500', priceMax: '500' })).toEqual({});
    expect(validateFilters({ ...noFilters, priceMin: '500' })).toEqual({});
  });

  it('marca el precio máximo si es menor que el mínimo', () => {
    expect(validateFilters({ ...noFilters, priceMin: '500', priceMax: '100' })).toEqual({
      priceMax: 'Tiene que ser mayor o igual al mínimo',
    });
  });

  it('marca la fecha "Hasta" si es anterior a "Desde"', () => {
    expect(validateFilters({ ...noFilters, dateFrom: '2026-12-20', dateTo: '2026-12-01' })).toEqual({
      dateTo: 'Tiene que ser igual o posterior a "Desde"',
    });
  });
});

describe('filterCatalog', () => {
  it('filtra por un rango de precios válido', () => {
    expect(filterCatalog(catalog, { ...noFilters, priceMax: '100000' })).toHaveLength(0);
    expect(filterCatalog(catalog, { ...noFilters, priceMin: '400000' })).toHaveLength(1);
  });

  it('no aplica un rango de precios al revés', () => {
    expect(filterCatalog(catalog, { ...noFilters, priceMin: '900000', priceMax: '100' })).toHaveLength(1);
  });

  it('no aplica un rango de fechas al revés', () => {
    const inverted = { ...noFilters, dateFrom: '2026-12-20', dateTo: '2026-12-01' };
    expect(filterCatalog(catalog, inverted)).toHaveLength(1);
  });
});
