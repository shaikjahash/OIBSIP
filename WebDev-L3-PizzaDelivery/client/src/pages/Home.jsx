import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import PizzaCard from '../components/PizzaCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/pizzas')
      .then(({ data }) => setPizzas(data.pizzas.slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="bg-char text-semolina">
        <div className="mx-auto max-w-6xl px-5 py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="font-display text-5xl leading-[1.05] mb-5">
              Wood-fired pizza,
              <br />
              built your way.
            </h1>
            <p className="font-body text-semolina/80 text-lg mb-8 max-w-md">
              Pick a base, a sauce, a cheese, and every topping you love. We bake it fresh and get
              it to your door hot.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link to="/build" className="bg-tomato text-semolina rounded-soft px-6 py-3 font-body font-medium hover:bg-tomatodark transition-colors">
                Build your own pizza
              </Link>
              <Link to="/menu" className="border border-semolina/30 rounded-soft px-6 py-3 font-body font-medium hover:bg-semolina hover:text-char transition-colors">
                Browse the menu
              </Link>
            </div>
          </div>
          <div className="aspect-square rounded-soft overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800"
              alt="Fresh wood-fired pizza with basil and melted mozzarella"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display text-3xl">Popular right now</h2>
          <Link to="/menu" className="font-body text-sm text-tomato hover:underline">See all</Link>
        </div>
        {loading ? (
          <LoadingSpinner label="Loading pizzas…" />
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {pizzas.map((p) => (
              <PizzaCard key={p._id} pizza={p} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 grid md:grid-cols-3 gap-8 text-center">
        {[
          { title: 'Fresh, daily-made dough', body: 'Our bases are proofed and stretched fresh every morning.' },
          { title: 'Real-time order tracking', body: 'Watch your pizza move from the oven to your door.' },
          { title: 'Build it exactly your way', body: 'Five bases, five sauces, and every topping you can think of.' },
        ].map((f) => (
          <div key={f.title}>
            <h3 className="font-display text-xl mb-2">{f.title}</h3>
            <p className="font-body text-ash text-sm">{f.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
