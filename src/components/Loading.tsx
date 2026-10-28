import { LoaderCircle } from 'lucide-react';

interface LoadingProps {
  label?: string;
}

/** Aviso de que se están trayendo datos del servidor. */
function Loading({ label = 'Cargando…' }: LoadingProps) {
  return (
    <p role="status" className="flex items-center gap-2 text-slate-600">
      <LoaderCircle className="size-5 animate-spin" />
      {label}
    </p>
  );
}

export default Loading;
