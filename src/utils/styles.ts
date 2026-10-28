/** Clases de un campo de formulario (texto o desplegable), con borde rojo si tiene error. */
export function fieldClasses(hasError: boolean): string {
  const colors = hasError
    ? 'border-red-500 focus:border-red-600 focus:ring-red-600/20'
    : 'border-slate-300 focus:border-blue-800 focus:ring-blue-800/20';

  return `mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-base text-slate-900 focus:ring-3 focus:outline-hidden ${colors}`;
}
