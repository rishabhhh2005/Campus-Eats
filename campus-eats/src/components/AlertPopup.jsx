import { useEffect } from "react";
import { Lock } from "lucide-react";

export default function AlertPopup({ isOpen, onClose, title, message }) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-lg mx-4 text-center animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <Lock className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          {title || "Oops!"}
        </h2>
        <p className="text-gray-600 dark:text-white mb-6">
          {message || "Please sign in to continue"}
        </p>
        <button
          onClick={onClose}
          className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
