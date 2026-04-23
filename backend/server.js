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
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

// Initialize Database
connectDB();

// Initialize Razorpay
const razorpay = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID,
	key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Campus Metadata Endpoints
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

// Authentication Endpoints
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

// Orders Endpoints
function generatePickupCode() {
	const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
	let code = '';
	for (let i = 0; i < 6; i++) {
		code += chars[Math.floor(Math.random() * chars.length)];
	}
	return code;
}

app.get('/api/orders/all', async (req, res) => {
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
});

app.get('/api/orders', async (req, res) => {
	try {
		const token = req.headers.authorization?.replace('Bearer ', '');
		if (!token) return res.status(401).json({ error: 'Unauthorized' });

		const decoded = jwt.verify(token, JWT_SECRET);
		const list = await Order.find({
			userId: decoded.userId,
			items: { $exists: true, $ne: [] },
			payable: { $gt: 0 }
		}).sort({ timestamp: -1 }).lean();
		res.json({ orders: list });
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
});

app.post('/api/orders', async (req, res) => {
	try {
		const token = req.headers.authorization?.replace('Bearer ', '');
		if (!token) return res.status(401).json({ error: 'Authentication required' });

		const decoded = jwt.verify(token, JWT_SECRET);
		const user = await User.findById(decoded.userId);
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
});

app.delete('/api/orders/:id', async (req, res) => {
	try {
		const token = req.headers.authorization?.replace('Bearer ', '');
		if (!token) return res.status(401).json({ error: 'Unauthorized' });
		const decoded = jwt.verify(token, JWT_SECRET);

		const order = await Order.findOne({ id: req.params.id });
		if (!order) return res.status(404).json({ error: 'Order not found' });

		if (String(order.userId) !== String(decoded.userId)) {
			return res.status(403).json({ error: 'Forbidden' });
		}

		await Order.deleteOne({ id: req.params.id });
		res.json({ success: true });
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
});

app.post('/api/orders/:id/status', async (req, res) => {
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
					// Free credit milestone can be handled here
				}
				await user.save();
			}
		}

		res.json({ success: true, order });
	} catch (error) {
		console.error('Error updating status:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

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
		res.status(500).json({ error: 'Internal server error' });
	}
});

app.post('/api/pickup/by-code', async (req, res) => {
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
});

app.post('/api/accept/by-code', async (req, res) => {
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
		res.status(500).json({ error: 'Internal server error' });
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
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Loyalty & Rewards Endpoints
app.get('/api/loyalty/status/:userId', async (req, res) => {
	try {
		const user = await User.findById(req.params.userId).select('loyaltyStamps');
		if (!user) return res.status(404).json({ error: 'User not found' });
		res.json({ stamps: user.loyaltyStamps || 0 });
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
});

app.get('/api/rewards/balance/:userId', async (req, res) => {
	try {
		const user = await User.findById(req.params.userId).select('rewardPoints');
		if (!user) return res.status(404).json({ error: 'User not found' });
		res.json({ points: user.rewardPoints || 0 });
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
});

app.post('/api/rewards/redeem', async (req, res) => {
	try {
		const { userId, points } = req.body;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: 'User not found' });
		if ((user.rewardPoints || 0) < points) return res.status(400).json({ error: 'Insufficient points' });

		user.rewardPoints -= points;
		await user.save();
		res.json({ points: user.rewardPoints });
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
});

// U-Money Wallet Endpoints
app.get('/api/umoney/balance/:userId', async (req, res) => {
	try {
		const user = await User.findById(req.params.userId).select('uMoneyBalance');
		if (!user) return res.status(404).json({ error: 'User not found' });
		res.json({ balance: user.uMoneyBalance || 0 });
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
});

app.get('/api/umoney/transactions/:userId', async (req, res) => {
	try {
		const list = await Transaction.find({ userId: req.params.userId })
			.sort({ timestamp: -1 })
			.limit(20);
		res.json({ transactions: list });
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
});

app.post('/api/umoney/add', async (req, res) => {
	try {
		const { userId, amount } = req.body;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: 'User not found' });

		user.uMoneyBalance = (user.uMoneyBalance || 0) + amount;
		await user.save();

		await Transaction.create({
			userId,
			type: 'credit',
			amount,
			description: 'Wallet top-up'
		});

		res.json({ balance: user.uMoneyBalance });
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Payment Endpoints
app.post('/api/payment/create-order', async (req, res) => {
	try {
		const { amount, currency = 'INR', receipt } = req.body || {};
		if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

		const options = {
			amount: Math.round(Number(amount) * 100), // paise
			currency,
			receipt: receipt || `rcpt_${Date.now()}`
		};

		const order = await razorpay.orders.create(options);
		res.json({ order, key: process.env.RAZORPAY_KEY_ID });
	} catch (error) {
		console.error('Razorpay order error:', error);
		res.status(500).json({ error: 'Payment initialization failed' });
	}
});

app.post('/api/payment/verify', async (req, res) => {
	try {
		const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, purpose, orderId, amount } = req.body || {};

		// Signature Verification
		const isTestMode = razorpay_order_id.startsWith('order_test_');
		if (!isTestMode) {
			const body = razorpay_order_id + "|" + razorpay_payment_id;
			const expectedSignature = crypto
				.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
				.update(body.toString())
				.digest("hex");

			if (expectedSignature !== razorpay_signature) {
				return res.status(400).json({ error: 'Invalid signature' });
			}
		}

		// Handle successful payment
		if (purpose === 'umoney' && userId) {
			const user = await User.findById(userId);
			const credit = Number(amount) || 0;
			user.uMoneyBalance = (user.uMoneyBalance || 0) + credit;
			await user.save();
			await Transaction.create({ userId, type: 'credit', amount: credit, description: 'Wallet top-up via Razorpay' });
			return res.json({ success: true, balance: user.uMoneyBalance });
		}

		if (purpose === 'order' && orderId) {
			const order = await Order.findOne({ id: orderId });
			if (order) {
				order.paid = true;
				await order.save();
				await Transaction.create({ userId: order.userId, type: 'debit', amount: Number(amount) || 0, description: `Order payment: ${orderId}` });
			}
			return res.json({ success: true, order });
		}

		res.json({ success: true });
	} catch (error) {
		console.error('Payment verification error:', error);
		res.status(500).json({ error: 'Payment verification failed' });
	}
});

app.listen(port, "0.0.0.0", () => {
	console.log(`Server is running on port ${port}`);
});
