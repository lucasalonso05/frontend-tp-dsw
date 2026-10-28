import { SearchX } from 'lucide-react';
import Button from '../components/Button';

function NotFoundPage() {
  return (
    <section className="flex flex-col items-center py-16 text-center">
      <SearchX className="size-12 text-slate-400" />
      <h1 className="mt-4 text-2xl font-semibold">Página no encontrada</h1>
      <p className="mt-2 max-w-md text-slate-600">La dirección que buscás no existe.</p>
      <div className="mt-6">
        <Button to="/">Volver al inicio</Button>
      </div>
    </section>
  );
}

export default NotFoundPage;
