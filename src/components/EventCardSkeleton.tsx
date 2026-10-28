/** Bloque gris con la forma de una tarjeta de evento, mientras carga la cartelera. */
function EventCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="h-5 w-3/4 rounded bg-slate-200" />
      <div className="mt-2 h-4 w-1/3 rounded bg-slate-200" />
      <div className="mt-4 h-4 w-1/2 rounded bg-slate-200" />
      <div className="mt-2 h-4 w-2/3 rounded bg-slate-200" />
      <div className="mt-6 h-5 w-1/3 rounded bg-slate-200" />
    </div>
  );
}

export default EventCardSkeleton;
