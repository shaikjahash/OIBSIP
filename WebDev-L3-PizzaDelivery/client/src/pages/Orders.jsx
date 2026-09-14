import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/mine').then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading your orders…" />;

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <h1 className="font-display text-3xl mb-3">No orders yet</h1>
        <p className="font-body text-ash mb-6">Start building your first pizza.</p>
        <Link to="/build" className="inline-block bg-tomato text-semolina rounded-soft px-6 py-3 font-body font-medium hover:bg-tomatodark transition-colors">
          Build a pizza
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="font-display text-3xl mb-8">Your orders</h1>
      <div className="flex flex-col gap-3">
        {orders.map((o) => (
          <Link
            key={o._id}
            to={`/orders/${o._id}`}
            className="flex items-center justify-between border border-char/10 rounded-soft px-5 py-4 hover:border-tomato/40 transition-colors"
          >
            <div>
              <p className="font-body font-medium">Order #{o._id.slice(-6).toUpperCase()}</p>
              <p className="font-body text-sm text-ash">
                {o.items.length} item{o.items.length > 1 ? 's' : ''} · ₹{o.total} · {new Date(o.createdAt).toLocaleDateString()}
              </p>
            </div>
            <StatusBadge status={o.status} />
          </Link>
        ))}
      </div>
    </div>
  );
}
