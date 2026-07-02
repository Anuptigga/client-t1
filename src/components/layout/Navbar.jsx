import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Menu,
  X,
  LogOut,
  User,
  ChefHat,
  Truck,
  ShieldCheck,
  Wallet,
  Bell,
  ChevronDown,
  ShoppingBag,
  Settings,
} from 'lucide-react';
import { selectCurrentUser, selectIsAuthenticated, logout } from '../../features/auth/authSlice.js';
import { useLogoutMutation } from '../../features/auth/authApi.js';
import { selectCartItemCount, setCartOpen } from '../../features/cart/cartSlice.js';

const roleNavItems = {
  buyer: [
    { label: 'Explore', path: '/explore', icon: null },
    { label: 'Orders', path: '/orders', icon: null },
  ],
  kitchen: [
    { label: 'Dashboard', path: '/kitchen/dashboard', icon: ChefHat },
    { label: 'Menu', path: '/kitchen/menu', icon: null },
    { label: 'Orders', path: '/kitchen/orders', icon: null },
    { label: 'Wallet', path: '/kitchen/wallet', icon: Wallet },
    { label: 'Settings', path: '/kitchen/settings', icon: Settings },
  ],
  delivery: [
    { label: 'Available Orders', path: '/delivery/orders', icon: Truck },
    { label: 'My Deliveries', path: '/delivery/history', icon: null },
    { label: 'Wallet', path: '/delivery/wallet', icon: Wallet },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin', icon: ShieldCheck },
    { label: 'Kitchens', path: '/admin/kitchens', icon: null },
    { label: 'Users', path: '/admin/users', icon: null },
    { label: 'Orders', path: '/admin/orders', icon: null },
  ],
};

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [logoutApi] = useLogoutMutation();
  const cartItemCount = useSelector(selectCartItemCount);

  const navItems = user ? roleNavItems[user.role] || [] : [];

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // proceed even if API fails
    }
    dispatch(logout());
    navigate('/login');
    setProfileOpen(false);
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 glass border-b border-surface-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">Rajabhoj</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="px-4 py-2 text-sm font-medium text-surface-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Cart button (buyer only) */}
                {user?.role === 'buyer' && (
                  <button
                    onClick={() => dispatch(setCartOpen(true))}
                    className="relative p-2 text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-xl transition-all"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </button>
                )}

                {/* Notifications */}
                <button className="relative p-2 text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-xl transition-all">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
                </button>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-surface-100 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-surface-700 max-w-[120px] truncate">
                      {user?.name}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-surface-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-elevated border border-surface-100 py-2 animate-scale-in">
                      <div className="px-4 py-3 border-b border-surface-100">
                        <p className="text-sm font-semibold text-surface-800 truncate">{user?.name}</p>
                        <p className="text-xs text-surface-400 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-primary-50 text-primary-600 rounded-full capitalize">
                          {user?.role}
                        </span>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-600 hover:bg-surface-50 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-surface-600 hover:text-primary-600 rounded-xl transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 text-sm font-semibold text-white gradient-primary rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-surface-500 hover:bg-surface-100 rounded-xl transition-all"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-surface-200/50 bg-white animate-slide-down">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-surface-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close profile dropdown */}
      {profileOpen && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setProfileOpen(false)}
        />
      )}
    </nav>
  );
}
