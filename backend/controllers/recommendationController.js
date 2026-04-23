import Order from '../models/orders.js';
import Rating from '../models/ratings.js';

export const getBestRatedToday = async (req, res) => {
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
};

export const getTrending = async (req, res) => {
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
};
