import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Botón para salir de la situación, por ejemplo "Limpiar filtros". */
  action?: ReactNode;
}

/** Lo que se muestra cuando una lista no tiene nada, en lugar de dejar la pantalla en blanco. */
function EmptyState({
  icon: Icon, title, description, action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <Icon className="size-10 text-slate-400" />
      <h2 className="mt-4 font-semibold">{title}</h2>
      {description && <p className="mt-1 max-w-md text-sm text-slate-600">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export default EmptyState;
