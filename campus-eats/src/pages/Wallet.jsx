import { useState, useEffect, useRef } from "react";
import { API_URL } from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { Wallet, QrCode, Plus, History } from "lucide-react";

export default function WalletPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [addAmount, setAddAmount] = useState("");
  const presets = [50,100,200,500];
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const qrRef = useRef(null);
  const [highlightQR, setHighlightQR] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/order-food");
      return;
    }
    fetchWalletData();
  }, [user, navigate]);

  const fetchWalletData = async () => {
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
          fetch(`${API_URL}/umoney/balance/${user.id}`),
          fetch(`${API_URL}/umoney/transactions/${user.id}`)
        ]);

      const balanceData = await balanceRes.json();
      const transactionsData = await transactionsRes.json();

      setBalance(balanceData.balance || 0);
      setTransactions(transactionsData.transactions || []);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  // When user clicks Add, scroll to QR and highlight it so they can scan/pay there.
  const handleAddMoney = () => {
    const amount = parseFloat(addAmount);
    if (!amount || amount <= 0) return;
    if (qrRef.current) {
      qrRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightQR(true);
      setTimeout(() => setHighlightQR(false), 3000);
    }
  };

  const generateQRCode = () => {
    // Generate a simple QR code URL for demo
    const upiId = "test@upi"; // Replace with actual UPI ID
    const amount = addAmount || "0";
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${upiId}&am=${amount}&cu=INR`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-2 sm:px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
          <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          My Wallet
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">Manage your U-Money balance and transactions</p>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">Current Balance</h2>
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-3">₹{balance}</div>
          <p className="text-sm text-gray-600 dark:text-white">Available for payments</p>
        </div>

        {/* Add Money Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">Add Money</h2>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              {presets.map(p => (
                <button key={p} onClick={() => setAddAmount(String(p))} className={`px-3 py-1 text-sm rounded ${String(addAmount)===String(p)?'bg-blue-600 text-white':'bg-gray-100 dark:bg-gray-700 dark:text-white'}`}>₹{p}</button>
              ))}
              <button onClick={() => window.location.href = '/wallet'} className="ml-auto px-2 py-1 text-sm rounded border">Manage</button>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 text-sm text-neutral-600 dark:text-white">Selected: ₹{addAmount || 0}</div>
              <button onClick={handleAddMoney} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Add</button>
            </div>
          </div>
        </div>

        {/* QR Code Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Scan & Pay to Add Money</h2>
          </div>

            <div className="flex flex-col items-center space-y-3">
            <div ref={qrRef} className={`p-3 rounded-md ${highlightQR ? 'ring-4 ring-red-400 animate-pulse border-2 border-red-500' : ''}`}>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                <img
                  src={generateQRCode()}
                  alt="UPI QR Code"
                  className="w-40 h-40 sm:w-48 sm:h-48"
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Scan this QR code with any UPI app to add money to your wallet
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              UPI ID: test@upi (Demo)
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Transaction History</h2>
          </div>

            {transactions.length === 0 ? (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {transaction.type === 'credit' ? 'Added Money' : 'Payment'}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={`font-semibold text-sm ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
