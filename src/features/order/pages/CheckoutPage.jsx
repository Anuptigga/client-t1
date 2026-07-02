import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShoppingBag, MapPin, CreditCard, ChefHat,
  ArrowLeft, Loader2, CheckCircle, AlertCircle, Navigation,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageShell from '../../../components/layout/PageShell.jsx';
import Button from '../../../components/ui/Button.jsx';
import Input from '../../../components/ui/Input.jsx';
import {
  selectCartItems,
  selectCartKitchenId,
  selectCartKitchenName,
  selectCartSubtotal,
  clearCart,
} from '../../cart/cartSlice.js';
import { usePlaceOrderMutation, useVerifyPaymentMutation, useCancelOrderMutation } from '../../order/orderApi.js';
import { selectCurrentUser } from '../../auth/authSlice.js';
import useGeolocation from '../../../hooks/useGeolocation.js';

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const kitchenId = useSelector(selectCartKitchenId);
  const kitchenName = useSelector(selectCartKitchenName);
  const subtotal = useSelector(selectCartSubtotal);
  const user = useSelector(selectCurrentUser);
  const { location: buyerLocation, loading: geoLoading, requestLocation } = useGeolocation();

  const [placeOrder, { isLoading }] = usePlaceOrderMutation();
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyPaymentMutation();
  const [cancelOrder] = useCancelOrderMutation();
  const [deliveryType, setDeliveryType] = useState('delivery');
  const [address, setAddress] = useState({
    street: user?.defaultAddress?.street || '',
    city: user?.defaultAddress?.city || '',
    state: user?.defaultAddress?.state || '',
    pincode: user?.defaultAddress?.pincode || '',
  });
  const [buyerNote, setBuyerNote] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(null);

  const deliveryFee = deliveryType === 'pickup' ? 0 : 30; // estimate for display only
  const platformFee = Math.round(subtotal * 0.02);
  const total = subtotal + deliveryFee + platformFee;

  // Empty cart guard
  if (items.length === 0 && !orderPlaced) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
          <ShoppingBag className="w-16 h-16 text-surface-300 mb-4" />
          <h2 className="text-xl font-bold text-surface-700 mb-2">Cart is empty</h2>
          <p className="text-surface-500 mb-6">Add items from a kitchen first.</p>
          <Link to="/explore">
            <Button>Explore Kitchens</Button>
          </Link>
        </div>
      </PageShell>
    );
  }

  // Order success view
  if (orderPlaced) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 animate-fade-in">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-surface-800 mb-2">Order Placed!</h2>
          <p className="text-surface-500 text-center max-w-sm mb-2">
            Your order <span className="font-semibold text-surface-700">#{orderPlaced.orderNumber}</span> has
            been placed successfully.
          </p>
          <p className="text-sm text-surface-400 mb-8">
            The kitchen will confirm your order shortly.
          </p>
          <div className="flex gap-3">
            <Link to={`/orders/${orderPlaced._id}`}>
              <Button>View Order</Button>
            </Link>
            <Link to="/explore">
              <Button variant="outline">Continue Browsing</Button>
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  const handlePlaceOrder = async () => {
    if (deliveryType === 'delivery' && (!address.street.trim() || !address.city.trim())) {
      return toast.error('Please enter your delivery address');
    }

    try {
      const res = await placeOrder({
        kitchenId,
        items: items.map((i) => ({
          foodId: i.foodId,
          quantity: i.quantity,
        })),
        deliveryAddress: deliveryType === 'pickup' ? {} : {
          ...address,
          ...(buyerLocation ? {
            latitude: buyerLocation.latitude,
            longitude: buyerLocation.longitude,
          } : {}),
        },
        deliveryType,
        buyerNote: buyerNote.trim(),
        paymentMethod: 'razorpay',
      }).unwrap();

      const { order, payment } = res.data;
      if (!window.Razorpay) {
        throw new Error('Payment checkout could not be loaded. Please refresh and try again.');
      }

      const options = {
        key: payment.keyId,
        amount: payment.amount,
        currency: payment.currency,
        name: 'Rajabhoj',
        description: `Order #${order.orderNumber}`,
        order_id: payment.id,
        handler: async function (response) {
          try {
            await verifyPayment({
              orderId: order._id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }).unwrap();

            setOrderPlaced(order);
            dispatch(clearCart());
            toast.success('Order placed successfully!');
          } catch (err) {
            toast.error(err?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        modal: {
          ondismiss: async () => {
            // User closed the Razorpay popup without paying — cancel the order to release stock
            try {
              await cancelOrder({ orderId: order._id, reason: 'Payment not completed by buyer' }).unwrap();
              toast('Order cancelled. Your stock has been released.', { icon: '⚠️' });
            } catch (err) {
              // Order may already be cancelled or in a terminal state
              toast('Payment was not completed.', { icon: '⚠️' });
            }
          },
        },
        theme: {
          color: '#f97316', // primary-500
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error(response.error.description || 'Payment failed');
      });
      rzp.open();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to initialize payment');
    }
  };

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back */}
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-primary-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue shopping
        </Link>

        <h1 className="text-2xl font-bold text-surface-800 mb-6">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Kitchen info */}
            <div className="bg-white rounded-2xl border border-surface-100 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-surface-400">Ordering from</p>
                  <p className="font-semibold text-surface-800">{kitchenName}</p>
                </div>
              </div>
            </div>

            {/* Order Type Selection */}
            <div className="bg-white rounded-2xl border border-surface-100 p-6">
              <h3 className="font-bold text-surface-800 mb-4">Order Type</h3>
              <div className="grid grid-cols-2 gap-4">
                <label className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${deliveryType === 'delivery' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-surface-200 bg-white text-surface-600 hover:border-surface-300'}`}>
                  <input type="radio" name="deliveryType" value="delivery" className="sr-only" checked={deliveryType === 'delivery'} onChange={(e) => setDeliveryType(e.target.value)} />
                  <Navigation className={`w-6 h-6 mb-2 ${deliveryType === 'delivery' ? 'text-primary-500' : 'text-surface-400'}`} />
                  <span className="font-semibold text-sm">Delivery</span>
                </label>
                <label className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${deliveryType === 'pickup' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-surface-200 bg-white text-surface-600 hover:border-surface-300'}`}>
                  <input type="radio" name="deliveryType" value="pickup" className="sr-only" checked={deliveryType === 'pickup'} onChange={(e) => setDeliveryType(e.target.value)} />
                  <ShoppingBag className={`w-6 h-6 mb-2 ${deliveryType === 'pickup' ? 'text-primary-500' : 'text-surface-400'}`} />
                  <span className="font-semibold text-sm">Self Pickup</span>
                </label>
              </div>
            </div>

            {/* Delivery address */}
            {deliveryType === 'delivery' && (
              <div className="bg-white rounded-2xl border border-surface-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-surface-800 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary-500" />
                    Delivery Address
                  </h3>
                  {buyerLocation ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-lg border border-green-200">
                      <Navigation className="w-3 h-3" />
                      GPS Captured
                    </span>
                  ) : geoLoading ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-100 text-surface-500 text-xs font-medium rounded-lg">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Getting location...
                    </span>
                  ) : (
                    <button
                      onClick={requestLocation}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors"
                    >
                      <Navigation className="w-3 h-3" />
                      Allow Location
                    </button>
                  )}
                </div>
              <div className="space-y-4">
                <Input
                  id="checkout-street"
                  label="Street Address"
                  name="street"
                  placeholder="123 Gandhi Road, Near Park"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="checkout-city"
                    label="City"
                    placeholder="Delhi"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  />
                  <Input
                    id="checkout-state"
                    label="State"
                    placeholder="Delhi"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  />
                </div>
                <Input
                  id="checkout-pincode"
                  label="Pincode"
                  placeholder="110001"
                  maxLength={6}
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                />
              </div>
            </div>
            )}

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-surface-100 p-6">
              <h3 className="font-bold text-surface-800 mb-3">Special Instructions</h3>
              <textarea
                id="checkout-note"
                placeholder="Any special requests? (optional)"
                rows={2}
                value={buyerNote}
                onChange={(e) => setBuyerNote(e.target.value)}
                maxLength={200}
                className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-white text-surface-800 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all resize-none text-sm"
              />
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl border border-surface-100 p-6">
              <h3 className="font-bold text-surface-800 mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-500" />
                Payment Method
              </h3>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-50 border border-primary-100">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-800">Razorpay Secure</p>
                  <p className="text-xs text-surface-400">Pay via Cards, UPI, NetBanking</p>
                </div>
                <CheckCircle className="w-5 h-5 text-primary-500 ml-auto" />
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-surface-100 p-6 sticky top-24">
              <h3 className="font-bold text-surface-800 mb-4">Order Summary</h3>

              {/* Items */}
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.foodId} className="flex justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-sm ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-surface-700 truncate">{item.name}</span>
                      <span className="text-surface-400 shrink-0">×{item.quantity}</span>
                    </div>
                    <span className="font-medium text-surface-700 shrink-0 ml-2">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-surface-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-surface-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-surface-500">
                  <span>Delivery Fee (Estimate)</span>
                  <span>~₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-surface-500">
                  <span>Platform Fee</span>
                  <span>₹{platformFee}</span>
                </div>
                <div className="flex justify-between font-bold text-surface-800 text-base pt-2 border-t border-surface-100">
                  <span>Estimated Total</span>
                  <span>₹{total}</span>
                </div>
                <p className="text-xs text-surface-400 mt-2 text-center">
                  * Final delivery fee is calculated dynamically based on distance to the kitchen when you proceed to pay.
                </p>
              </div>

              {/* Place order */}
              <Button
                fullWidth
                size="lg"
                className="mt-6"
                onClick={handlePlaceOrder}
                isLoading={isLoading || isVerifying}
              >
                Proceed to Pay
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
