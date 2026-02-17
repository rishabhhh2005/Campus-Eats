import { useState, useEffect } from "react";
import { API_URL } from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import LoadingOverlay from "../components/LoadingOverlay.jsx";

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [loyaltyStamps, setLoyaltyStamps] = useState(0);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [uMoneyBalance, setUMoneyBalance] = useState(0);

  useEffect(() => {
    if (user) fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    try {
      const [loyaltyRes, rewardsRes, umoneyRes] = await Promise.all([
        fetch(`${API_URL}/loyalty/status/${user.id}`),
        fetch(`${API_URL}/rewards/balance/${user.id}`),
        fetch(`${API_URL}/umoney/balance/${user.id}`)
      ]);

      const loyaltyData = await loyaltyRes.json();
      const rewardsData = await rewardsRes.json();
      const umoneyData = await umoneyRes.json();

      setLoyaltyStamps(loyaltyData.stamps || 0);
      setRewardPoints(rewardsData.points || 0);
      setUMoneyBalance(umoneyData.balance || 0);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const goToWallet = () => navigate("/wallet");

  const handleLogout = async () => {
    setLoggingOut(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    logout();
    setLoggingOut(false);
    navigate("/order-food");
  };

  if (!user) {
    return (
      <section className="max-w-4xl mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold mb-2">Please Sign In</h1>
        <p className="text-gray-600 dark:text-gray-400">
          You need to be logged in to view your account.
        </p>
      </section>
    );
  }

  return (
    <>
      {loggingOut && <LoadingOverlay message="Signing you out..." />}

      <section className="max-w-5xl mx-auto px-4 pt-6 pb-12 space-y-8">

        <div className="flex items-center gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-3xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Profile Information
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <Info label="Name" value={user.name} />
            <Info label="Email" value={user.email} />
            {user.phone && <Info label="Phone" value={user.phone} />}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">

          <StatCard
            title="Loyalty Stamps"
            value={`${loyaltyStamps}/10`}
            subtitle={`Order ${10 - loyaltyStamps} more times to earn a free item`}
            color="orange"
            progress={(loyaltyStamps / 10) * 100}
          />

          <StatCard
            title="Reward Points"
            value={rewardPoints}
            subtitle="1 point = ₹1 (Redeem at checkout)"
            color="blue"
          />


          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              U-Money Wallet
            </h3>
            <p className="text-3xl font-bold text-green-600">
              ₹{uMoneyBalance}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Pay using wallet balance & rewards
            </p>
            <button
              onClick={goToWallet}
              className="mt-2 w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium"
            >
              Open Wallet
            </button>
          </div>
        </div>


        <div className="flex justify-end">
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow"
          >
            Logout
          </button>
        </div>
      </section>
    </>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <div className="mt-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
        {value}
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, color, progress }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm space-y-3">
      <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
      {progress !== undefined && (
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
          <div
            className={`h-2 bg-${color}-500 rounded-full`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
    </div>
  );
}
