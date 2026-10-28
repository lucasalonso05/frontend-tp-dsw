import { ShieldX } from 'lucide-react';
import Button from '../components/Button';

function ForbiddenPage() {
  return (
    <section className="flex flex-col items-center py-16 text-center">
      <ShieldX className="size-12 text-slate-400" />
      <h1 className="mt-4 text-2xl font-semibold">No tenés permiso para ver esta página</h1>
      <p className="mt-2 max-w-md text-slate-600">
        Esta sección es para otro tipo de usuario. Si tenés otra cuenta, cerrá sesión e ingresá con
        esa.
      </p>
      <div className="mt-6">
        <Button to="/">Volver a la cartelera</Button>
      </div>
    </section>
  );
}

export default ForbiddenPage;
