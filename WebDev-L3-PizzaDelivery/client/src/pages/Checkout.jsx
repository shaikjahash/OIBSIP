import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { loadRazorpayScript } from '../services/razorpay';

const DELIVERY_FEE_PREVIEW = 49;

export default function Checkout() {
  const { lines, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    phone: user?.phone || '',
  });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  if (lines.length === 0) {
    navigate('/cart');
    return null;
  }

  function update(field, value) {
    setAddress((a) => ({ ...a, [field]: value }));
  }

  function isAddressValid() {
    return address.line1 && address.city && address.state && address.postalCode && address.phone;
  }

  async function handlePayment(e) {
    e.preventDefault();
    if (!isAddressValid()) {
      setError('Please fill in all delivery details.');
      return;
    }
    setError('');
    setPlacing(true);

    try {
      // 1. Create the order server-side (prices/stock validated authoritatively there).
      const orderPayload = {
        items: lines.map((l) => ({
          pizzaId: l.pizzaId,
          name: l.name,
          baseId: l.base?._id,
          sauceId: l.sauce?._id,
          cheeseId: l.cheese?._id,
          vegetableIds: l.vegetables?.map((v) => v._id) || [],
          quantity: l.quantity,
        })),
        deliveryAddress: address,
      };
      const { data: orderData } = await api.post('/orders', orderPayload);
      const order = orderData.order;

      // 2. Create a Razorpay order for this pizza order.
      const { data: payData } = await api.post('/payments/create', { orderId: order._id });

      // 3. Load Razorpay checkout and open it.
      await loadRazorpayScript();

      const rzp = new window.Razorpay({
        key: payData.keyId,
        amount: payData.amount,
        currency: payData.currency,
        name: 'Forno Pizza',
        description: `Order #${order._id.slice(-6).toUpperCase()}`,
        order_id: payData.razorpayOrderId,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: address.phone,
        },
        theme: { color: '#C4432B' },
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: order._id,
            });
            clearCart();
            showToast('Payment successful! Your order is confirmed.', 'success');
            navigate(`/orders/${order._id}?confirmed=1`);
          } catch (err) {
            showToast(err.message, 'error');
            navigate(`/orders/${order._id}`);
          }
        },
        modal: {
          ondismiss: () => {
            showToast('Payment cancelled. Your order is saved as pending.', 'info');
            navigate(`/orders/${order._id}`);
          },
        },
      });

      rzp.open();
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-14">
      <h1 className="font-display text-3xl mb-8">Delivery details</h1>

      {error && <div role="alert" className="mb-5 rounded-soft bg-tomato/10 text-tomatodark text-sm font-body px-4 py-3">{error}</div>}

      <form onSubmit={handlePayment} className="flex flex-col gap-4 font-body">
        <div>
          <label htmlFor="line1" className="block text-sm font-medium mb-1">Address line 1</label>
          <input id="line1" required value={address.line1} onChange={(e) => update('line1', e.target.value)}
            className="w-full rounded-soft border border-char/20 px-3 py-2.5 focus:border-tomato outline-none" />
        </div>
        <div>
          <label htmlFor="line2" className="block text-sm font-medium mb-1">Address line 2 (optional)</label>
          <input id="line2" value={address.line2} onChange={(e) => update('line2', e.target.value)}
            className="w-full rounded-soft border border-char/20 px-3 py-2.5 focus:border-tomato outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium mb-1">City</label>
            <input id="city" required value={address.city} onChange={(e) => update('city', e.target.value)}
              className="w-full rounded-soft border border-char/20 px-3 py-2.5 focus:border-tomato outline-none" />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium mb-1">State</label>
            <input id="state" required value={address.state} onChange={(e) => update('state', e.target.value)}
              className="w-full rounded-soft border border-char/20 px-3 py-2.5 focus:border-tomato outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium mb-1">Postal code</label>
            <input id="postalCode" required value={address.postalCode} onChange={(e) => update('postalCode', e.target.value)}
              className="w-full rounded-soft border border-char/20 px-3 py-2.5 focus:border-tomato outline-none" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone</label>
            <input id="phone" required value={address.phone} onChange={(e) => update('phone', e.target.value)}
              className="w-full rounded-soft border border-char/20 px-3 py-2.5 focus:border-tomato outline-none" />
          </div>
        </div>

        <div className="border-t border-char/10 mt-4 pt-4 font-body text-sm">
          <div className="flex justify-between text-ash"><span>Subtotal</span><span>₹{subtotal}</span></div>
          <div className="flex justify-between text-ash"><span>Delivery fee</span><span>₹{DELIVERY_FEE_PREVIEW}</span></div>
          <div className="flex justify-between font-semibold text-base mt-2">
            <span>Total</span><span>₹{subtotal + DELIVERY_FEE_PREVIEW}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={placing}
          className="mt-4 bg-tomato text-semolina rounded-soft py-3 font-medium hover:bg-tomatodark transition-colors disabled:opacity-60"
        >
          {placing ? 'Placing order…' : 'Proceed to payment'}
        </button>
        <p className="text-xs text-ash text-center">Razorpay test mode — use test card details or click Success on the checkout screen.</p>
      </form>
    </div>
  );
}
