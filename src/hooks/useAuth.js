import { useSelector } from 'react-redux';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoading,
} from '../features/auth/authSlice.js';

/**
 * Convenience hook for accessing auth state.
 */
export default function useAuth() {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);

  return {
    user,
    isAuthenticated,
    isLoading,
    role: user?.role || null,
    isBuyer: user?.role === 'buyer',
    isKitchen: user?.role === 'kitchen',
    isDelivery: user?.role === 'delivery',
    isAdmin: user?.role === 'admin',
  };
}
