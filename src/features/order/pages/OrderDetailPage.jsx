import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft, ChefHat, MapPin, Clock, CreditCard, Phone,
  Loader2, CheckCircle, XCircle, Package, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageShell from '../../../components/layout/PageShell.jsx';
import Button from '../../../components/ui/Button.jsx';
import { useGetOrderByIdQuery, useCancelOrderMutation } from '../orderApi.js';
import { useCanReviewOrderQuery } from '../../review/reviewApi.js';
import { selectCurrentUser } from '../../auth/authSlice.js';

const STATUS_STEPS = ['pending', 'accepted', 'preparing', 'ready', 'picked_up', 'delivered', 'completed'];

const STATUS_LABELS = {
  pending: 'Order Placed',
  accepted: 'Accepted',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  picked_up: 'Picked Up',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const user = useSelector(selectCurrentUser);
  const { data, isLoading, error } = useGetOrderByIdQuery(id);
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation();
  const order = data?.data?.order;
  
  const { data: reviewData } = useCanReviewOrderQuery(id, {
    skip: !order || !['delivered', 'completed'].includes(order.status),
  });
  const canReview = reviewData?.data?.canReview;

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      </PageShell>
    );
  }

  if (error || !order) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
          <AlertCircle className="w-12 h-12 text-surface-300 mb-4" />
          <h2 className="text-xl font-bold text-surface-700 mb-2">Order not found</h2>
          <Link to="/orders">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
        </div>
      </PageShell>
    );
  }

  const buyerId = typeof order.buyer === 'string' ? order.buyer : order.buyer?._id;
  const isBuyer = user?._id === buyerId;
  const isCancelled = order.status === 'cancelled';
  const canCancel = isBuyer && order.status === 'pending';
  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await cancelOrder({ orderId: order._id, reason: 'Cancelled by buyer' }).unwrap();
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to cancel');
    }
  };

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back */}
        <Link
          to={isBuyer ? '/orders' : '/kitchen/orders'}
          className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-primary-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-surface-100 shadow-soft p-6 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-surface-400 uppercase tracking-wide">Order</p>
              <h1 className="text-xl font-bold text-surface-800">#{order.orderNumber}</h1>
              <p className="text-sm text-surface-500 mt-0.5">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold ${
              isCancelled
                ? 'bg-red-50 text-red-600 border border-red-200'
                : currentStepIndex >= STATUS_STEPS.indexOf('completed')
                ? 'bg-green-50 text-green-600 border border-green-200'
                : 'bg-primary-50 text-primary-600 border border-primary-200'
            }`}>
              {isCancelled ? (
                <XCircle className="w-4 h-4" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {STATUS_LABELS[order.status]}
            </div>
          </div>
        </div>

        {/* Status progress (only if not cancelled) */}
        {!isCancelled && (
          <div className="bg-white rounded-2xl border border-surface-100 p-6 mb-6">
            <h3 className="font-bold text-surface-800 mb-4">Order Progress</h3>
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, idx) => {
                const isActive = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isActive
                          ? 'gradient-primary text-white'
                          : 'bg-surface-100 text-surface-400'
                      } ${isCurrent ? 'ring-4 ring-primary-500/20' : ''}`}>
                        {isActive ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span className={`text-[10px] mt-1 text-center hidden sm:block ${
                        isActive ? 'text-primary-600 font-medium' : 'text-surface-400'
                      }`}>
                        {STATUS_LABELS[step]}
                      </span>
                    </div>
                    {idx < STATUS_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 rounded-full ${
                        idx < currentStepIndex ? 'bg-primary-500' : 'bg-surface-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Delivery OTP (Buyer only) */}
        {isBuyer && !isCancelled && currentStepIndex < STATUS_STEPS.indexOf('delivered') && order.deliveryOtp && (
          <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-primary-700">Delivery PIN</p>
              <p className="text-2xl font-bold tracking-widest text-primary-800 my-1">{order.deliveryOtp}</p>
              <p className="text-xs text-primary-600">Share this PIN with your delivery partner to receive your order.</p>
            </div>
          </div>
        )}

        {/* Cancelled reason */}
        {isCancelled && order.cancelReason && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Cancelled</p>
              <p className="text-xs text-red-600">{order.cancelReason}</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Items */}
          <div className="bg-white rounded-2xl border border-surface-100 p-6">
            <h3 className="font-bold text-surface-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary-500" />
              Items
            </h3>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-sm ${
                      item.isVeg ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="text-surface-700 truncate">{item.name}</span>
                    <span className="text-surface-400 shrink-0">×{item.quantity}</span>
                  </div>
                  <span className="font-medium text-surface-700 ml-2">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="border-t border-surface-100 mt-4 pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-surface-500">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-surface-500">
                <span>Delivery</span>
                <span>₹{order.deliveryFee}</span>
              </div>
              {order.platformFee > 0 && (
                <div className="flex justify-between text-surface-500">
                  <span>Platform Fee</span>
                  <span>₹{order.platformFee}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-surface-800 pt-2 border-t border-surface-100">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Kitchen */}
            <div className="bg-white rounded-2xl border border-surface-100 p-6">
              <h3 className="font-bold text-surface-800 mb-3 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-primary-500" />
                Kitchen
              </h3>
              <p className="text-sm text-surface-700 font-medium">{order.kitchen?.name}</p>
              {order.kitchen?.phone && (
                <p className="text-xs text-surface-400 flex items-center gap-1 mt-1">
                  <Phone className="w-3 h-3" />
                  {order.kitchen.phone}
                </p>
              )}
            </div>

            {/* Delivery address */}
            {order.deliveryAddress?.street && (
              <div className="bg-white rounded-2xl border border-surface-100 p-6">
                <h3 className="font-bold text-surface-800 mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-500" />
                  Delivery Address
                </h3>
                <p className="text-sm text-surface-600">
                  {order.deliveryAddress.street}
                  {order.deliveryAddress.city && `, ${order.deliveryAddress.city}`}
                  {order.deliveryAddress.pincode && ` - ${order.deliveryAddress.pincode}`}
                </p>
              </div>
            )}

            {/* Payment */}
            <div className="bg-white rounded-2xl border border-surface-100 p-6">
              <h3 className="font-bold text-surface-800 mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-500" />
                Payment
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-500">Method</span>
                  <span className="font-medium text-surface-700 capitalize">{order.payment?.method}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-500">Status</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    order.payment?.status === 'completed' ? 'bg-green-50 text-green-700 border border-green-200' :
                    order.payment?.status === 'refunded' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    order.payment?.status === 'refund_pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    order.payment?.status === 'failed' ? 'bg-red-50 text-red-700 border border-red-200' :
                    'bg-surface-100 text-surface-600 border border-surface-200'
                  }`}>
                    {order.payment?.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                    {order.payment?.status === 'refunded' && <CheckCircle className="w-3 h-3" />}
                    {order.payment?.status === 'refund_pending' && <Clock className="w-3 h-3" />}
                    {order.payment?.status === 'failed' && <XCircle className="w-3 h-3" />}
                    {order.payment?.status === 'refund_pending' ? 'Refund Processing' :
                     order.payment?.status?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                {order.payment?.paidAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-surface-500">Paid at</span>
                    <span className="text-surface-600 text-xs">
                      {new Date(order.payment.paidAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cancel button */}
        {canCancel && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={handleCancel}
              isLoading={cancelling}
              className="text-red-500 border-red-200 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel Order
            </Button>
          </div>
        )}

        {order.buyerNote && (
          <div className="mt-6 bg-surface-50 rounded-xl p-4">
            <p className="text-xs text-surface-400 mb-1">Special Instructions</p>
            <p className="text-sm text-surface-600">{order.buyerNote}</p>
          </div>
        )}

        {/* Review button */}
        {canReview && isBuyer && (
          <div className="mt-6 text-center">
            <Link to={`/kitchen/${order.kitchen._id || order.kitchen}?review=${order._id}#reviews`}>
              <Button variant="outline" className="text-primary-600 border-primary-200 hover:bg-primary-50">
                <ChefHat className="w-4 h-4 mr-2" />
                Leave a Review
              </Button>
            </Link>
          </div>
        )}
      </div>
    </PageShell>
  );
}
