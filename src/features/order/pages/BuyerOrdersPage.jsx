import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Clock, CheckCircle, XCircle, ChefHat,
  ArrowRight, Loader2, Package, Truck,
} from 'lucide-react';
import PageShell from '../../../components/layout/PageShell.jsx';
import { useGetMyOrdersQuery } from '../orderApi.js';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: Clock },
  accepted: { label: 'Accepted', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: CheckCircle },
  preparing: { label: 'Preparing', color: 'text-purple-600 bg-purple-50 border-purple-200', icon: ChefHat },
  ready: { label: 'Ready', color: 'text-green-600 bg-green-50 border-green-200', icon: Package },
  picked_up: { label: 'Picked Up', color: 'text-indigo-600 bg-indigo-50 border-indigo-200', icon: Truck },
  delivered: { label: 'Delivered', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle },
  completed: { label: 'Completed', color: 'text-green-700 bg-green-50 border-green-200', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-600 bg-red-50 border-red-200', icon: XCircle },
};

const FILTER_TABS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function BuyerOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetMyOrdersQuery({
    page,
    limit: 10,
    status: statusFilter || undefined,
  });

  const orders = data?.orders || [];
  const pagination = data?.pagination;

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-surface-800 mb-6">My Orders</h1>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setStatusFilter(tab.key); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                statusFilter === tab.key
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-surface-100 text-surface-500 hover:bg-surface-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        )}

        {/* Empty */}
        {!isLoading && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag className="w-16 h-16 text-surface-300 mb-4" />
            <h3 className="text-lg font-bold text-surface-700 mb-2">No orders yet</h3>
            <p className="text-sm text-surface-500 max-w-sm mb-6">
              {statusFilter ? `No ${statusFilter} orders found.` : 'Start ordering from nearby kitchens!'}
            </p>
            <Link to="/explore">
              <button className="px-5 py-2.5 gradient-primary text-white font-medium rounded-xl hover:shadow-md transition-all">
                Explore Kitchens
              </button>
            </Link>
          </div>
        )}

        {/* Order list */}
        {!isLoading && orders.length > 0 && (
          <div className="space-y-3">
            {orders.map((order) => {
              const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const StatusIcon = config.icon;

              return (
                <Link
                  key={order._id}
                  to={`/orders/${order._id}`}
                  className="block bg-white rounded-2xl border border-surface-100 p-4 hover:shadow-card hover:border-surface-200 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Kitchen + Order number */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shrink-0">
                          <ChefHat className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-surface-800 truncate">
                            {order.kitchen?.name || 'Kitchen'}
                          </p>
                          <p className="text-xs text-surface-400">
                            #{order.orderNumber}
                          </p>
                        </div>
                      </div>

                      {/* Items preview */}
                      <p className="text-xs text-surface-500 mt-2 truncate">
                        {order.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                      </p>

                      {/* Date */}
                      <p className="text-xs text-surface-400 mt-1">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {/* Right side */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${config.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                      <span className="text-sm font-bold text-surface-800">₹{order.total}</span>
                      <ArrowRight className="w-4 h-4 text-surface-300" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                  page === p
                    ? 'gradient-primary text-white'
                    : 'bg-surface-100 text-surface-500 hover:bg-surface-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
