import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  /** Texto chico debajo del título. */
  description?: string;
  /** Etiqueta al lado del título, por ejemplo el estado de un evento. */
  badge?: ReactNode;
  /** Botón a la derecha del título (abajo, en celular). */
  action?: ReactNode;
  /** Enlace para volver a la pantalla anterior, arriba del título. */
  back?: { to: string; label: string };
}

/** El encabezado de cada pantalla: título, y si hace falta, una acción y un enlace para volver. */
function PageHeader({
  title, description, badge, action, back,
}: PageHeaderProps) {
  return (
    <header className="space-y-2">
      {back && (
        <Link
          to={back.to}
          className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-blue-800"
        >
          <ArrowLeft className="size-4" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
            {badge}
          </div>
          {description && <p className="mt-1 text-slate-600">{description}</p>}
        </div>
        {action}
      </div>
    </header>
  );
}

export default PageHeader;
