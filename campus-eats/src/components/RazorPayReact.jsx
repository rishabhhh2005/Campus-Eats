import React from 'react';
import { API_URL } from "../utils/api.js";

const loadScript = (src) => {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

import { useEffect } from 'react';

const RazorPayReact = ({ amount, userId, purpose = 'umoney', orderId = null, onSuccess = () => {}, onOpen = () => {}, onClose = () => {}, children = 'Pay', autoOpen = false }) => {
  const handlePay = async () => {
    if (!amount || Number(amount) <= 0) return alert('Invalid amount');

    // create order on backend
    const res = await fetch(`${API_URL}/payment/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency: 'INR', receipt: `rcpt_${Date.now()}` })
    });
    const data = await res.json();
    if (!data || !data.order) return alert('Could not create payment order');

    const ok = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!ok) return alert('Razorpay SDK failed to load');

    const { order, key } = data;

    const options = {
      key: key,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'Chitkara Eats',
      description: purpose === 'umoney' ? 'Wallet top-up' : 'Order payment',
      order_id: order.id,
      handler: async function (response) {
        // verify on backend
        const verifyRes = await fetch(`${API_URL}/payment/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            userId,
            purpose,
            orderId,
            amount
          })
        });
        const v = await verifyRes.json();
        if (v && v.success) {
          onSuccess(v, order);
        } else {
          onClose({ reason: 'verify_failed' });
          alert('Payment verification failed');
        }
      },
      prefill: { contact: '', email: '' }
    };

    options.modal = {
      ondismiss: function () {
        // user dismissed checkout
        onClose({ reason: 'dismissed' });
      }
    };

    const rzp = new window.Razorpay(options);
    // notify parent that checkout opened
    onOpen();
    // handle failure event if available
    try {
      rzp.on && rzp.on('payment.failed', function (resp) {
        onClose({ reason: 'failed', detail: resp });
      });
    } catch (e) {}

    rzp.open();
  };

  useEffect(() => {
    if (autoOpen) {
      // small delay to ensure props like orderId are set
      setTimeout(() => {
        handlePay();
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen]);

  return (
    <button onClick={handlePay} className="razorpay-button">
      {children}
    </button>
  );
};

export default RazorPayReact;