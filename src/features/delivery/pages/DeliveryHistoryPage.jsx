import { useState } from 'react';
import {
  Clock, CheckCircle, ChefHat, MapPin, Loader2, Package,
} from 'lucide-react';
import PageShell from '../../../components/layout/PageShell.jsx';
import { useGetDeliveryHistoryQuery } from '../deliveryApi.js';

export default function DeliveryHistoryPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetDeliveryHistoryQuery({ page, limit: 10 });

  const orders = data?.orders || [];
  const pagination = data?.pagination;

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-surface-800 mb-6">Delivery History</h1>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        )}

        {!isLoading && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="w-16 h-16 text-surface-300 mb-4" />
            <h3 className="text-lg font-bold text-surface-700 mb-2">No deliveries yet</h3>
            <p className="text-sm text-surface-500">
              Completed deliveries will appear here.
            </p>
          </div>
        )}

        {!isLoading && orders.length > 0 && (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-surface-100 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-surface-800">
                        #{order.orderNumber}
                      </p>
                      <p className="text-xs text-surface-500 flex items-center gap-1">
                        <ChefHat className="w-3 h-3" />
                        {order.kitchen?.name}
                      </p>
                      <p className="text-xs text-surface-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(order.deliveredAt || order.completedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-surface-800">₹{order.total}</span>
                    <p className="text-xs text-green-600 font-medium mt-0.5">
                      +₹{order.deliveryFee || 30} earned
                    </p>
                  </div>
                </div>
              </div>
            ))}
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
