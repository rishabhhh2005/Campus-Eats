import Order from '../models/orders.js';
import User from '../models/user.js';
import { generatePickupCode } from '../utils/helpers.js';

const ALLOWED_STATUSES = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Picked'];

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      items:   { $exists: true, $ne: [] },
      payable: { $gt: 0 },
      hiddenForVendor: { $ne: true }
    }).lean();
    res.json({ orders });
  } catch (error) {
    console.error('getAllOrders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      userId:  req.user.userId,
      items:   { $exists: true, $ne: [] },
      payable: { $gt: 0 },
    }).sort({ timestamp: -1 }).lean();
    res.json({ orders });
  } catch (error) {
    console.error('getUserOrders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createOrder = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const payload = req.body || {};
    const order   = await Order.create({
      id:          Date.now().toString(),
      userId:      user._id,
      userName:    user.name,
      ...payload,
      timestamp:   new Date(),
      pickupCode:  generatePickupCode(),
      status:      payload.status || 'Pending',
      campus:      payload.campus || 'Punjab',
    });

    // Earn 1 reward point per ₹10 spent
    if (payload.payable > 0) {
      const points = Math.floor(payload.payable / 10);
      user.rewardPoints = (user.rewardPoints || 0) + points;
      await user.save();
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('createOrder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (String(order.userId) !== String(req.user.userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await Order.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    console.error('deleteOrder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body || {};

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${ALLOWED_STATUSES.join(', ')}` });
    }

    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const prevStatus = order.status;
    order.status = status;
    await order.save();

    // Award a loyalty stamp when order is picked up for the first time
    if (status === 'Picked' && prevStatus !== 'Picked') {
      const user = await User.findById(order.userId);
      if (user) {
        user.loyaltyStamps = ((user.loyaltyStamps || 0) + 1) % 10;
        await user.save();
      }
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPickupCode = async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (!order.pickupCode) {
      order.pickupCode = generatePickupCode();
      await order.save();
    }

    res.json({ id: order.id, pickupCode: order.pickupCode });
  } catch (error) {
    console.error('getPickupCode error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const pickupByCode = async (req, res) => {
  try {
    const { code } = req.body || {};
    if (!code) return res.status(400).json({ error: 'Pickup code is required' });

    const order = await Order.findOne({ pickupCode: code });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.status === 'Picked') {
      return res.status(400).json({ error: 'Order is already picked up' });
    }

    order.status = 'Picked';
    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    console.error('pickupByCode error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const acceptByCode = async (req, res) => {
  try {
    const { code } = req.body || {};
    if (!code) return res.status(400).json({ error: 'Pickup code is required' });

    const order = await Order.findOne({ pickupCode: code });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.status === 'Picked') {
      return res.status(400).json({ error: 'Order is already picked up' });
    }

    if (ALLOWED_STATUSES.indexOf(order.status) >= ALLOWED_STATUSES.indexOf('Accepted')) {
      return res.status(400).json({ error: 'Order is already accepted' });
    }

    order.status = 'Accepted';
    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    console.error('acceptByCode error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const hideOrderForVendor = async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.hiddenForVendor = true;
    await order.save();

    res.json({ success: true });
  } catch (error) {
    console.error('hideOrderForVendor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
