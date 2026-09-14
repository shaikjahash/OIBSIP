import { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

const TABS = [
  { key: 'bases', label: 'Bases' },
  { key: 'sauces', label: 'Sauces' },
  { key: 'cheeses', label: 'Cheeses' },
  { key: 'vegetables', label: 'Vegetables' },
];

function stockStatus(item) {
  if (item.stockQuantity <= 0) return { label: 'Out of stock', className: 'bg-tomato/15 text-tomatodark' };
  if (item.stockQuantity <= item.lowStockThreshold) return { label: 'Low stock', className: 'bg-crust/25 text-[#8a5a1a]' };
  return { label: 'In stock', className: 'bg-basil/15 text-basil' };
}

export default function AdminInventory() {
  const [tab, setTab] = useState('bases');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    setLoading(true);
    api
      .get(`/${tab}/admin`)
      .then(({ data }) => setItems(data.items))
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  async function updateField(id, field, value) {
    try {
      const { data } = await api.patch(`/${tab}/${id}`, { [field]: value });
      setItems((prev) => prev.map((i) => (i._id === id ? data.item : i)));
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function adjustStock(id, delta) {
    try {
      const { data } = await api.patch(`/${tab}/${id}/stock`, { delta });
      setItems((prev) => prev.map((i) => (i._id === id ? data.item : i)));
      if (data.item.stockQuantity <= data.item.lowStockThreshold) {
        showToast(`${data.item.name} is running low (${data.item.stockQuantity} left)`, 'info');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Inventory</h1>

      <div className="flex gap-2 mb-6 font-body text-sm">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-soft transition-colors ${
              tab === t.key ? 'bg-char text-semolina' : 'bg-char/5 text-ash hover:bg-char/10'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner label="Loading inventory…" />
      ) : (
        <div className="overflow-x-auto border border-char/10 rounded-soft">
          <table className="w-full font-body text-sm">
            <thead className="bg-char/5 text-ash text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-char/10">
              {items.map((item) => {
                const status = stockStatus(item);
                return (
                  <tr key={item._id}>
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span>₹</span>
                        <input
                          type="number"
                          defaultValue={item.price}
                          onBlur={(e) => updateField(item._id, 'price', Number(e.target.value))}
                          className="w-16 rounded-soft border border-char/20 px-2 py-1"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => adjustStock(item._id, -1)} className="w-7 h-7 rounded-soft border border-char/20 hover:bg-char/5">−</button>
                        <span className="w-8 text-center">{item.stockQuantity}</span>
                        <button onClick={() => adjustStock(item._id, 1)} className="w-7 h-7 rounded-soft border border-char/20 hover:bg-char/5">+</button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>{status.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={item.isActive}
                        onChange={(e) => updateField(item._id, 'isActive', e.target.checked)}
                        aria-label={`${item.name} active`}
                      />
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-ash">No items in this category yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
