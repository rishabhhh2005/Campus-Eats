import { useEffect } from 'react';

export default function RewardPopup({ isOpen, points, onClose }) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
      <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 text-center transform animate-bounce">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-white mb-2">Yayy! You earned</h2>
        <div className="text-4xl font-bold text-white mb-4">{points} reward points</div>
        <p className="text-white/90 text-sm">Keep ordering to earn more rewards!</p>
      </div>
    </div>
  );
}
