import { useState } from 'react';
import {
  Clock, CheckCircle, ChefHat, Package, XCircle, ArrowRight,
  Loader2, Bell, User, Phone, AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageShell from '../../../components/layout/PageShell.jsx';
import Button from '../../../components/ui/Button.jsx';
import { useGetKitchenOrdersQuery, useUpdateOrderStatusMutation, useCancelOrderMutation } from '../../order/orderApi.js';

const STATUS_TABS = [
  { key: '', label: 'All', icon: null },
  { key: 'pending', label: 'New', icon: Bell },
  { key: 'accepted', label: 'Accepted', icon: CheckCircle },
  { key: 'preparing', label: 'Preparing', icon: ChefHat },
  { key: 'ready', label: 'Ready', icon: Package },
];

const NEXT_STATUS = {
  pending: { action: 'accepted', label: 'Accept', color: 'bg-green-500 hover:bg-green-600' },
  accepted: { action: 'preparing', label: 'Start Preparing', color: 'bg-purple-500 hover:bg-purple-600' },
  preparing: { action: 'ready', label: 'Mark Ready', color: 'bg-blue-500 hover:bg-blue-600' },
};

export default function KitchenOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetKitchenOrdersQuery({
    page,
    limit: 20,
    status: statusFilter || undefined,
  });
  const [updateStatus, { isLoading: updating }] = useUpdateOrderStatusMutation();
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation();

  const orders = data?.orders || [];
  const pagination = data?.pagination;

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateStatus({ orderId, status: newStatus }).unwrap();
      toast.success(`Order ${newStatus}`);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update');
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order? Items will be restocked.')) return;
    try {
      await cancelOrder({ orderId, reason: 'Cancelled by kitchen' }).unwrap();
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to cancel');
    }
  };

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-surface-800 mb-6">Incoming Orders</h1>

        {/* Status filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {STATUS_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => { setStatusFilter(tab.key); setPage(1); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  statusFilter === tab.key
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-surface-100 text-surface-500 hover:bg-surface-200'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {tab.label}
              </button>
            );
          })}
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
            <Bell className="w-16 h-16 text-surface-300 mb-4" />
            <h3 className="text-lg font-bold text-surface-700 mb-2">No orders</h3>
            <p className="text-sm text-surface-500">
              {statusFilter ? `No ${statusFilter} orders.` : 'No orders have been placed yet.'}
            </p>
          </div>
        )}

        {/* Order cards */}
        {!isLoading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const nextAction = NEXT_STATUS[order.status];
              const isPending = order.status === 'pending';
              const canCancel = ['pending', 'accepted'].includes(order.status);

              return (
                <div
                  key={order._id}
                  className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                    isPending
                      ? 'border-yellow-300 shadow-md animate-pulse-subtle'
                      : 'border-surface-100'
                  }`}
                >
                  {/* Header */}
                  <div className={`px-5 py-3 flex items-center justify-between ${
                    isPending ? 'bg-yellow-50' : 'bg-surface-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-surface-800">
                        #{order.orderNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                        isPending ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'preparing' ? 'bg-purple-100 text-purple-700' :
                        order.status === 'ready' ? 'bg-green-100 text-green-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status.toUpperCase().replace('_', ' ')}
                      </span>
                      {order.deliveryType === 'pickup' ? (
                        <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-surface-100 text-surface-600 border border-surface-200">
                          SELF PICKUP
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-primary-50 text-primary-600 border border-primary-200">
                          DELIVERY
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-surface-400">
                      {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Buyer info */}
                    <div className="flex items-center gap-2 mb-3 text-sm text-surface-500">
                      <User className="w-3.5 h-3.5" />
                      <span className="font-medium text-surface-700">{order.buyer?.name}</span>
                      {order.buyer?.phone && (
                        <>
                          <span className="text-surface-300">·</span>
                          <Phone className="w-3.5 h-3.5" />
                          <span>{order.buyer.phone}</span>
                        </>
                      )}
                    </div>

                    {/* Items */}
                    <div className="space-y-1.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-sm ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-surface-700">{item.name}</span>
                            <span className="text-surface-400">×{item.quantity}</span>
                          </div>
                          <span className="text-surface-600">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="flex justify-between mt-3 pt-3 border-t border-surface-100 font-bold text-surface-800">
                      <span>Total</span>
                      <span>₹{order.total}</span>
                    </div>

                    {/* Buyer note */}
                    {order.buyerNote && (
                      <div className="mt-3 p-2.5 bg-yellow-50 rounded-lg text-xs text-yellow-700">
                        📝 {order.buyerNote}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {(nextAction || canCancel) && (
                    <div className="px-5 py-3 bg-surface-50 border-t border-surface-100 flex items-center justify-between gap-3">
                      {canCancel && (
                        <button
                          onClick={() => handleCancel(order._id)}
                          disabled={cancelling}
                          className="px-4 py-2 text-sm font-medium text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5 inline mr-1" />
                          Reject
                        </button>
                      )}
                      {nextAction && (
                        <button
                          onClick={() => handleStatusUpdate(order._id, nextAction.action)}
                          disabled={updating}
                          className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-50 ${nextAction.color}`}
                        >
                          {nextAction.label}
                          <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
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
