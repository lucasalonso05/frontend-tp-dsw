/**
 * Formateo de los importes que devuelve la API.
 *
 * La API manda los Decimal como string y sin ceros de relleno: "5000.5",
 * "10001", "25002.5". Mostrarlos tal cual da "$10001" en vez de "$10.001,00".
 *
 * Todo lo que se muestre en pantalla pasa por acá.
 */
import type { DecimalString } from '@/types'

const formateador = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** "5000.5" → "$ 5.000,50" */
export const formatearPrecio = (valor: DecimalString): string =>
  formateador.format(Number(valor))

/**
 * Convierte a number para hacer cuentas EN PANTALLA (un subtotal mientras el
 * usuario mueve la cantidad, por ejemplo).
 *
 * ⚠️ Nunca para un importe que después se mande al backend: el total y los
 * subtotales los calcula el servidor con aritmética decimal exacta. Cualquier
 * cuenta que se haga acá es provisional y solo sirve para mostrar.
 */
export const aNumero = (valor: DecimalString): number => Number(valor)
