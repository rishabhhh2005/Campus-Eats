import User from '../models/user.js';

export const getLoyaltyStatus = async (req, res) => {
	try {
		const user = await User.findById(req.params.userId).select('loyaltyStamps');
		if (!user) return res.status(404).json({ error: 'User not found' });
		res.json({ stamps: user.loyaltyStamps || 0 });
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const getRewardBalance = async (req, res) => {
	try {
		const user = await User.findById(req.params.userId).select('rewardPoints');
		if (!user) return res.status(404).json({ error: 'User not found' });
		res.json({ points: user.rewardPoints || 0 });
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const redeemRewards = async (req, res) => {
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
};
