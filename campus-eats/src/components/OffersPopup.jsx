import { useState, useEffect } from "react";
import { X, Gift } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function OffersPopup({ onSignInClick }) {
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) return;

    const hasSeenPopup = sessionStorage.getItem('offersPopupSeen');
    if (hasSeenPopup) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
      sessionStorage.setItem('offersPopupSeen', 'true');
    }, 5000);

    return () => clearTimeout(timer);
  }, [user]);

  if (!isVisible || user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl shadow-xl w-full max-w-md mx-4 p-8 relative text-white">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="bg-white/20 p-4 rounded-full mb-4">
            <Gift className="w-12 h-12" />
          </div>
          
          <h2 className="text-3xl font-bold mb-2">Get Exclusive Offers! 🎉</h2>
          <p className="text-white/90 mb-6">
            Sign in to unlock special deals, faster checkout, and track your orders easily!
          </p>

          <button
            onClick={() => {
              setIsVisible(false);
              onSignInClick();
            }}
            className="bg-white text-red-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition mb-3"
          >
            Sign In Now
          </button>

          <button
            onClick={() => setIsVisible(false)}
            className="text-white/80 text-sm hover:text-white"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
