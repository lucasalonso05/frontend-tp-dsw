/** Convierte una fecha del backend (UTC) al formato de <input type="datetime-local">. */
export function toDateTimeInput(iso: string): string {
  const date = new Date(iso)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

/** Convierte el valor de un <input type="datetime-local"> al formato que exige el backend. */
export function toISO(inputValue: string): string {
  return new Date(inputValue).toISOString()
}

/** Fecha y hora para mostrar en pantalla. */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' })
}