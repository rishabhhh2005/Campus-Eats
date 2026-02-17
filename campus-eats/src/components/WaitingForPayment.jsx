import React from 'react';
import { Clock } from 'lucide-react';

export default function WaitingForPayment({ open, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[12000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="max-w-2xl w-full mx-auto text-center">
          <div className="mx-auto mb-6 w-48 h-48 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-lg">
            <Clock className="w-20 h-20 text-gray-500 animate-pulse" />
          </div>
          <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Waiting for Razorpay confirmation</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-6">Your payment screen is open in a separate window. This page will update automatically once Razorpay confirms the transaction.</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
