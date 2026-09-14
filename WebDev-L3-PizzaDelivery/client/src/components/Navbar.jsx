import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { lines } = useCart();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-char text-semolina">
      <div className="mx-auto max-w-6xl px-5 flex items-center justify-between h-16">
        <Link to="/" className="font-display text-2xl tracking-tight">
          Forno
        </Link>

        <nav className="hidden sm:flex items-center gap-6 font-body text-sm">
          <Link to="/menu" className="hover:text-crust transition-colors">Menu</Link>
          <Link to="/build" className="hover:text-crust transition-colors">Build Your Own</Link>
          {user && (
            <Link to="/orders" className="hover:text-crust transition-colors">My Orders</Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="hover:text-crust transition-colors">Admin</Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative font-body text-sm hover:text-crust transition-colors" aria-label="Cart">
            Cart
            {lines.length > 0 && (
              <span className="absolute -top-2 -right-3 bg-tomato text-semolina text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {lines.length}
              </span>
            )}
          </Link>
          {user ? (
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="font-body text-sm border border-semolina/30 rounded-soft px-3 py-1.5 hover:bg-semolina hover:text-char transition-colors"
            >
              Log out
            </button>
          ) : (
            <Link
              to="/login"
              className="font-body text-sm border border-semolina/30 rounded-soft px-3 py-1.5 hover:bg-semolina hover:text-char transition-colors"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
