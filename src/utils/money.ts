/**
 * Precio más alto posible. La base guarda los precios como Decimal(10, 2):
 * 10 dígitos en total, 2 de ellos decimales. Quedan 8 cifras enteras.
 */
export const MAX_PRICE_DIGITS = 8;
export const MAX_PRICE = 99_999_999.99;
/** Precio para mostrar en pantalla. Acepta el texto que devuelve el backend o un número. */
export function formatPrice(value: string | number): string {
  return Number(value).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
}
