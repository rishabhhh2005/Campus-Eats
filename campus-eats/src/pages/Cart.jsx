// src/pages/Cart.jsx
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { saveOrder } from "../utils/api";
import { OUTLETS } from "../data/outlets";
import { useState, useEffect } from "react";
import RazorPayReact from "../components/RazorPayReact";
import WaitingForPayment from "../components/WaitingForPayment";
import { getCampus } from "../data/campus";
import OrderConfirmDialog from "../components/OrderConfirmDialog";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../utils/api";
import AuthModal from "../components/AuthModal";
import AlertPopup from "../components/AlertPopup";
import RewardPopup from "../components/RewardPopup";

export default function Cart() {
  const { cart, updateQty, removeItem, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const [couponMsg, setCouponMsg] = useState("");
  const [discount, setDiscount] = useState(0);
  const [payOpen, setPayOpen] = useState(false);
  const [useUMoney, setUseUMoney] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAlertPopup, setShowAlertPopup] = useState(false);
  const [paymentError, setPaymentError] = useState({ open: false, msg: '' });
  const [useRewards, setUseRewards] = useState(false);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [uMoneyBalance, setUMoneyBalance] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const payable = Math.max(0, total - discount);
  const [razorAuto, setRazorAuto] = useState(null);
  const [waitingOpen, setWaitingOpen] = useState(false);
  const [stampPopup, setStampPopup] = useState({ open: false, message: '' });
  const [paymentResult, setPaymentResult] = useState(null); // 'success' | 'failed' | 'cancelled' | null

  const fetchUserBalances = async () => {
    try {
      if (!user) return;
      const [rewardsRes, umoneyRes] = await Promise.all([
        fetch(`${API_URL}/rewards/balance/${user.id}`),
        fetch(`${API_URL}/umoney/balance/${user.id}`)
      ]);
      const rewardsData = await rewardsRes.json();
      const umoneyData = await umoneyRes.json();
      setRewardPoints(rewardsData.points || 0);
      setUMoneyBalance(umoneyData.balance || 0);
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserBalances();
    }
  }, [user]);

  // handle auto-close of waiting overlay and follow-up action after ~3.5s
  useEffect(() => {
    if (!waitingOpen) return;
    const t = setTimeout(() => {
      setWaitingOpen(false);
      if (paymentResult === 'success') {
        navigate('/orders');
      } else if (paymentResult === 'cancelled') {
        setPaymentError({ open: true, msg: 'Payment was cancelled.' });
      } else {
        setPaymentError({ open: true, msg: 'Payment pending or failed. Please check your payment screen.' });
      }
    }, 3500);
    return () => clearTimeout(t);
  }, [waitingOpen, paymentResult, navigate]);

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    let applied = 0;
    let msg = "";
    if (code === "CHITKARA10") {
      applied = Math.min(100, Math.round(total * 0.1));
      msg = `Applied 10% off (max ₹100): -₹${applied}`;
    } else if (code === "SAVE50" && total >= 299) {
      applied = 50;
      msg = "Applied flat ₹50 off";
    } else if (code === "FREESHIP") {
      applied = 30; // simulate delivery charge waived
      msg = "Applied ₹30 delivery waiver";
    } else {
      setCouponMsg("Invalid code or conditions not met");
      setDiscount(0);
      setAppliedCoupon(null);
      return;
    }
    setDiscount(applied);
    setCouponMsg(msg);
    setAppliedCoupon(code);
  };

  const handlePlaceOrderClick = () => {
    if (!cart.items.length) {
      alert("Your cart is empty");
      return;
    }
    if (!user) {
      setShowAlertPopup(true);
      setTimeout(() => {
        setShowAuthModal(true);
      }, 500);
      return;
    }
    setPayOpen(true);
  };

  const handleConfirmOrder = async () => {
    try {
      const outlet = OUTLETS.find((o) => o.slug === cart.outlet);
      const orderData = {
        items: cart.items,
        total,
        discount,
        payable: calculateFinalAmount().finalAmount,
        outlet: outlet?.name || "Unknown Outlet",
        campus: getCampus(),
        status: "Pending",
        paymentType: paymentMethod === 'card' ? 'Online' : paymentMethod === 'umoney' ? 'U-Money' : 'Cash'
      };

      // After confirm, open mock payment
      // In new flow, we already open payment directly
      setPayOpen(true);
      // We'll actually save after payment success
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
      setConfirmOpen(false);
    }
  };

  const calculateFinalAmount = () => {
    let final = payable;
    let rewardsUsed = 0;
    let umoneyUsed = 0;

    if (useRewards && rewardPoints > 0) {
      rewardsUsed = Math.min(rewardPoints, final);
      final -= rewardsUsed;
    }

    if (useUMoney && uMoneyBalance > 0) {
      umoneyUsed = Math.min(uMoneyBalance, final);
      final -= umoneyUsed;
    }

    return { finalAmount: Math.max(0, final), rewardsUsed, umoneyUsed };
  };

  const finalizeAfterSave = async (orderResponse, finalAmount) => {
    try {
      // award points and show popup
      const pointsEarned = Math.floor(total * 0.10);
      if (pointsEarned > 0) {
        await fetch(`${API_URL}/rewards/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, points: pointsEarned })
        });
        setEarnedPoints(pointsEarned);
        setShowRewardPopup(true);
      }

      clearCart();
      setPayOpen(false);
      setRazorAuto(null);
      navigate('/orders');
    } catch (err) {
      console.error('Error finalizing order:', err);
      alert('Order processed but error during finalization');
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      if (!user) {
        alert("Please sign in to place order");
        setPayOpen(false);
        setShowAuthModal(true);
        return;
      }

      const { finalAmount, rewardsUsed, umoneyUsed } = calculateFinalAmount();

      // Redeem rewards if used
      if (rewardsUsed > 0) {
        await fetch(`${API_URL}/rewards/redeem`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, points: rewardsUsed })
        });
        setRewardPoints(prev => Math.max(0, prev - rewardsUsed));
      }

      const outlet = OUTLETS.find((o) => o.slug === cart.outlet);
      const orderData = {
        items: cart.items,
        total,
        discount,
        payable: finalAmount,
        outlet: outlet?.name || "Unknown Outlet",
        campus: getCampus(),
        status: "Pending",
        paymentType: paymentMethod === 'card' ? 'Online' : paymentMethod === 'umoney' ? 'U-Money' : 'Cash'
      };

      // If final payable is zero, complete order immediately (no Razorpay)
      if (finalAmount === 0) {
        // If U-Money is applied, deduct it first
        if (umoneyUsed > 0) {
          await fetch(`${API_URL}/umoney/deduct`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, amount: umoneyUsed })
          });
        }

        const response = await saveOrder(orderData);
        if (response.error) throw new Error(response.error);
        await finalizeAfterSave(response, finalAmount);
        return;
      }

      // Handle card payment flow: create order then open Razorpay (only when amount > 0)
      if (paymentMethod === 'card') {
        const response = await saveOrder(orderData);
        if (response.error) throw new Error(response.error);
        setRazorAuto({ orderId: response.id, amount: finalAmount });
        // ensure waiting overlay shows while Razorpay opens/redirects
        setPaymentResult(null);
        setWaitingOpen(true);
        return;
      }

      // If U-Money used, deduct before saving (applies regardless of payment method)
      if (umoneyUsed > 0) {
        await fetch(`${API_URL}/umoney/deduct`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, amount: umoneyUsed })
        });
      }

      // For cash or any non-card flows: save order immediately
      const response = await saveOrder(orderData);
      if (response.error) throw new Error(response.error);

      // finalize (award points, clear cart, navigate)
      await finalizeAfterSave(response, finalAmount);
    } catch (error) {
      console.error("Error saving paid order:", error);
      alert(error.message || "Failed to save order. Please try again.");
      setPayOpen(false);
    }
  };

  const handleRazorSuccess = async (verifyRes, orderResponse) => {
    // verifyRes typically { success: true, order }
    try {
      // finalize same as after save
      await finalizeAfterSave(orderResponse, razorAuto?.amount || 0);
    } catch (err) {
      console.error('Error handling razor success:', err);
      alert('Payment succeeded but final steps failed');
    }
  };

  // helper to process stamp counts locally and award on every 5th order
  const processStamps = async () => {
    try {
      if (!user) return;
      const key = `order_count_${user.id}`;
      const prev = parseInt(localStorage.getItem(key) || '0', 10);
      const next = prev + 1;
      localStorage.setItem(key, String(next));
      if (next % 5 === 0) {
        // award a small reward (e.g., 25 points) and notify
        await fetch(`${API_URL}/rewards/add`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, points: 25 })
        }).catch(() => {});
        setStampPopup({ open: true, message: `Congrats — you earned a stamp! This is order #${next}.` });
      }
    } catch (e) {
      console.error('Stamps processing failed', e);
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-2 sm:px-4 py-6">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-900 dark:text-white">
        Your Cart
      </h1>

      {!cart.items.length ? (
        <div className="text-center py-12">
          <p className="text-neutral-600 dark:text-neutral-400 mb-6 text-lg">
            Your cart is empty. Add some items from an outlet.
          </p>
          <button
            onClick={() => navigate("/order-food")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
          >
            Browse Outlets
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
          <div className="lg:col-span-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="p-2 sm:p-3 flex items-start justify-between gap-3 border-b border-gray-100 dark:border-gray-700 last:border-none hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 bg-neutral-100 dark:bg-neutral-700 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
                          {item.name}
                        </h3>
                        {item.isVeg ? (
                          <span className="w-4 h-4 border-2 border-green-600 rounded-full flex items-center justify-center">
                            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                          </span>
                        ) : (
                          <span className="w-4 h-4 border-2 border-red-600 rounded-full flex items-center justify-center">
                            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                        {item.desc}
                      </p>
                      <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white tracking-tight">₹{item.price}</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-4">
                      <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:scale-105 transition font-bold disabled:opacity-40"
                        disabled={item.qty <= 1}
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        -
                      </button>
                      <span className="w-10 sm:w-12 text-center text-gray-900 dark:text-white font-bold text-base sm:text-lg">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="w-10 h-10 flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-all duration-200 text-lg font-semibold"
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">



                     
                    </div>

                    <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-600 transition-all duration-200 hover:underline text-sm font-medium">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-6 self-start">
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 lg:sticky lg:top-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">Outlet</div>
                  <div className="font-semibold text-gray-900 dark:text-white text-lg">{cart.outlet}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">Items</div>
                  <div className="text-2xl font-bold text-blue-600">{cart.items.length}</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex gap-3">
                  <input
  value={couponCode}
  disabled={!!appliedCoupon}
  onChange={(e) => setCouponCode(e.target.value)}
  placeholder=" Use CHITKARA10 for 10% off"
  className="flex-1 border disabled:opacity-50 disabled:cursor-not-allowed ..."
/>

                 <button
  onClick={applyCoupon}
  disabled={!!appliedCoupon}
  className={`px-4 py-2 rounded-lg text-white transition
    ${appliedCoupon
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-blue-600 hover:bg-blue-700"
    }`}
>
  {appliedCoupon ? "Applied" : "Apply"}
</button>

                </div>
                {appliedCoupon && (
  <div className="mt-3 flex items-center justify-between 
                  bg-green-50 dark:bg-green-900/20 
                  border border-green-200 dark:border-green-800 
                  px-3 py-2 rounded-lg text-sm">

    <span className="text-green-700 dark:text-green-300 font-medium">
      Coupon <b>{appliedCoupon}</b> applied
    </span>

    <button
      onClick={() => {
        setAppliedCoupon(null);
        setCouponCode("");
        setDiscount(0);
        setCouponMsg("");
      }}
      className="text-green-700 dark:text-green-300 hover:text-red-500 
                 text-lg font-bold"
      aria-label="Remove coupon"
    >
      ×
    </button>
  </div>
)}

                {couponMsg && <div className="mt-3 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg">{couponMsg}</div>}
              </div>

                      {user && (
                        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm text-blue-700 dark:text-blue-300">Rewards</div>
                            <div className="text-sm font-semibold">{rewardPoints} pts</div>
                          </div>
                          <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={useRewards}
                              onChange={(e) => setUseRewards(e.target.checked)}
                              className="sr-only"
                            />

                            <div
                              className={`relative w-11 h-6 rounded-full transition-colors ${
                                useRewards ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                                  useRewards ? "translate-x-5" : ""
                                }`}
                              />
                            </div>

                            <span className="text-sm text-blue-700 dark:text-blue-300">
                              Apply rewards
                            </span>
                          </label>

                          {/* U-Money block moved into cart summary */}
                          <div className="mt-4 p-3 bg-white dark:bg-gray-900 rounded-md border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm text-blue-700 dark:text-blue-300">U-Money</div>
                              <div className="text-sm font-semibold">₹{uMoneyBalance}</div>
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={useUMoney}
                                onChange={(e) => setUseUMoney(e.target.checked)}
                                className="sr-only"
                              />

                              <div
                                className={`relative w-11 h-6 rounded-full transition-colors ${
                                  useUMoney ? "bg-emerald-600" : "bg-gray-300 dark:bg-gray-600"
                                }`}
                              >
                                <span
                                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                                    useUMoney ? "translate-x-5" : ""
                                  }`}
                                />
                              </div>

                              <span className="text-sm text-blue-700 dark:text-blue-300">Apply U-Money</span>
                            </label>
                          </div>
                        </div>
                      )}

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
                <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-2"><span>Subtotal</span><span>₹{total}</span></div>
                <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-2"><span>Rewards Discount</span><span>{calculateFinalAmount().rewardsUsed > 0 ? `-₹${calculateFinalAmount().rewardsUsed}` : '₹0'}</span></div>
                <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-2"><span>U-Money Discount</span><span>{calculateFinalAmount().umoneyUsed > 0 ? `-₹${calculateFinalAmount().umoneyUsed}` : '₹0'}</span></div>

                <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-2"><span>Coupon</span><span>{discount > 0 ? `-₹${discount}` : 'Add Coupon'}</span></div>
                <div className="border-t border-gray-300 dark:border-gray-600 pt-3 mt-3">
                  <div className="flex justify-between text-2xl font-bold text-gray-900 dark:text-gray-100">
                    <span>Grand total</span>
                    <span className="text-green-600">₹{calculateFinalAmount().finalAmount}</span>
                  </div>
                </div>
              </div>

              <button onClick={handlePlaceOrderClick} className="w-full py-3 bg-black text-white rounded-lg font-semibold">Check out • ₹{calculateFinalAmount().finalAmount}</button>
            </div>
          </aside>
        </div>
      )}

      {/* Confirmation kept available but not auto-used in new flow */}
      {confirmOpen && (
        <OrderConfirmDialog
          isOpen={confirmOpen}
          onConfirm={handleConfirmOrder}
          onCancel={() => setConfirmOpen(false)}
        />
      )}

     {payOpen && (
  <div className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center px-4">
    <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Complete Payment
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Choose a payment method to place your order
        </p>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-3">

        {/* Cash */}
        <label
          className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition
            ${paymentMethod === "cash"
              ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
        >
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              Cash on Pickup
            </div>
            <div className="text-sm text-gray-500">Pay at outlet</div>
          </div>
          <input
            type="radio"
            name="pm"
            value="cash"
            checked={paymentMethod === "cash"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
        </label>

        {/* Card / UPI */}
        <label
          className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition
            ${paymentMethod === "card"
              ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
        >
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              Card / UPI
            </div>
            <div className="text-sm text-gray-500">Pay online securely</div>
          </div>
          <input
            type="radio"
            name="pm"
            value="card"
            checked={paymentMethod === "card"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
        </label>

        {/* Applied info */}
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 pt-2">
          {useRewards && rewardPoints > 0 && (
            <div>Rewards applied: ₹{Math.min(rewardPoints, payable)}</div>
          )}
          {useUMoney && (
            <div>U-Money applied: ₹{calculateFinalAmount().umoneyUsed}</div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <button
          onClick={() => {
            setPayOpen(false);
            setRazorAuto(null);
          }}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Cancel
        </button>

        <button
          onClick={handlePaymentSuccess}
          className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
        >
          Pay ₹{calculateFinalAmount().finalAmount}
        </button>
      </div>
    </div>
  </div>
)}


      {/* Render auto-opening RazorPay when needed */}
      {razorAuto && (
        <RazorPayReact
          amount={razorAuto.amount}
          userId={user?.id}
          purpose="order"
          orderId={razorAuto.orderId}
          autoOpen={true}
          onOpen={() => { setWaitingOpen(true); setPaymentResult(null); }}
          onClose={(info) => {
            // record result and show waiting overlay for a few seconds
            const result = info && info.reason === 'dismissed' ? 'cancelled' : 'failed';
            setPaymentResult(result);
            setWaitingOpen(true);
            setRazorAuto(null);
            setPayOpen(false);
          }}
          onSuccess={async (v, order) => {
            try {
              // show waiting overlay and mark success so effect can handle redirect
              setWaitingOpen(true);
              setPaymentResult('success');
              await handleRazorSuccess(v, { id: razorAuto.orderId });
              // process stamps after successful order
              await processStamps();
            } catch (e) {
              console.error(e);
              setPaymentResult('failed');
              setWaitingOpen(true);
            } finally {
              setRazorAuto(null);
            }
          }}
        />
      )}

      <WaitingForPayment open={waitingOpen} onCancel={() => { setWaitingOpen(false); setRazorAuto(null); setPayOpen(false); }} />

      {paymentError.open && (
        <AlertPopup isOpen={paymentError.open} onClose={() => setPaymentError({ open: false, msg: '' })} title={"Payment Issue"} message={paymentError.msg || 'Payment could not be completed.'} />
      )}

      {stampPopup.open && (
        <AlertPopup isOpen={stampPopup.open} onClose={() => setStampPopup({ open: false, message: '' })} title={"Stamp Earned"} message={stampPopup.message} />
      )}

      <AlertPopup
        isOpen={showAlertPopup}
        onClose={() => setShowAlertPopup(false)}
        title="Oops! Sign In Required"
        message="You need to sign in to place an order. Create an account to enjoy delicious food!"
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <RewardPopup
        isOpen={showRewardPopup}
        points={earnedPoints}
        onClose={() => setShowRewardPopup(false)}
      />
    </section>
  );
}
