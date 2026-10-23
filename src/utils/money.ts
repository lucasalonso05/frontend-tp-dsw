/** Precio para mostrar en pantalla. Acepta el texto que devuelve el backend o un número. */
export function formatPrice(value: string | number): string {
  return Number(value).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
}
