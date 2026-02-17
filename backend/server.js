import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import connectDB from './db/connectDB.js';
import Order from './models/orders.js';
import User from './models/user.js';
import Rating from './models/ratings.js';
import Transaction from './models/transactions.js';

const app = express();
const port = 5000;
const JWT_SECRET = 'campus-eats-secret-key-2025';

app.use(cors());
app.use(express.json());
connectDB();

// Razorpay instance
const razorpay = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID,
	key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Mock campuses metadata endpoint (frontend fetches this)
const MOCK_CAMPUSES = [
	{
		campusId: 'punjab',
		campusName: 'Punjab',
		universityName: 'Chitkara University',
		city: 'Punjab',
		state: 'Punjab',
		logo: null,
		theme: {},
		sourceKey: 'Punjab'
	},
	{
		campusId: 'himachal',
		campusName: 'Himachal',
		universityName: 'Himachal University',
		city: 'Himachal',
		state: 'Himachal Pradesh',
		logo: null,
		theme: {},
		sourceKey: 'Himachal'
	}
];

app.get('/api/campuses', (req, res) => {
	res.json({ campuses: MOCK_CAMPUSES });
});

app.get('/api/campuses/:id', (req, res) => {
	const id = req.params.id;
	const c = MOCK_CAMPUSES.find(x => x.campusId === id || x.sourceKey === id || x.campusName === id);
	if (!c) return res.status(404).json({ error: 'Campus not found' });
	res.json({ campus: c });
});

// Get all orders (for vendor - no auth needed)
app.get('/api/orders/all', async (req, res) => {
	try {
		const list = await Order.find({
			items: { $exists: true, $ne: [] },
			payable: { $gt: 0 }
		}).lean();
		res.json({ orders: list });
	} catch (error) {
		console.error('Error reading orders:', error);
		res.status(500).json({ error: 'Error reading orders' });
	}
});

// Get orders for logged-in user
app.get('/api/orders', async (req, res) => {
	try {
		const token = req.headers.authorization?.replace('Bearer ', '');
		if (!token) return res.status(401).json({ error: 'No token' });
		
		const decoded = jwt.verify(token, JWT_SECRET);
		const list = await Order.find({
			userId: decoded.userId,
			items: { $exists: true, $ne: [] },
			payable: { $gt: 0 }
		}).sort({ timestamp: -1 }).lean();
		res.json({ orders: list });
	} catch (error) {
		console.error('Error reading orders:', error);
		res.status(500).json({ error: 'Error reading orders' });
	}
});

// Helper to generate a short human-friendly pickup code
function generatePickupCode() {
	const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
	let code = '';
	for (let i = 0; i < 6; i++) {
		code += chars[Math.floor(Math.random() * chars.length)];
	}
	return code;
}

// Add a new order
app.post('/api/orders', async (req, res) => {
	try {
		const token = req.headers.authorization?.replace('Bearer ', '');
		if (!token) return res.status(401).json({ error: 'Please sign in to place orders' });
		
		const decoded = jwt.verify(token, JWT_SECRET);
		const user = await User.findById(decoded.userId);
		if (!user) return res.status(404).json({ error: 'User not found' });
		
		const payload = req.body || {};
		const doc = await Order.create({
			id: Date.now().toString(),
			userId: user._id,
			userName: user.name,
			...payload,
			timestamp: new Date(),
			pickupCode: generatePickupCode(),
			status: payload?.status || 'Pending',
			campus: payload?.campus || 'Punjab'
		});
		res.status(201).json(doc);
	} catch (error) {
		console.error('Error adding order:', error);
		if (error?.code === 11000) {
			return res.status(409).json({ error: 'Duplicate order id' });
		}
		res.status(500).json({ error: 'Error adding order' });
	}
});

// Delete an order (owner only)
app.delete('/api/orders/:id', async (req, res) => {
	try {
		const token = req.headers.authorization?.replace('Bearer ', '');
		if (!token) return res.status(401).json({ error: 'Please sign in to delete orders' });
		const decoded = jwt.verify(token, JWT_SECRET);

		const order = await Order.findOne({ id: req.params.id });
		if (!order) return res.status(404).json({ error: 'Order not found' });

		// Only the user who created the order may delete it
		if (String(order.userId) !== String(decoded.userId)) {
			return res.status(403).json({ error: 'Not authorized to delete this order' });
		}

		await Order.deleteOne({ id: req.params.id });
		res.json({ success: true });
	} catch (error) {
		console.error('Error deleting order:', error);
		if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
			return res.status(401).json({ error: 'Invalid token' });
		}
		res.status(500).json({ error: 'Error deleting order' });
	}
});

// Get pickup code for an order (for showing QR on client)
app.get('/api/orders/:id/pickup-code', async (req, res) => {
	try {
		let order = await Order.findOne({ id: req.params.id });
		if (!order) return res.status(404).json({ error: 'Order not found' });
		if (!order.pickupCode) {
			order.pickupCode = generatePickupCode();
			await order.save();
		}
		res.json({ id: order.id, pickupCode: order.pickupCode });
	} catch (error) {
		console.error('Error getting pickup code:', error);
		res.status(500).json({ error: 'Error getting pickup code' });
	}
});

// Vendor scans/enters code to mark as picked up
app.post('/api/orders/:id/pickup', async (req, res) => {
	try {
		const { code } = req.body || {};
		if (!code) return res.status(400).json({ error: 'Code required' });

		const order = await Order.findOne({ id: req.params.id });
		if (!order) return res.status(404).json({ error: 'Order not found' });
		if (order.pickupCode !== code) return res.status(401).json({ error: 'Invalid code' });

		order.status = 'Picked';
		await order.save();
		res.json({ success: true, order });
	} catch (error) {
		console.error('Error marking pickup:', error);
		res.status(500).json({ error: 'Error marking pickup' });
	}
});

// Simple pickup by code (no order id needed) - for vendor UI
app.post('/api/pickup/by-code', async (req, res) => {
	try {
		const { code } = req.body || {};
		if (!code) return res.status(400).json({ error: 'Code required' });

		const order = await Order.findOne({ pickupCode: code });
		if (!order) return res.status(404).json({ error: 'Order not found for code' });

		order.status = 'Picked';
		await order.save();
		res.json({ success: true, order });
	} catch (error) {
		console.error('Error in pickup by code:', error);
		res.status(500).json({ error: 'Error in pickup by code' });
	}
});

// Vendor accepts an order by ID (sets status to 'Accepted')
app.post('/api/orders/:id/accept', async (req, res) => {
	try {
		const order = await Order.findOne({ id: req.params.id });
		if (!order) return res.status(404).json({ error: 'Order not found' });
		order.status = 'Accepted';
		await order.save();
		res.json({ success: true, order });
	} catch (error) {
		console.error('Error accepting order:', error);
		res.status(500).json({ error: 'Error accepting order' });
	}
});

// Vendor accepts an order by pickup code (scan/paste)
app.post('/api/accept/by-code', async (req, res) => {
	try {
		const { code } = req.body || {};
		if (!code) return res.status(400).json({ error: 'Code required' });

		const order = await Order.findOne({ pickupCode: code });
		if (!order) return res.status(404).json({ error: 'Order not found for code' });

		// Move to Accepted if not already further along
		const progression = ['Pending','Accepted','Preparing','Ready','Picked'];
		const currentIdx = progression.indexOf(order.status || 'Pending');
		const acceptedIdx = progression.indexOf('Accepted');
		if (currentIdx < acceptedIdx) {
			order.status = 'Accepted';
		}

		await order.save();
		res.json({ success: true, order });
	} catch (error) {
		console.error('Error in accept by code:', error);
		res.status(500).json({ error: 'Error in accept by code' });
	}
});

// Update order status (e.g., Preparing, Ready, Picked)
app.post('/api/orders/:id/status', async (req, res) => {
	try {
		const { status } = req.body || {};
		const allowed = ['Pending','Accepted','Preparing','Ready','Picked'];
		if (!status || !allowed.includes(status)) {
			return res.status(400).json({ error: 'Invalid status' });
		}

		const order = await Order.findOne({ id: req.params.id });
		if (!order) return res.status(404).json({ error: 'Order not found' });

		order.status = status;
		await order.save();
		res.json({ success: true, order });
	} catch (error) {
		console.error('Error updating order status:', error);
		res.status(500).json({ error: 'Error updating order status' });
	}
});

app.post('/api/auth/signup', async (req, res) => {
	try {
		const { email, password, name, phone } = req.body;
		if (!email || !password || !name) {
			return res.status(400).json({ error: 'Email, password and name required' });
		}
		const existing = await User.findOne({ email });
		if (existing) return res.status(409).json({ error: 'Email already exists' });
		
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await User.create({ email, password: hashedPassword, name, phone });
		const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
		
		res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name, phone: user.phone } });
	} catch (error) {
		console.error('Signup error:', error);
		res.status(500).json({ error: 'Signup failed' });
	}
});

app.post('/api/auth/login', async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({ error: 'Email and password required' });
		}
		
		const user = await User.findOne({ email });
		if (!user) return res.status(401).json({ error: 'Invalid credentials' });
		
		const valid = await bcrypt.compare(password, user.password);
		if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
		
		const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
		res.json({ token, user: { id: user._id, email: user.email, name: user.name, phone: user.phone } });
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({ error: 'Login failed' });
	}
});

app.get('/api/auth/me', async (req, res) => {
	try {
		const token = req.headers.authorization?.replace('Bearer ', '');
		if (!token) return res.status(401).json({ error: 'No token' });
		
		const decoded = jwt.verify(token, JWT_SECRET);
		const user = await User.findById(decoded.userId).select('-password');
		if (!user) return res.status(404).json({ error: 'User not found' });
		
		res.json({ user: { id: user._id, email: user.email, name: user.name, phone: user.phone } });
	} catch (error) {
		res.status(401).json({ error: 'Invalid token' });
	}
});

// Recommendation APIs
app.get('/api/recommendations/hostel/:hostel', async (req, res) => {
	try {
		const { hostel } = req.params;
		const result = await Order.aggregate([
			{ $match: { status: { $in: ['Picked', 'Ready'] } } },
			{ $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
			{ $unwind: '$user' },
			{ $match: { 'user.hostel': hostel } },
			{ $unwind: '$items' },
			{ $group: { _id: '$items.id', name: { $first: '$items.name' }, image: { $first: '$items.image' }, price: { $first: '$items.price' }, count: { $sum: '$items.qty' } } },
			{ $sort: { count: -1 } },
			{ $limit: 5 }
		]);
		res.json({ recommendations: result });
	} catch (error) {
		console.error('Error fetching hostel recommendations:', error);
		res.status(500).json({ error: 'Error fetching recommendations' });
	}
});

app.get('/api/recommendations/best-rated-today', async (req, res) => {
	try {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		const result = await Rating.aggregate([
			{ $match: { timestamp: { $gte: today, $lt: tomorrow } } },
			{ $group: { _id: '$itemId', name: { $first: '$itemName' }, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
			{ $match: { count: { $gte: 5 } } },
			{ $sort: { avgRating: -1 } },
			{ $limit: 5 }
		]);
		res.json({ recommendations: result });
	} catch (error) {
		console.error('Error fetching best rated today:', error);
		res.status(500).json({ error: 'Error fetching recommendations' });
	}
});

app.get('/api/recommendations/trending', async (req, res) => {
	try {
		const now = new Date();
		const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
		const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

		const recentOrders = await Order.aggregate([
			{ $match: { timestamp: { $gte: threeHoursAgo }, status: { $in: ['Picked', 'Ready'] } } },
			{ $unwind: '$items' },
			{ $group: { _id: '$items.id', name: { $first: '$items.name' }, image: { $first: '$items.image' }, price: { $first: '$items.price' }, recentCount: { $sum: '$items.qty' } } }
		]);

		const pastOrders = await Order.aggregate([
			{ $match: { timestamp: { $gte: sixHoursAgo, $lt: threeHoursAgo }, status: { $in: ['Picked', 'Ready'] } } },
			{ $unwind: '$items' },
			{ $group: { _id: '$items.id', pastCount: { $sum: '$items.qty' } } }
		]);

		const pastMap = new Map(pastOrders.map(p => [p._id, p.pastCount || 1]));

		const trending = recentOrders.map(r => {
			const past = pastMap.get(r._id) || 1;
			const spike = ((r.recentCount - past) / past) * 100;
			return { ...r, trendScore: spike };
		}).sort((a, b) => b.trendScore - a.trendScore).slice(0, 5);

		res.json({ recommendations: trending });
	} catch (error) {
		console.error('Error fetching trending:', error);
		res.status(500).json({ error: 'Error fetching recommendations' });
	}
});

// Loyalty APIs
app.post('/api/loyalty/update/:userId', async (req, res) => {
	try {
		const { userId } = req.params;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: 'User not found' });

		user.loyaltyStamps += 1;
		if (user.loyaltyStamps >= 10) {
			user.loyaltyStamps = 0;
			// Create free food credit - could add to a credits collection or just note it
		}
		await user.save();
		res.json({ stamps: user.loyaltyStamps });
	} catch (error) {
		console.error('Error updating loyalty:', error);
		res.status(500).json({ error: 'Error updating loyalty' });
	}
});

app.get('/api/loyalty/status/:userId', async (req, res) => {
	try {
		const { userId } = req.params;
		const user = await User.findById(userId).select('loyaltyStamps');
		if (!user) return res.status(404).json({ error: 'User not found' });
		res.json({ stamps: user.loyaltyStamps });
	} catch (error) {
		console.error('Error getting loyalty status:', error);
		res.status(500).json({ error: 'Error getting loyalty status' });
	}
});

// Rewards APIs
app.post('/api/rewards/add-points', async (req, res) => {
	try {
		const { userId, amount } = req.body;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: 'User not found' });

		const points = Math.floor(amount / 10); // 1 point per ₹10
		user.rewardPoints += points;
		await user.save();
		res.json({ points: user.rewardPoints });
	} catch (error) {
		console.error('Error adding points:', error);
		res.status(500).json({ error: 'Error adding points' });
	}
});

app.post('/api/rewards/redeem', async (req, res) => {
	try {
		const { userId, points } = req.body;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: 'User not found' });
		if (user.rewardPoints < points) return res.status(400).json({ error: 'Insufficient points' });

		user.rewardPoints -= points;
		await user.save();
		res.json({ points: user.rewardPoints, redeemed: points });
	} catch (error) {
		console.error('Error redeeming points:', error);
		res.status(500).json({ error: 'Error redeeming points' });
	}
});

app.get('/api/rewards/balance/:userId', async (req, res) => {
	try {
		const { userId } = req.params;
		const user = await User.findById(userId).select('rewardPoints');
		if (!user) return res.status(404).json({ error: 'User not found' });
		res.json({ points: user.rewardPoints });
	} catch (error) {
		console.error('Error getting balance:', error);
		res.status(500).json({ error: 'Error getting balance' });
	}
});

// U-Money APIs
app.post('/api/umoney/add', async (req, res) => {
	try {
		const { userId, amount } = req.body;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: 'User not found' });

		user.uMoneyBalance += amount;
		await user.save();
		res.json({ balance: user.uMoneyBalance });
	} catch (error) {
		console.error('Error adding U-Money:', error);
		res.status(500).json({ error: 'Error adding U-Money' });
	}
});

app.post('/api/umoney/deduct', async (req, res) => {
	try {
		const { userId, amount } = req.body;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: 'User not found' });
		if (user.uMoneyBalance < amount) return res.status(400).json({ error: 'Insufficient balance' });

		user.uMoneyBalance -= amount;
		await user.save();
		res.json({ balance: user.uMoneyBalance });
	} catch (error) {
		console.error('Error deducting U-Money:', error);
		res.status(500).json({ error: 'Error deducting U-Money' });
	}
});

app.get('/api/umoney/balance/:userId', async (req, res) => {
	try {
		const { userId } = req.params;
		const user = await User.findById(userId).select('uMoneyBalance');
		if (!user) return res.status(404).json({ error: 'User not found' });
		res.json({ balance: user.uMoneyBalance });
	} catch (error) {
		console.error('Error getting U-Money balance:', error);
		res.status(500).json({ error: 'Error getting U-Money balance' });
	}
});

// Update order status to handle loyalty stamps
app.post('/api/orders/:id/status', async (req, res) => {
	try {
		const { status } = req.body || {};
		const allowed = ['Pending','Accepted','Preparing','Ready','Picked'];
		if (!status || !allowed.includes(status)) {
			return res.status(400).json({ error: 'Invalid status' });
		}

		const order = await Order.findOne({ id: req.params.id });
		if (!order) return res.status(404).json({ error: 'Order not found' });

		const prevStatus = order.status;
		order.status = status;
		await order.save();

		// If order is completed (Picked), update loyalty stamps
		if (status === 'Picked' && prevStatus !== 'Picked') {
			const user = await User.findById(order.userId);
			if (user) {
				user.loyaltyStamps += 1;
				if (user.loyaltyStamps >= 10) {
					user.loyaltyStamps = 0;
					// Free food credit logic here
				}
				await user.save();
			}
		}

		res.json({ success: true, order });
	} catch (error) {
		console.error('Error updating order status:', error);
		res.status(500).json({ error: 'Error updating order status' });
	}
});

// Update order placement to earn reward points
app.post('/api/orders', async (req, res) => {
	try {
		const token = req.headers.authorization?.replace('Bearer ', '');
		if (!token) return res.status(401).json({ error: 'Please sign in to place orders' });
		
		const decoded = jwt.verify(token, JWT_SECRET);
		const user = await User.findById(decoded.userId);
		if (!user) return res.status(404).json({ error: 'User not found' });
		
		const payload = req.body || {};
		const doc = await Order.create({
			id: Date.now().toString(),
			userId: user._id,
			userName: user.name,
			...payload,
			timestamp: new Date(),
			pickupCode: generatePickupCode(),
			status: payload?.status || 'Pending',
			campus: payload?.campus || 'Punjab'
		});

		// Earn reward points on order placement
		if (payload.payable > 0) {
			const points = Math.floor(payload.payable / 10);
			user.rewardPoints += points;
			await user.save();
		}

		res.status(201).json(doc);
	} catch (error) {
		console.error('Error adding order:', error);
		if (error?.code === 11000) {
			return res.status(409).json({ error: 'Duplicate order id' });
		}
		res.status(500).json({ error: 'Error adding order' });
	}
});

// U-Money Wallet APIs
app.post('/api/umoney/add', async (req, res) => {
	try {
		const { userId, amount } = req.body;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: 'User not found' });

		user.uMoneyBalance += amount;
		await user.save();

		await Transaction.create({
			userId,
			type: 'credit',
			amount,
			description: 'Added money to wallet'
		});

		res.json({ balance: user.uMoneyBalance });
	} catch (error) {
		console.error('Error adding money:', error);
		res.status(500).json({ error: 'Error adding money' });
	}
});

app.post('/api/umoney/deduct', async (req, res) => {
	try {
		const { userId, amount } = req.body;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: 'User not found' });
		if (user.uMoneyBalance < amount) return res.status(400).json({ error: 'Insufficient balance' });

		user.uMoneyBalance -= amount;
		await user.save();

		await Transaction.create({
			userId,
			type: 'debit',
			amount,
			description: 'Payment using U-Money'
		});

		res.json({ balance: user.uMoneyBalance });
	} catch (error) {
		console.error('Error deducting money:', error);
		res.status(500).json({ error: 'Error deducting money' });
	}
});

app.get('/api/umoney/balance/:userId', async (req, res) => {
	try {
		const user = await User.findById(req.params.userId);
		if (!user) return res.status(404).json({ error: 'User not found' });
		res.json({ balance: user.uMoneyBalance });
	} catch (error) {
		console.error('Error fetching balance:', error);
		res.status(500).json({ error: 'Error fetching balance' });
	}
});

app.get('/api/umoney/transactions/:userId', async (req, res) => {
	try {
		const transactions = await Transaction.find({ userId: req.params.userId })
			.sort({ timestamp: -1 })
			.limit(20);
		res.json({ transactions });
	} catch (error) {
		console.error('Error fetching transactions:', error);
		res.status(500).json({ error: 'Error fetching transactions' });
	}
});

// Reward Points APIs
app.get('/api/rewards/balance/:userId', async (req, res) => {
	try {
		const user = await User.findById(req.params.userId);
		if (!user) return res.status(404).json({ error: 'User not found' });
		res.json({ points: user.rewardPoints || 0 });
	} catch (error) {
		console.error('Error fetching reward balance:', error);
		res.status(500).json({ error: 'Error fetching reward balance' });
	}
});

app.post('/api/rewards/add', async (req, res) => {
	try {
		const { userId, points } = req.body;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: 'User not found' });

		user.rewardPoints = (user.rewardPoints || 0) + points;
		await user.save();

		res.json({ points: user.rewardPoints });
	} catch (error) {
		console.error('Error adding reward points:', error);
		res.status(500).json({ error: 'Error adding reward points' });
	}
});

app.post('/api/rewards/redeem', async (req, res) => {
	try {
		const { userId, points } = req.body;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: 'User not found' });
		if ((user.rewardPoints || 0) < points) return res.status(400).json({ error: 'Insufficient reward points' });

		user.rewardPoints -= points;
		await user.save();

		res.json({ points: user.rewardPoints });
	} catch (error) {
		console.error('Error redeeming reward points:', error);
		res.status(500).json({ error: 'Error redeeming reward points' });
	}
});

app.listen(port,"0.0.0.0", () => {
	console.log(`Server running at http://localhost:${port}`);
});

// Razorpay endpoints
app.post('/api/payment/create-order', async (req, res) => {
	try {
		const { amount, currency = 'INR', receipt } = req.body || {};
		if (!amount || isNaN(amount) || amount <= 0) return res.status(400).json({ error: 'Valid amount required' });

		const options = {
			amount: Math.round(Number(amount) * 100), // INR -> paise
			currency,
			receipt: receipt || `rcpt_${Date.now()}`
		};

		const order = await razorpay.orders.create(options);
		// return order object and publishable key to client
		res.json({ order, key: process.env.RAZORPAY_KEY_ID });
	} catch (error) {
		console.error('Error creating razorpay order:', error);
		res.status(500).json({ error: 'Error creating payment order' });
	}
});

app.post('/api/payment/verify', async (req, res) => {
	try {
		const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, purpose, orderId, amount } = req.body || {};
		if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({ error: 'Missing payment verification fields' });

		const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
		shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
		const digest = shasum.digest('hex');

		if (digest !== razorpay_signature) {
			return res.status(400).json({ error: 'Invalid signature' });
		}

		// At this point payment is verified
		// If this was wallet top-up
		if (purpose === 'umoney' && userId) {
			const user = await User.findById(userId);
			if (!user) return res.status(404).json({ error: 'User not found' });
			const credit = Number(amount) || 0;
			user.uMoneyBalance = (user.uMoneyBalance || 0) + credit;
			await user.save();

			await Transaction.create({ userId, type: 'credit', amount: credit, description: 'Wallet top-up via Razorpay' });

			return res.json({ success: true, balance: user.uMoneyBalance });
		}

		// If this was an order payment
		if (purpose === 'order' && orderId && userId) {
			const order = await Order.findOne({ id: orderId });
			if (!order) return res.status(404).json({ error: 'Order not found' });

			order.paid = true;
			await order.save();

			await Transaction.create({ userId, type: 'debit', amount: Number(amount) || 0, description: `Payment for order ${orderId} via Razorpay` });

			return res.json({ success: true, order });
		}

		// Generic success response if nothing else
		res.json({ success: true });
	} catch (error) {
		console.error('Error verifying payment:', error);
		res.status(500).json({ error: 'Error verifying payment' });
	}
});
