const STYLES = {
  IN_STOCK: 'bg-basil/15 text-basil',
  LOW_STOCK: 'bg-crust/25 text-[#8a5a1a]',
  OUT_OF_STOCK: 'bg-tomato/15 text-tomatodark',
  pending: 'bg-crust/25 text-[#8a5a1a]',
  confirmed: 'bg-basil/15 text-basil',
  preparing: 'bg-basil/15 text-basil',
  baking: 'bg-tomato/15 text-tomatodark',
  out_for_delivery: 'bg-basil/15 text-basil',
  delivered: 'bg-basil/25 text-basil',
  cancelled: 'bg-ash/15 text-ash',
};

const LABELS = {
  IN_STOCK: 'In stock',
  LOW_STOCK: 'Low stock',
  OUT_OF_STOCK: 'Out of stock',
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  baking: 'Baking',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-body font-medium ${STYLES[status] || 'bg-ash/15 text-ash'}`}>
      {LABELS[status] || status}
    </span>
  );
}
