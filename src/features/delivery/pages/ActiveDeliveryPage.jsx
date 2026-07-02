import { useNavigate } from 'react-router-dom';
import {
  MapPin, Phone, ChefHat, User, Package, ArrowLeft,
  Loader2, CheckCircle, Navigation, Truck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageShell from '../../../components/layout/PageShell.jsx';
import Button from '../../../components/ui/Button.jsx';
import { useGetActiveDeliveryQuery, useMarkDeliveredMutation, useMarkPickedUpMutation } from '../deliveryApi.js';
import { useSocket } from '../../../hooks/useSocket.js';
import { useState, useEffect } from 'react';

export default function ActiveDeliveryPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetActiveDeliveryQuery(undefined, {
    pollingInterval: 10000,
  });
  const [markDelivered, { isLoading: delivering }] = useMarkDeliveredMutation();
  const [markPickedUp, { isLoading: pickingUp }] = useMarkPickedUpMutation();
  const { emit } = useSocket();
  const [otpInput, setOtpInput] = useState('');

  const order = data?.data?.order;

  useEffect(() => {
    if (!order) return;

    // Join order room for tracking
    emit('join:order', order._id);
  }, [order?._id, emit]);

  const handlePickup = async () => {
    if (!order) return;
    try {
      await markPickedUp(order._id).unwrap();
      toast.success('Order picked up! Head to the customer.');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to mark picked up');
    }
  };

  const handleDeliver = async () => {
    if (!order) return;
    if (order.deliveryOtp && !otpInput.trim()) {
      toast.error('Please enter the delivery OTP');
      return;
    }
    
    try {
      await markDelivered({ orderId: order._id, otp: otpInput.trim() }).unwrap();
      toast.success('Order delivered! 🎉');
      navigate('/delivery/orders');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to mark delivered');
    }
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      </PageShell>
    );
  }

  if (!order) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
          <Truck className="w-16 h-16 text-surface-300 mb-4" />
          <h2 className="text-xl font-bold text-surface-700 mb-2">No active delivery</h2>
          <p className="text-surface-500 mb-6">Accept an order to start delivering.</p>
          <Button onClick={() => navigate('/delivery/orders')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center animate-pulse-soft">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-surface-800">Active Delivery</h1>
            <p className="text-sm text-surface-500">Order #{order.orderNumber}</p>
          </div>
        </div>

        {/* Status card */}
        <div className="bg-primary-50 border border-primary-200 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 text-primary-700 text-sm font-semibold mb-2">
            <Navigation className="w-4 h-4" />
            {order.status === 'picked_up' ? 'Delivering to customer' : 'Head to kitchen for pickup'}
          </div>
          <p className="text-xs text-primary-600">
            Your location is being shared with the customer in real-time.
          </p>
        </div>

        {/* Pickup from kitchen */}
        <div className="bg-white rounded-2xl border border-surface-100 p-5 mb-4">
          <h3 className="font-bold text-surface-800 mb-3 flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-primary-500" />
            Pickup From
          </h3>
          <p className="text-sm font-medium text-surface-700">{order.kitchen?.name}</p>
          <p className="text-xs text-surface-500 flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" />
            {order.kitchen?.address?.street}, {order.kitchen?.address?.city}
          </p>
          {order.kitchen?.phone && (
            <a
              href={`tel:${order.kitchen.phone}`}
              className="inline-flex items-center gap-1.5 mt-2 text-xs text-primary-600 font-medium hover:text-primary-700"
            >
              <Phone className="w-3 h-3" />
              {order.kitchen.phone}
            </a>
          )}
        </div>

        {/* Deliver to buyer */}
        <div className="bg-white rounded-2xl border border-surface-100 p-5 mb-4">
          <h3 className="font-bold text-surface-800 mb-3 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-green-500" />
            Deliver To
          </h3>
          <p className="text-sm font-medium text-surface-700">
            {order.buyer?.name}
          </p>
          {order.deliveryAddress?.street && (
            <p className="text-xs text-surface-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {order.deliveryAddress.street}, {order.deliveryAddress.city}
              {order.deliveryAddress.pincode && ` - ${order.deliveryAddress.pincode}`}
            </p>
          )}
          {order.buyer?.phone && (
            <a
              href={`tel:${order.buyer.phone}`}
              className="inline-flex items-center gap-1.5 mt-2 text-xs text-primary-600 font-medium hover:text-primary-700"
            >
              <Phone className="w-3 h-3" />
              {order.buyer.phone}
            </a>
          )}
        </div>

        {/* Order items */}
        <div className="bg-white rounded-2xl border border-surface-100 p-5 mb-6">
          <h3 className="font-bold text-surface-800 mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary-500" />
            Items ({order.items?.length})
          </h3>
          <div className="space-y-2">
            {order.items?.map((item, idx) => (
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
          <div className="flex justify-between mt-3 pt-3 border-t border-surface-100 font-bold text-surface-800">
            <span>Total</span>
            <span>₹{order.total}</span>
          </div>
        </div>

        {/* Actions */}
        {order.status === 'ready' ? (
          <div className="bg-white rounded-2xl border border-surface-100 p-5">
            <h3 className="font-bold text-surface-800 mb-3">Pickup Order</h3>
            <p className="text-sm text-surface-500 mb-4">
              Once you have picked up the order from the kitchen, mark it as picked up to notify the customer.
            </p>
            <Button
              fullWidth
              size="lg"
              onClick={handlePickup}
              isLoading={pickingUp}
              className="bg-primary-500 hover:bg-primary-600 text-white"
            >
              <Package className="w-5 h-5 mr-2" />
              Mark as Picked Up
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-surface-100 p-5">
            <h3 className="font-bold text-surface-800 mb-3">Complete Delivery</h3>
            <p className="text-sm text-surface-500 mb-4">
              Ask the customer for their 4-digit Delivery PIN to complete this order.
            </p>
            <input
              type="text"
              placeholder="Enter 4-digit PIN"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-surface-200 text-center text-xl tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
              maxLength={4}
            />
            <Button
              fullWidth
              size="lg"
              onClick={handleDeliver}
              isLoading={delivering}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Verify PIN & Mark Delivered
            </Button>
          </div>
        )}
      </div>
    </PageShell>
  );
}
