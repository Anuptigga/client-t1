import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ToggleLeft, ToggleRight, MapPin, Package, Clock,
  ChefHat, Phone, User, ArrowRight, Loader2, Truck,
  CheckCircle, Navigation,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageShell from '../../../components/layout/PageShell.jsx';
import Button from '../../../components/ui/Button.jsx';
import {
  useToggleDeliveryAvailabilityMutation,
  useGetAvailableOrdersQuery,
  useGetActiveDeliveryQuery,
  useAcceptDeliveryMutation,
  useUpdateDeliveryLocationMutation,
} from '../deliveryApi.js';
import { useSocket } from '../../../hooks/useSocket.js';
import useGeolocation from '../../../hooks/useGeolocation.js';

export default function DeliveryDashboardPage() {
  const [isOnline, setIsOnline] = useState(false);
  const { location: driverLocation } = useGeolocation();

  const { data: availableData, isLoading: loadingAvailable, refetch: refetchAvailable } = useGetAvailableOrdersQuery(
    driverLocation ? { latitude: driverLocation.latitude, longitude: driverLocation.longitude } : {},
    { pollingInterval: isOnline ? 15000 : 0 } // poll every 15s when online
  );
  const { data: activeData, isLoading: loadingActive } = useGetActiveDeliveryQuery();

  const [toggleAvailability, { isLoading: toggling }] = useToggleDeliveryAvailabilityMutation();
  const [acceptDelivery, { isLoading: accepting }] = useAcceptDeliveryMutation();
  const [updateLocation] = useUpdateDeliveryLocationMutation();

  const { on, off, emit } = useSocket();

  const availableOrders = availableData?.data?.orders || [];
  const activeOrder = activeData?.data?.order;

  // Listen for new ready orders
  useEffect(() => {
    const handler = () => {
      refetchAvailable();
    };
    on('order:ready-for-pickup', handler);
    return () => off('order:ready-for-pickup', handler);
  }, [on, off, refetchAvailable]);

  const handleToggle = async () => {
    const newState = !isOnline;
    try {
      await toggleAvailability(newState).unwrap();
      setIsOnline(newState);
      if (newState) {
        emit('delivery:go-online', 'self');
        // Send current location to backend when going online
        if (driverLocation) {
          updateLocation({ latitude: driverLocation.latitude, longitude: driverLocation.longitude });
        }
      } else {
        emit('delivery:go-offline');
      }
      toast.success(newState ? 'You are now online' : 'You are now offline');
    } catch {
      toast.error('Failed to toggle availability');
    }
  };

  const handleAccept = async (orderId) => {
    try {
      await acceptDelivery(orderId).unwrap();
      toast.success('Delivery accepted! Head to the kitchen.');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to accept');
    }
  };

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-surface-800">Delivery Dashboard</h1>
            <p className="text-sm text-surface-500 mt-0.5">
              {isOnline ? 'Looking for orders...' : 'Go online to start delivering'}
            </p>
          </div>

          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm transition-all border ${
              isOnline
                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                : 'bg-surface-100 text-surface-500 border-surface-200 hover:bg-surface-200'
            } disabled:opacity-50`}
          >
            {isOnline ? (
              <ToggleRight className="w-6 h-6" />
            ) : (
              <ToggleLeft className="w-6 h-6" />
            )}
            {isOnline ? 'Online' : 'Offline'}
          </button>
        </div>

        {/* Active delivery banner */}
        {activeOrder && (
          <Link
            to={`/delivery/active`}
            className="block mb-6 p-5 bg-primary-50 border border-primary-200 rounded-2xl hover:shadow-card transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary-700">Active Delivery</p>
                  <p className="text-xs text-primary-600">
                    #{activeOrder.orderNumber} • {activeOrder.items?.length} item{activeOrder.items?.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-primary-500" />
            </div>
          </Link>
        )}

        {/* Available orders */}
        {loadingAvailable || loadingActive ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : !isOnline && !activeOrder ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-surface-100 rounded-full flex items-center justify-center mb-4">
              <Navigation className="w-10 h-10 text-surface-300" />
            </div>
            <h3 className="text-lg font-bold text-surface-700 mb-2">You're Offline</h3>
            <p className="text-sm text-surface-500 max-w-sm">
              Toggle the switch above to go online and start receiving delivery requests.
            </p>
          </div>
        ) : availableOrders.length === 0 && !activeOrder ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="w-16 h-16 text-surface-300 mb-4" />
            <h3 className="text-lg font-bold text-surface-700 mb-2">No orders available</h3>
            <p className="text-sm text-surface-500">
              Waiting for kitchens to prepare orders...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wide">
              Available for Pickup ({availableOrders.length})
            </h2>
            {availableOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-surface-100 overflow-hidden hover:shadow-card transition-all"
              >
                {/* Order header */}
                <div className="px-5 py-3 bg-green-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-bold text-green-700">Ready for Pickup</span>
                  </div>
                  <span className="text-xs text-surface-400">
                    #{order.orderNumber}
                  </span>
                </div>

                <div className="p-5">
                  {/* Kitchen info */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                      <ChefHat className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-surface-800">
                        {order.kitchen?.name}
                      </p>
                      <p className="text-xs text-surface-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {order.kitchen?.address?.street}, {order.kitchen?.address?.city}
                      </p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="text-xs text-surface-500 mb-3">
                    {order.items?.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                  </div>

                  {/* Deliver to */}
                  {order.deliveryAddress?.street && (
                    <div className="flex items-center gap-2 text-xs text-surface-500 mb-3">
                      <Navigation className="w-3 h-3 text-primary-500" />
                      <span>Deliver to: {order.deliveryAddress.street}, {order.deliveryAddress.city}</span>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-surface-100">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-surface-800">₹{order.total}</span>
                      <span className="text-xs text-surface-400">
                        Earning: ₹{order.deliveryFee || 30}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAccept(order._id)}
                      isLoading={accepting}
                    >
                      Accept
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick links */}
        <div className="mt-8 flex gap-3">
          <Link
            to="/delivery/history"
            className="flex-1 p-4 bg-white rounded-2xl border border-surface-100 hover:shadow-card transition-all text-center"
          >
            <Clock className="w-6 h-6 text-surface-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-surface-700">Delivery History</p>
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
