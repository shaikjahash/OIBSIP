import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function LineItem({ line, onRemove, onQty }) {
  return (
    <div className="flex gap-4 border-b border-char/10 py-4">
      <div className="flex-1">
        <p className="font-body font-medium">{line.name}</p>
        <p className="font-body text-sm text-ash mt-1">
          {line.base?.name}, {line.sauce?.name}, {line.cheese?.name}
          {line.vegetables?.length ? `, ${line.vegetables.map((v) => v.name).join(', ')}` : ''}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <label className="font-body text-sm text-ash" htmlFor={`qty-${line.id}`}>Qty</label>
          <input
            id={`qty-${line.id}`}
            type="number"
            min={1}
            value={line.quantity}
            onChange={(e) => onQty(line.id, Number(e.target.value))}
            className="w-16 rounded-soft border border-char/20 px-2 py-1 font-body text-sm"
          />
          <button onClick={() => onRemove(line.id)} className="font-body text-sm text-tomatodark hover:underline ml-2">
            Remove
          </button>
        </div>
      </div>
      <div className="font-body font-medium whitespace-nowrap">₹{line.unitPrice * line.quantity}</div>
    </div>
  );
}

export default function Cart() {
  const { lines, removeLine, updateQuantity, subtotal } = useCart();
  const navigate = useNavigate();

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <h1 className="font-display text-3xl mb-3">Your cart is empty</h1>
        <p className="font-body text-ash mb-6">Start building your first pizza.</p>
        <Link to="/build" className="inline-block bg-tomato text-semolina rounded-soft px-6 py-3 font-body font-medium hover:bg-tomatodark transition-colors">
          Build a pizza
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="font-display text-3xl mb-8">Your order</h1>

      <div>
        {lines.map((line) => (
          <LineItem key={line.id} line={line} onRemove={removeLine} onQty={updateQuantity} />
        ))}
      </div>

      <div className="flex justify-between font-body font-semibold text-lg mt-6">
        <span>Subtotal</span>
        <span>₹{subtotal}</span>
      </div>
      <p className="font-body text-sm text-ash mt-1">Delivery fee calculated at checkout.</p>

      <div className="flex justify-between mt-8">
        <Link to="/build" className="font-body px-5 py-2.5 rounded-soft border border-char/20">
          Add another pizza
        </Link>
        <button
          onClick={() => navigate('/checkout')}
          className="font-body px-6 py-2.5 rounded-soft bg-tomato text-semolina hover:bg-tomatodark transition-colors"
        >
          Proceed to checkout
        </button>
      </div>
    </div>
  );
}
