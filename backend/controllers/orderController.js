import Order from '../models/orders.js';
import User from '../models/user.js';
import { generatePickupCode } from '../utils/helpers.js';

export const getAllOrders = async (req, res) => {
	try {
		const list = await Order.find({
			items: { $exists: true, $ne: [] },
			payable: { $gt: 0 }
		}).lean();
		res.json({ orders: list });
	} catch (error) {
		console.error('Error fetching orders:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const getUserOrders = async (req, res) => {
	try {
		const list = await Order.find({
			userId: req.user.userId,
			items: { $exists: true, $ne: [] },
			payable: { $gt: 0 }
		}).sort({ timestamp: -1 }).lean();
		res.json({ orders: list });
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const createOrder = async (req, res) => {
	try {
		const user = await User.findById(req.user.userId);
		if (!user) return res.status(404).json({ error: 'User not found' });

		const payload = req.body || {};
		const order = await Order.create({
			id: Date.now().toString(),
			userId: user._id,
			userName: user.name,
			...payload,
			timestamp: new Date(),
			pickupCode: generatePickupCode(),
			status: payload?.status || 'Pending',
			campus: payload?.campus || 'Punjab'
		});

		// Earn reward points (1 point per ₹10)
		if (payload.payable > 0) {
			const points = Math.floor(payload.payable / 10);
			user.rewardPoints = (user.rewardPoints || 0) + points;
			await user.save();
		}

		res.status(201).json(order);
	} catch (error) {
		console.error('Error creating order:', error);
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
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const updateOrderStatus = async (req, res) => {
	try {
		const { status } = req.body || {};
		const allowed = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Picked'];
		if (!status || !allowed.includes(status)) {
			return res.status(400).json({ error: 'Invalid status' });
		}

		const order = await Order.findOne({ id: req.params.id });
		if (!order) return res.status(404).json({ error: 'Order not found' });

		const prevStatus = order.status;
		order.status = status;
		await order.save();

		// If order is completed, update loyalty stamps
		if (status === 'Picked' && prevStatus !== 'Picked') {
			const user = await User.findById(order.userId);
			if (user) {
				user.loyaltyStamps = (user.loyaltyStamps || 0) + 1;
				if (user.loyaltyStamps >= 10) {
					user.loyaltyStamps = 0;
				}
				await user.save();
			}
		}

		res.json({ success: true, order });
	} catch (error) {
		console.error('Error updating status:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const getPickupCode = async (req, res) => {
	try {
		let order = await Order.findOne({ id: req.params.id });
		if (!order) return res.status(404).json({ error: 'Order not found' });
		if (!order.pickupCode) {
			order.pickupCode = generatePickupCode();
			await order.save();
		}
		res.json({ id: order.id, pickupCode: order.pickupCode });
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const pickupByCode = async (req, res) => {
	try {
		const { code } = req.body || {};
		if (!code) return res.status(400).json({ error: 'Code required' });

		const order = await Order.findOne({ pickupCode: code });
		if (!order) return res.status(404).json({ error: 'Order not found' });

		order.status = 'Picked';
		await order.save();
		res.json({ success: true, order });
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const acceptByCode = async (req, res) => {
	try {
		const { code } = req.body || {};
		if (!code) return res.status(400).json({ error: 'Code required' });

		const order = await Order.findOne({ pickupCode: code });
		if (!order) return res.status(404).json({ error: 'Order not found' });

		const progression = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Picked'];
		if (progression.indexOf(order.status) < progression.indexOf('Accepted')) {
			order.status = 'Accepted';
		}

		await order.save();
		res.json({ success: true, order });
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
};
