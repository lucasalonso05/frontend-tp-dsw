import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="py-12 text-center">
      <h1 className="text-2xl font-bold">Página no encontrada</h1>
      <p className="mt-2 text-slate-600">La dirección que buscás no existe.</p>
      <Link
        to="/"
        className="mt-6 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Volver al inicio
      </Link>
    </section>
  )
}

export default NotFoundPage