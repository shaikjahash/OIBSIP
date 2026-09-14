import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import StepIndicator from '../components/StepIndicator';
import LoadingSpinner from '../components/LoadingSpinner';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function IngredientOption({ item, selected, onSelect, disabled }) {
  const outOfStock = item.stockQuantity <= 0;
  return (
    <button
      type="button"
      disabled={outOfStock}
      onClick={() => onSelect(item)}
      className={`text-left rounded-soft border p-4 transition-colors relative ${
        selected ? 'border-tomato bg-tomato/5' : 'border-char/15 hover:border-char/30'
      } ${outOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-body font-medium">{item.name}</p>
        {item.price > 0 && <span className="font-body text-sm text-ash">+₹{item.price}</span>}
      </div>
      <p className="font-body text-sm text-ash mt-1">{item.description}</p>
      {outOfStock && <p className="font-body text-xs text-tomatodark mt-2">Out of stock</p>}
      {!outOfStock && item.stockQuantity <= item.lowStockThreshold && (
        <p className="font-body text-xs text-[#8a5a1a] mt-2">Only a few left</p>
      )}
    </button>
  );
}

export default function PizzaBuilder() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addLine } = useCart();
  const { showToast } = useToast();

  const pizzaId = params.get('pizza');

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState({ bases: [], sauces: [], cheeses: [], vegetables: [] });
  const [selection, setSelection] = useState({ base: null, sauce: null, cheese: null, vegetables: [] });
  const [pizzaName, setPizzaName] = useState('Custom Pizza');
  const [pizzaBasePrice, setPizzaBasePrice] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [bases, sauces, cheeses, vegetables] = await Promise.all([
          api.get('/bases'),
          api.get('/sauces'),
          api.get('/cheeses'),
          api.get('/vegetables'),
        ]);
        setCatalog({
          bases: bases.data.items,
          sauces: sauces.data.items,
          cheeses: cheeses.data.items,
          vegetables: vegetables.data.items,
        });

        if (pizzaId) {
          const { data } = await api.get(`/pizzas/${pizzaId}`);
          setPizzaName(data.pizza.name);
          setPizzaBasePrice(data.pizza.basePrice);
          setSelection({
            base: data.pizza.defaultBase || null,
            sauce: data.pizza.defaultSauce || null,
            cheese: data.pizza.defaultCheese || null,
            vegetables: data.pizza.defaultVegetables || [],
          });
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pizzaId]);

  function toggleVegetable(veg) {
    setSelection((s) => {
      const exists = s.vegetables.find((v) => v._id === veg._id);
      return {
        ...s,
        vegetables: exists ? s.vegetables.filter((v) => v._id !== veg._id) : [...s.vegetables, veg],
      };
    });
  }

  const total =
    pizzaBasePrice +
    (selection.base?.price || 0) +
    (selection.sauce?.price || 0) +
    (selection.cheese?.price || 0) +
    selection.vegetables.reduce((sum, v) => sum + v.price, 0);

  const stepsConfig = [
    { key: 'base', title: 'Choose your base', items: catalog.bases, multi: false },
    { key: 'sauce', title: 'Choose your sauce', items: catalog.sauces, multi: false },
    { key: 'cheese', title: 'Choose your cheese', items: catalog.cheeses, multi: false },
    { key: 'vegetables', title: 'Add vegetables', items: catalog.vegetables, multi: true },
  ];

  function canProceed() {
    if (step === 4) return true;
    const cfg = stepsConfig[step];
    if (cfg.multi) return true; // vegetables are optional
    return Boolean(selection[cfg.key]);
  }

  function handleAddToCart() {
    if (!user) {
      navigate('/login', { state: { from: '/build' + (pizzaId ? `?pizza=${pizzaId}` : '') } });
      return;
    }
    addLine({
      pizzaId: pizzaId || undefined,
      name: pizzaName,
      base: selection.base,
      sauce: selection.sauce,
      cheese: selection.cheese,
      vegetables: selection.vegetables,
      quantity: 1,
      unitPrice: total,
    });
    showToast('Added to cart!', 'success');
    navigate('/cart');
  }

  if (loading) return <LoadingSpinner label="Loading ingredients…" />;

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="font-display text-3xl mb-1">Build your pizza</h1>
      <p className="font-body text-ash mb-8">{pizzaName !== 'Custom Pizza' ? `Starting from ${pizzaName}` : 'Completely custom, your way.'}</p>

      <StepIndicator current={step} />

      <div className="grid lg:grid-cols-[1fr,300px] gap-8">
        <div>
          {step < 4 ? (
            <>
              <h2 className="font-display text-xl mb-4">{stepsConfig[step].title}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {stepsConfig[step].items.map((item) => {
                  const cfg = stepsConfig[step];
                  const selected = cfg.multi
                    ? selection.vegetables.some((v) => v._id === item._id)
                    : selection[cfg.key]?._id === item._id;
                  return (
                    <IngredientOption
                      key={item._id}
                      item={item}
                      selected={selected}
                      onSelect={() => (cfg.multi ? toggleVegetable(item) : setSelection((s) => ({ ...s, [cfg.key]: item })))}
                    />
                  );
                })}
                {stepsConfig[step].items.length === 0 && (
                  <p className="font-body text-ash col-span-2">No options available right now.</p>
                )}
              </div>
            </>
          ) : (
            <div>
              <h2 className="font-display text-xl mb-4">Review your pizza</h2>
              <ul className="font-body text-sm divide-y divide-char/10 border border-char/10 rounded-soft overflow-hidden">
                <SummaryRow label="Base" value={selection.base?.name} price={selection.base?.price} />
                <SummaryRow label="Sauce" value={selection.sauce?.name} price={selection.sauce?.price} />
                <SummaryRow label="Cheese" value={selection.cheese?.name} price={selection.cheese?.price} />
                <SummaryRow
                  label="Vegetables"
                  value={selection.vegetables.length ? selection.vegetables.map((v) => v.name).join(', ') : 'None'}
                  price={selection.vegetables.reduce((s, v) => s + v.price, 0)}
                />
              </ul>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <button
              type="button"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="font-body px-5 py-2.5 rounded-soft border border-char/20 disabled:opacity-40"
            >
              Back
            </button>
            {step < 4 ? (
              <button
                type="button"
                disabled={!canProceed()}
                onClick={() => setStep((s) => Math.min(4, s + 1))}
                className="font-body px-5 py-2.5 rounded-soft bg-tomato text-semolina hover:bg-tomatodark disabled:opacity-40 transition-colors"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                className="font-body px-5 py-2.5 rounded-soft bg-tomato text-semolina hover:bg-tomatodark transition-colors"
              >
                Add to cart — ₹{total}
              </button>
            )}
          </div>
        </div>

        <aside className="border border-char/10 rounded-soft p-5 h-fit sticky top-20">
          <h3 className="font-display text-lg mb-3">Order summary</h3>
          <dl className="font-body text-sm space-y-2">
            {pizzaBasePrice > 0 && <SummaryLine label={pizzaName} value={pizzaBasePrice} />}
            {selection.base && <SummaryLine label={selection.base.name} value={selection.base.price} />}
            {selection.sauce && <SummaryLine label={selection.sauce.name} value={selection.sauce.price} />}
            {selection.cheese && <SummaryLine label={selection.cheese.name} value={selection.cheese.price} />}
            {selection.vegetables.map((v) => (
              <SummaryLine key={v._id} label={v.name} value={v.price} />
            ))}
          </dl>
          <div className="border-t border-char/10 mt-3 pt-3 flex justify-between font-body font-semibold">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SummaryLine({ label, value }) {
  return (
    <div className="flex justify-between text-ash">
      <span>{label}</span>
      <span>{value ? `₹${value}` : 'Included'}</span>
    </div>
  );
}

function SummaryRow({ label, value, price }) {
  return (
    <li className="flex justify-between px-4 py-3">
      <span className="text-ash">{label}</span>
      <span className="text-right">
        {value || '—'} {price ? <span className="text-ash">(+₹{price})</span> : null}
      </span>
    </li>
  );
}
