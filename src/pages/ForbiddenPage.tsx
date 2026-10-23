import { Link } from 'react-router-dom';

function ForbiddenPage() {
  return (
    <section className="py-12 text-center">
      <h1 className="text-2xl font-bold">No tenés permiso para ver esta página</h1>
      <p className="mt-2 text-slate-600">
        Esta sección es para otro tipo de usuario. Si tenés otra cuenta, cerrá sesión e ingresá con
        esa.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Volver a la cartelera
      </Link>
    </section>
  );
}

export default ForbiddenPage;
