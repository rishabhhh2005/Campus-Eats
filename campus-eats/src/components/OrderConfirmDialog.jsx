// src/components/OrderConfirmDialog.jsx
import { useEffect, useState } from "react";

export default function OrderConfirmDialog({ isOpen, onConfirm, onCancel }) {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowSuccess(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    setShowSuccess(true);
    
    // Wait a moment before calling onConfirm to ensure success message is shown
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onConfirm();
    setShowSuccess(false);
    onCancel(); // close dialog
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
      <div className="bg-gray-900 rounded-lg p-6 max-w-sm w-full shadow-lg text-center">
        {!showSuccess ? (
          <>
            <h2 className="text-lg font-semibold mb-4 text-white">Confirm Your Order</h2>
            <p className="mb-6 text-gray-300">Are you sure you want to place the order?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
              >
                Yes, Place Order
              </button>
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-green-400">
              Order Confirmed!
            </h2>
            <p className="text-gray-300">Thank you for your order. 🎉</p>
          </div>
        )}
      </div>
    </div>
  );
}
