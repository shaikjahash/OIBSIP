import { Link } from 'react-router-dom';

export default function PizzaCard({ pizza }) {
  return (
    <div className="group rounded-soft overflow-hidden bg-white border border-char/10 flex flex-col">
      <div className="aspect-[4/3] bg-crust/20 overflow-hidden">
        <img
          src={pizza.image || 'https://images.unsplash.com/photo-1548365328-9f547fb0953b?w=600'}
          alt={pizza.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1548365328-9f547fb0953b?w=600';
          }}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
        />
      </div>
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg leading-tight">{pizza.name}</h3>
          <span className="font-body text-sm font-semibold whitespace-nowrap">₹{pizza.basePrice}</span>
        </div>
        <p className="font-body text-sm text-ash line-clamp-2">{pizza.description}</p>
        <div className="mt-auto pt-3">
          {pizza.isAvailable === false ? (
            <span className="font-body text-xs text-tomatodark">Currently unavailable</span>
          ) : (
            <Link
              to={`/build?pizza=${pizza._id}`}
              className="inline-block font-body text-sm font-medium bg-tomato text-semolina rounded-soft px-4 py-2 hover:bg-tomatodark transition-colors"
            >
              Customize
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}