import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/inventory', label: 'Inventory' },
  { to: '/admin/pizzas', label: 'Pizzas' },
  { to: '/admin/notifications', label: 'Notifications' },
];

export default function AdminLayout() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 grid md:grid-cols-[200px,1fr] gap-8">
      <nav className="flex md:flex-col gap-1 font-body text-sm overflow-x-auto">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `whitespace-nowrap px-3 py-2 rounded-soft transition-colors ${
                isActive ? 'bg-char text-semolina' : 'text-ash hover:bg-char/5'
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
