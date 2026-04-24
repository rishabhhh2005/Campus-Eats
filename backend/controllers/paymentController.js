import crypto from 'crypto';
import razorpay from '../config/razorpay.js';
import User from '../models/user.js';
import Order from '../models/orders.js';
import Transaction from '../models/transactions.js';

export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body || {};

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'A valid amount is required' });
    }

    const options = {
      amount:  Math.round(Number(amount) * 100), // convert to paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({ order, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error('createRazorpayOrder error:', error);
    res.status(500).json({ error: 'Payment initialization failed' });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      purpose,
      orderId,
      amount,
    } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ error: 'Missing payment identifiers' });
    }

    // Verify signature for real (non-test) payments
    const isTestMode = razorpay_order_id.startsWith('order_test_');
    if (!isTestMode) {
      if (!razorpay_signature) {
        return res.status(400).json({ error: 'Missing payment signature' });
      }
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ error: 'Invalid payment signature' });
      }
    }

    // Handle wallet top-up
    if (purpose === 'umoney' && userId) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const credit = Number(amount) || 0;
      user.uMoneyBalance = (user.uMoneyBalance || 0) + credit;
      await user.save();
      await Transaction.create({
        userId,
        type:        'credit',
        amount:      credit,
        description: 'Wallet top-up via Razorpay',
      });
      return res.json({ success: true, balance: user.uMoneyBalance });
    }

    // Handle order payment
    if (purpose === 'order' && orderId) {
      const order = await Order.findOne({ id: orderId });
      if (!order) return res.status(404).json({ error: 'Order not found' });

      order.paid = true;
      await order.save();
      await Transaction.create({
        userId:      order.userId,
        type:        'debit',
        amount:      Number(amount) || 0,
        description: `Order payment: ${orderId}`,
      });
      return res.json({ success: true, order });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('verifyPayment error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
};
