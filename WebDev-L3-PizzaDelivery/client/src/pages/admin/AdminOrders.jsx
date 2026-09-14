import { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../context/ToastContext';

const STATUS_OPTIONS = ['pending', 'confirmed', 'preparing', 'baking', 'out_for_delivery', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    api
      .get('/orders/admin/all')
      .then(({ data }) => setOrders(data.orders))
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }

  async function updateStatus(id, status) {
    try {
      const { data } = await api.patch(`/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status: data.order.status } : o)));
      showToast(`Order #${id.slice(-6).toUpperCase()} marked ${status.replace('_', ' ')}`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  if (loading) return <LoadingSpinner label="Loading orders…" />;

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Orders</h1>

      {orders.length === 0 ? (
        <p className="font-body text-ash">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto border border-char/10 rounded-soft">
          <table className="w-full font-body text-sm">
            <thead className="bg-char/5 text-ash text-left">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-char/10">
              {orders.map((o) => (
                <tr key={o._id}>
                  <td className="px-4 py-3 font-medium whitespace-nowrap">#{o._id.slice(-6).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <p>{o.user?.name}</p>
                    <p className="text-ash text-xs">{o.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-ash">{o.items.length}</td>
                  <td className="px-4 py-3">₹{o.total}</td>
                  <td className="px-4 py-3">
                    <span className={o.status === 'pending' ? 'text-[#8a5a1a]' : 'text-basil'}>
                      {o.status === 'pending' ? 'Awaiting' : 'Paid'}
                    </span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o._id, e.target.value)}
                      className="rounded-soft border border-char/20 px-2 py-1.5 text-sm"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
