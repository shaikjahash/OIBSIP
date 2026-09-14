import { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

function StatCard({ label, value, accent }) {
  return (
    <div className="border border-char/10 rounded-soft p-5">
      <p className="font-body text-sm text-ash mb-1">{label}</p>
      <p className={`font-display text-3xl ${accent || ''}`}>{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading dashboard…" />;
  if (!stats) return <p className="font-body text-ash">Unable to load dashboard.</p>;

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total orders" value={stats.totalOrders} />
        <StatCard label="Pending / active orders" value={stats.pendingOrders} />
        <StatCard label="Completed orders" value={stats.completedOrders} />
        <StatCard label="Revenue" value={`₹${stats.revenue.toLocaleString('en-IN')}`} accent="text-basil" />
        <StatCard label="Pizzas on menu" value={stats.availablePizzas} />
        <StatCard label="Low stock ingredients" value={stats.lowStockCount} accent={stats.lowStockCount > 0 ? 'text-[#8a5a1a]' : ''} />
        <StatCard label="Out of stock ingredients" value={stats.outOfStockCount} accent={stats.outOfStockCount > 0 ? 'text-tomatodark' : ''} />
      </div>
    </div>
  );
}
