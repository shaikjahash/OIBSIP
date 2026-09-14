import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { getSocket } from '../services/socket';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import OrderTimeline from '../components/OrderTimeline';

export default function OrderDetail() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const justConfirmed = params.get('confirmed') === '1';

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.order))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    function handleUpdate(payload) {
      if (payload.orderId === id) {
        setOrder((prev) => (prev ? { ...prev, status: payload.status, statusHistory: payload.statusHistory } : prev));
      }
    }
    socket.on('order:status', handleUpdate);
    return () => socket.off('order:status', handleUpdate);
  }, [id]);

  if (loading) return <LoadingSpinner label="Loading order…" />;
  if (error) return <p className="mx-auto max-w-2xl px-5 py-14 font-body text-tomatodark">{error}</p>;
  if (!order) return null;

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      {justConfirmed && (
        <div className="mb-8 rounded-soft bg-basil/10 text-basil font-body px-5 py-4">
          <p className="font-medium">Payment successful — your order is confirmed!</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-3xl">Order #{order._id.slice(-6).toUpperCase()}</h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="font-body text-ash mb-8">Placed on {new Date(order.createdAt).toLocaleString()}</p>

      <div className="grid md:grid-cols-[1fr,280px] gap-10">
        <div>
          <h2 className="font-display text-xl mb-4">Tracking</h2>
          <OrderTimeline status={order.status} />

          <h2 className="font-display text-xl mt-6 mb-4">Items</h2>
          <ul className="font-body text-sm divide-y divide-char/10 border border-char/10 rounded-soft overflow-hidden">
            {order.items.map((item, idx) => (
              <li key={idx} className="px-4 py-3">
                <div className="flex justify-between">
                  <span className="font-medium">{item.name} × {item.quantity}</span>
                  <span>₹{item.lineTotal}</span>
                </div>
                <p className="text-ash mt-1">
                  {item.base?.name}, {item.sauce?.name}, {item.cheese?.name}
                  {item.vegetables?.length ? `, ${item.vegetables.map((v) => v.name).join(', ')}` : ''}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <aside className="border border-char/10 rounded-soft p-5 h-fit">
          <h3 className="font-display text-lg mb-3">Summary</h3>
          <dl className="font-body text-sm space-y-2 text-ash">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
            <div className="flex justify-between"><span>Delivery fee</span><span>₹{order.deliveryFee}</span></div>
          </dl>
          <div className="border-t border-char/10 mt-3 pt-3 flex justify-between font-body font-semibold">
            <span>Total</span><span>₹{order.total}</span>
          </div>

          <h3 className="font-display text-lg mt-6 mb-2">Delivery to</h3>
          <p className="font-body text-sm text-ash">
            {order.deliveryAddress?.line1}, {order.deliveryAddress?.line2 ? `${order.deliveryAddress.line2}, ` : ''}
            {order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryAddress?.postalCode}
            <br />
            {order.deliveryAddress?.phone}
          </p>
        </aside>
      </div>

      <Link to="/orders" className="inline-block mt-10 font-body text-tomato hover:underline">
        &larr; Back to all orders
      </Link>
    </div>
  );
}
