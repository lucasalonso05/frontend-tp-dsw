import { Tickets } from 'lucide-react';
import { useEffect, useState } from 'react';
import Alert from '../components/Alert';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import OrderCard from '../components/OrderCard';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { orderService } from '../services/orderService';
import type { Order } from '../types/order';

function MyTicketsPage() {
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    orderService
      .getAll()
      .then((data) => {
        if (!ignore) setOrders(data);
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // A un admin el backend le devuelve las órdenes de todos; esta pantalla es la de cada uno.
  // Y solo las pagadas: para el comprador, una orden existe cuando está pagada.
  const myOrders = orders.filter(
    (order) => order.id_user === user?.id && order.status === 'PAID',
  );

  return (
    <section className="space-y-6">
      <PageHeader
        title="Mis entradas"
        description="Tus compras, de la más nueva a la más vieja. Abrí una para ver sus entradas y generar el QR que se muestra en la puerta."
      />

      {loading && <Loading label="Cargando tus entradas…" />}

      {error && <Alert>{error}</Alert>}

      {!loading && !error && myOrders.length === 0 && (
        <EmptyState
          icon={Tickets}
          title="Todavía no compraste entradas"
          description="Elegí un evento de la cartelera: tus compras van a aparecer acá."
          action={<Button to="/">Ir a la cartelera</Button>}
        />
      )}

      {/* El backend las manda de la más nueva a la más vieja: la primera es la última compra. */}
      <ul className="space-y-3">
        {myOrders.map((order, index) => (
          <li key={order.id}>
            <OrderCard order={order} defaultOpen={index === 0} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default MyTicketsPage;
