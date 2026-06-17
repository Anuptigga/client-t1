import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag, ChefHat } from 'lucide-react';
import {
  selectCartItems,
  selectCartKitchenName,
  selectCartSubtotal,
  selectIsCartOpen,
  selectCartItemCount,
  updateQuantity,
  removeFromCart,
  clearCart,
  setCartOpen,
} from './cartSlice.js';
import Button from '../../components/ui/Button.jsx';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const kitchenName = useSelector(selectCartKitchenName);
  const subtotal = useSelector(selectCartSubtotal);
  const isOpen = useSelector(selectIsCartOpen);
  const itemCount = useSelector(selectCartItemCount);

  if (!isOpen) return null;

  const deliveryFee = 30;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    dispatch(setCartOpen(false));
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={() => dispatch(setCartOpen(false))}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-elevated z-50 flex flex-col animate-slide-left">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-surface-800">Your Cart</h2>
              <p className="text-xs text-surface-400">
                {itemCount} item{itemCount !== 1 ? 's' : ''} from {kitchenName}
              </p>
            </div>
          </div>
          <button
            onClick={() => dispatch(setCartOpen(false))}
            className="p-2 hover:bg-surface-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-surface-200 mb-4" />
              <p className="text-surface-500 font-medium">Your cart is empty</p>
              <p className="text-sm text-surface-400 mt-1">
                Add items from a kitchen to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.foodId}
                  className="flex gap-3 p-3 rounded-xl bg-surface-50 border border-surface-100"
                >
                  {/* Image */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary-50 flex items-center justify-center">
                        <ChefHat className="w-4 h-4 text-primary-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-sm border ${
                            item.isVeg ? 'border-green-500 bg-green-500' : 'border-red-500 bg-red-500'
                          }`} />
                          <p className="text-sm font-medium text-surface-800 truncate">
                            {item.name}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-surface-700 mt-0.5">
                          ₹{item.price * item.quantity}
                        </p>
                      </div>

                      <button
                        onClick={() => dispatch(removeFromCart(item.foodId))}
                        className="p-1 text-surface-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          dispatch(updateQuantity({ foodId: item.foodId, quantity: item.quantity - 1 }))
                        }
                        className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-surface-100 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-surface-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          dispatch(updateQuantity({ foodId: item.foodId, quantity: item.quantity + 1 }))
                        }
                        disabled={item.quantity >= item.maxQuantity}
                        className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-surface-100 disabled:opacity-30 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs text-surface-400 ml-1">
                        × ₹{item.price}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear cart */}
              <button
                onClick={() => dispatch(clearCart())}
                className="text-xs text-red-500 hover:text-red-600 font-medium py-2"
              >
                Clear cart
              </button>
            </div>
          )}
        </div>

        {/* Footer / Checkout */}
        {items.length > 0 && (
          <div className="border-t border-surface-100 px-6 py-4 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-surface-600">
                <span>Subtotal</span>
                <span className="font-medium">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-surface-500">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-surface-800 pt-2 border-t border-surface-100">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            <Button fullWidth size="lg" onClick={handleCheckout}>
              <ShoppingBag className="w-4 h-4 mr-2" />
              Proceed to Checkout
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
