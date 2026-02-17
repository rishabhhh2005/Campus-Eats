import React from 'react';

export default function ConfirmDialog({ isOpen, title, message, onCancel, onConfirm, confirmLabel = 'Delete' }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm text-center shadow-xl">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">{message}</p>
        <div className="flex justify-center gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded border">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-600 text-white">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
