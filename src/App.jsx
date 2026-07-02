import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { setCredentials, setLoading, logout } from './features/auth/authSlice.js';
import { useGetMeQuery } from './features/auth/authApi.js';
import useAuth from './hooks/useAuth.js';

// Pages
import HomePage from './features/buyer/pages/HomePage.jsx';
import ExplorePage from './features/buyer/pages/ExplorePage.jsx';
import KitchenDetailPage from './features/buyer/pages/KitchenDetailPage.jsx';
import LoginPage from './features/auth/pages/LoginPage.jsx';
import SignupPage from './features/auth/pages/SignupPage.jsx';
import KitchenRegisterPage from './features/kitchen/pages/KitchenRegisterPage.jsx';
import KitchenDashboardPage from './features/kitchen/pages/KitchenDashboardPage.jsx';
import MenuManagementPage from './features/kitchen/pages/MenuManagementPage.jsx';
import KitchenOrdersPage from './features/kitchen/pages/KitchenOrdersPage.jsx';
import KitchenSettingsPage from './features/kitchen/pages/KitchenSettingsPage.jsx';
import CheckoutPage from './features/order/pages/CheckoutPage.jsx';
import BuyerOrdersPage from './features/order/pages/BuyerOrdersPage.jsx';
import OrderDetailPage from './features/order/pages/OrderDetailPage.jsx';
import DeliveryDashboardPage from './features/delivery/pages/DeliveryDashboardPage.jsx';
import ActiveDeliveryPage from './features/delivery/pages/ActiveDeliveryPage.jsx';
import DeliveryHistoryPage from './features/delivery/pages/DeliveryHistoryPage.jsx';
import UserProfilePage from './features/user/pages/UserProfilePage.jsx';
import WalletPage from './features/wallet/pages/WalletPage.jsx';
import AdminDashboardPage from './features/admin/pages/AdminDashboardPage.jsx';

// Common
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import LoadingScreen from './components/common/LoadingScreen.jsx';
import CartDrawer from './features/cart/CartDrawer.jsx';

function AppContent() {
  const dispatch = useDispatch();
  const { isLoading } = useAuth();
  const { data, error, isLoading: queryLoading } = useGetMeQuery();

  useEffect(() => {
    if (data?.data?.user) {
      dispatch(setCredentials({ user: data.data.user }));
    } else if (error) {
      dispatch(logout());
    }
  }, [data, error, dispatch]);

  useEffect(() => {
    if (!queryLoading && !data) {
      dispatch(setLoading(false));
    }
  }, [queryLoading, data, dispatch]);

  if (isLoading && queryLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/kitchen/:id" element={<KitchenDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected: Buyer */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <BuyerOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute allowedRoles={['buyer', 'kitchen']}>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Wallet is available for kitchen and delivery roles via /kitchen/wallet and /delivery/wallet */}

        {/* Protected: Kitchen */}
        <Route
          path="/kitchen/register"
          element={
            <ProtectedRoute allowedRoles={['kitchen']}>
              <KitchenRegisterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kitchen/dashboard"
          element={
            <ProtectedRoute allowedRoles={['kitchen']}>
              <KitchenDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kitchen/menu"
          element={
            <ProtectedRoute allowedRoles={['kitchen']}>
              <MenuManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kitchen/orders"
          element={
            <ProtectedRoute allowedRoles={['kitchen']}>
              <KitchenOrdersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/kitchen/settings"
          element={
            <ProtectedRoute allowedRoles={['kitchen']}>
              <KitchenSettingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/kitchen/wallet"
          element={
            <ProtectedRoute allowedRoles={['kitchen']}>
              <WalletPage />
            </ProtectedRoute>
          }
        />

        {/* Protected: Delivery */}
        <Route
          path="/delivery/orders"
          element={
            <ProtectedRoute allowedRoles={['delivery']}>
              <DeliveryDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/delivery/active"
          element={
            <ProtectedRoute allowedRoles={['delivery']}>
              <ActiveDeliveryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/delivery/history"
          element={
            <ProtectedRoute allowedRoles={['delivery']}>
              <DeliveryHistoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/delivery/wallet"
          element={
            <ProtectedRoute allowedRoles={['delivery']}>
              <WalletPage />
            </ProtectedRoute>
          }
        />

        {/* Protected: Any authenticated user */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Protected: Admin */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Cart drawer */}
      <CartDrawer />

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            background: '#1E293B',
            color: '#F8FAFC',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: { primary: '#22C55E', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#fff' },
          },
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
