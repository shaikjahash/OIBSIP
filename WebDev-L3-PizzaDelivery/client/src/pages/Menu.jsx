import { useEffect, useState } from 'react';
import api from '../services/api';
import PizzaCard from '../components/PizzaCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Menu() {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/pizzas')
      .then(({ data }) => setPizzas(data.pizzas))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <h1 className="font-display text-4xl mb-2">Our Menu</h1>
      <p className="font-body text-ash mb-8">Signature pizzas, ready to customize.</p>

      {loading && <LoadingSpinner label="Loading the menu…" />}
      {error && <p className="font-body text-tomatodark">{error}</p>}
      {!loading && !error && pizzas.length === 0 && (
        <p className="font-body text-ash">No pizzas available right now. Check back soon.</p>
      )}

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
        {pizzas.map((p) => (
          <PizzaCard key={p._id} pizza={p} />
        ))}
      </div>
    </div>
  );
}
