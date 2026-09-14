const FLOW = ['pending', 'confirmed', 'preparing', 'baking', 'out_for_delivery', 'delivered'];
const LABELS = {
  pending: 'Order Placed',
  confirmed: 'Payment Confirmed',
  preparing: 'Preparing',
  baking: 'Baking',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
};

export default function OrderTimeline({ status }) {
  const currentIdx = FLOW.indexOf(status);

  if (status === 'cancelled') {
    return <p className="font-body text-tomatodark">This order was cancelled.</p>;
  }

  return (
    <ol className="flex flex-col gap-0 font-body">
      {FLOW.map((step, idx) => {
        const done = idx <= currentIdx;
        const isCurrent = idx === currentIdx;
        return (
          <li key={step} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={`w-3.5 h-3.5 rounded-full shrink-0 mt-1 transition-colors ${
                  done ? 'bg-tomato' : 'bg-char/15'
                } ${isCurrent ? 'ring-4 ring-tomato/20' : ''}`}
              />
              {idx < FLOW.length - 1 && <div className={`w-px flex-1 min-h-8 ${idx < currentIdx ? 'bg-tomato' : 'bg-char/15'}`} />}
            </div>
            <div className="pb-8">
              <p className={`text-sm ${done ? 'text-char font-medium' : 'text-ash'}`}>{LABELS[step]}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
