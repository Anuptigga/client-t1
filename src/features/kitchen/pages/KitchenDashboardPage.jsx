import { useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ChefHat, UtensilsCrossed, Package, AlertTriangle,
  ToggleLeft, ToggleRight, ArrowRight, RefreshCw, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageShell from '../../../components/layout/PageShell.jsx';
import Button from '../../../components/ui/Button.jsx';
import { useGetMyKitchenQuery, useToggleKitchenStatusMutation } from '../kitchenApi.js';
import { useGetMyFoodStatsQuery } from '../foodApi.js';
import { useSocket } from '../../../hooks/useSocket.js';
import { selectCurrentUser } from '../../auth/authSlice.js';

export default function KitchenDashboardPage() {
  const user = useSelector(selectCurrentUser);
  const { data: kitchenData, isLoading: kitchenLoading } = useGetMyKitchenQuery();
  const { data: statsData, isLoading: statsLoading } = useGetMyFoodStatsQuery();
  const [toggleStatus, { isLoading: toggling }] = useToggleKitchenStatusMutation();

  const kitchen = kitchenData?.data?.kitchen;
  const stats = statsData?.data?.stats;

  // Join kitchen socket room for real-time notifications
  const { on, off, emit } = useSocket();

  useEffect(() => {
    if (!kitchen?._id) return;
    emit('join:kitchen', kitchen._id);
  }, [kitchen?._id, emit]);

  const handleNewOrder = useCallback((data) => {
    toast.success(`🔔 New order #${data?.orderNumber || ''} received!`);
  }, []);

  useEffect(() => {
    on('order:new', handleNewOrder);
    return () => off('order:new', handleNewOrder);
  }, [on, off, handleNewOrder]);

  const handleToggle = async () => {
    try {
      const res = await toggleStatus().unwrap();
      toast.success(res.message);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to toggle');
    }
  };

  if (kitchenLoading || statsLoading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      </PageShell>
    );
  }

  // If no kitchen yet, redirect to register
  if (!kitchen) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
          <ChefHat className="w-16 h-16 text-surface-300 mb-4" />
          <h2 className="text-xl font-bold text-surface-700 mb-2">No Kitchen Registered</h2>
          <p className="text-surface-500 mb-6">Register your kitchen to start selling.</p>

          {/* Show rejection reason if previous application was rejected */}
          {user?.kitchenRejection?.reason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 max-w-md w-full">
              <p className="text-sm font-semibold text-red-700 mb-1">⚠️ Previous Application Rejected</p>
              <p className="text-sm text-red-600">{user.kitchenRejection.reason}</p>
              {user.kitchenRejection.rejectedAt && (
                <p className="text-xs text-red-400 mt-2">
                  Rejected on: {new Date(user.kitchenRejection.rejectedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          <Link to="/kitchen/register">
            <Button>Register Kitchen</Button>
          </Link>
        </div>
      </PageShell>
    );
  }

  const isActive = kitchen.isApproved && kitchen.isOpen && !kitchen.isAutoPaused;

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-surface-800">
              {kitchen.name}
            </h1>
            <p className="text-surface-500 text-sm mt-0.5">Kitchen Dashboard</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle open/close */}
            <button
              onClick={handleToggle}
              disabled={toggling || !kitchen.isApproved}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all border ${
                kitchen.isOpen
                  ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                  : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {kitchen.isOpen ? (
                <ToggleRight className="w-5 h-5" />
              ) : (
                <ToggleLeft className="w-5 h-5" />
              )}
              {kitchen.isOpen ? 'Open' : 'Closed'}
            </button>

            <Link to="/kitchen/menu">
              <Button size="md">
                Manage Menu
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Status banners */}
        {!kitchen.isApproved && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-700 text-sm">Pending Approval</p>
              <p className="text-xs text-yellow-600 mt-0.5">
                Your kitchen is under review. You'll be notified once approved.
              </p>
            </div>
          </div>
        )}

        {kitchen.isAutoPaused && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-start gap-3">
            <RefreshCw className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-700 text-sm">Auto-Paused</p>
              <p className="text-xs text-orange-600 mt-0.5">
                All items are sold out. Go to <Link to="/kitchen/menu" className="underline font-semibold">Menu</Link> to reset daily quantities.
              </p>
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Status',
              value: isActive ? 'Active' : !kitchen.isApproved ? 'Pending' : 'Inactive',
              color: isActive ? 'text-green-600' : 'text-surface-400',
              bg: isActive ? 'bg-green-50' : 'bg-surface-50',
              icon: ChefHat,
            },
            {
              label: 'Total Items',
              value: stats?.totalItems || 0,
              color: 'text-primary-600',
              bg: 'bg-primary-50',
              icon: UtensilsCrossed,
            },
            {
              label: 'Available Now',
              value: stats?.availableItems || 0,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
              icon: Package,
            },
            {
              label: 'Sold Out',
              value: stats?.soldOutItems || 0,
              color: stats?.soldOutItems > 0 ? 'text-red-600' : 'text-surface-400',
              bg: stats?.soldOutItems > 0 ? 'bg-red-50' : 'bg-surface-50',
              icon: AlertTriangle,
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`${stat.bg} rounded-2xl p-5 border border-transparent`}
              >
                <Icon className={`w-6 h-6 ${stat.color} mb-3`} />
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-surface-500 mt-0.5">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Kitchen info card */}
        <div className="bg-white rounded-2xl border border-surface-100 shadow-soft p-6">
          <h3 className="font-bold text-surface-800 mb-4">Kitchen Details</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-surface-400 text-xs uppercase tracking-wide">Address</p>
              <p className="text-surface-700 mt-0.5">
                {kitchen.address?.street}, {kitchen.address?.city}, {kitchen.address?.state} - {kitchen.address?.pincode}
              </p>
            </div>
            <div>
              <p className="text-surface-400 text-xs uppercase tracking-wide">Phone</p>
              <p className="text-surface-700 mt-0.5">{kitchen.phone}</p>
            </div>
            <div>
              <p className="text-surface-400 text-xs uppercase tracking-wide">Operating Hours</p>
              <p className="text-surface-700 mt-0.5">
                {kitchen.operatingHours?.open} – {kitchen.operatingHours?.close}
              </p>
            </div>
            <div>
              <p className="text-surface-400 text-xs uppercase tracking-wide">Cuisine</p>
              <p className="text-surface-700 mt-0.5">
                {kitchen.cuisineTypes?.join(', ') || 'Not specified'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
