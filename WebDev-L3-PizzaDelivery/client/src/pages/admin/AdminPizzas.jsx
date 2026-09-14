import { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

export default function AdminPizzas() {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    api.get('/pizzas/admin').then(({ data }) => setPizzas(data.pizzas)).finally(() => setLoading(false));
  }, []);

  async function toggleAvailability(pizza) {
    try {
      const { data } = await api.patch(`/pizzas/${pizza._id}`, { isAvailable: !pizza.isAvailable });
      setPizzas((prev) => prev.map((p) => (p._id === pizza._id ? data.pizza : p)));
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function updatePrice(pizza, price) {
    try {
      const { data } = await api.patch(`/pizzas/${pizza._id}`, { basePrice: price });
      setPizzas((prev) => prev.map((p) => (p._id === pizza._id ? data.pizza : p)));
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  if (loading) return <LoadingSpinner label="Loading pizzas…" />;

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Pizzas</h1>
      <div className="overflow-x-auto border border-char/10 rounded-soft">
        <table className="w-full font-body text-sm">
          <thead className="bg-char/5 text-ash text-left">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Base price</th>
              <th className="px-4 py-3">Available</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-char/10">
            {pizzas.map((p) => (
              <tr key={p._id}>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 capitalize text-ash">{p.category}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span>₹</span>
                    <input
                      type="number"
                      defaultValue={p.basePrice}
                      onBlur={(e) => updatePrice(p, Number(e.target.value))}
                      className="w-20 rounded-soft border border-char/20 px-2 py-1"
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={p.isAvailable} onChange={() => toggleAvailability(p)} aria-label={`${p.name} available`} />
                </td>
              </tr>
            ))}
            {pizzas.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-ash">No pizzas yet. Run the seed script to add the starter catalog.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
