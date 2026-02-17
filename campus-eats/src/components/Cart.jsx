// src/components/Cart.jsx
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import OrderConfirmDialog from "./OrderConfirmDialog";

export default function Cart({ onClose }) {
  const { cart, updateQty, removeItem, clearCart, total } = useCart();
  const navigate = useNavigate();
  const [showOrderConfirm, setShowOrderConfirm] = useState(false);

  const handlePlaceOrder = () => {
    if (!cart.items.length) return;
    setShowOrderConfirm(true);
  };

  const handleConfirmOrder = () => {
    clearCart();
    setShowOrderConfirm(false);
    onClose();

    // Show success toast
    const successToast = document.createElement("div");
    successToast.className =
      "fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[70] animate-fade-in";
    successToast.textContent = "Order placed successfully! 😊";
    document.body.appendChild(successToast);

    setTimeout(() => {
      successToast.classList.add("animate-fade-out");
      setTimeout(() => {
        document.body.removeChild(successToast);
        navigate("/orders");
      }, 300);
    }, 2000);
  };

  return (
    <div className="relative">
      <div className="fixed inset-0 bg-black/50 z-[990]">
        <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-lg flex flex-col">
          {showOrderConfirm && (
            <OrderConfirmDialog
              isOpen={showOrderConfirm}
              onConfirm={handleConfirmOrder}
              onCancel={() => setShowOrderConfirm(false)}
            />
          )}
          <div className="p-4 flex items-center justify-between border-b">
            <h2 className="text-xl font-semibold">Your Cart</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-full"
            >
              ✕
            </button>
          </div>

          <div className="flex-grow overflow-auto p-4">
            {!cart.items.length ? (
              <p className="text-neutral-600">
                Your cart is empty. Add some items from an outlet.
              </p>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 flex items-center justify-between border-b"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-neutral-600">
                          ₹{item.price} each
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-full"
                          disabled={item.qty <= 1}
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-full"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-sm">
                        <span className="text-neutral-600">Subtotal: </span>
                        <span className="font-medium">
                          ₹{item.price * item.qty}
                        </span>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-sm text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.items.length > 0 && (
            <div className="p-4 border-t flex items-center justify-between">
              <div>
                <div className="text-sm text-neutral-600">Outlet</div>
                <div className="font-medium">{cart.outlet}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-neutral-600">Total Amount</div>
                <div className="text-2xl font-semibold text-blue-600">
                  ₹{total}
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={clearCart}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Clear Cart
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2"
                >
                  <span>Place Order</span>
                  <span className="font-medium">• ₹{total}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
