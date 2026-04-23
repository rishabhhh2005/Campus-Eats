import User from '../models/user.js';
import Transaction from '../models/transactions.js';

export const getBalance = async (req, res) => {
	try {
		const user = await User.findById(req.params.userId).select('uMoneyBalance');
		if (!user) return res.status(404).json({ error: 'User not found' });
		res.json({ balance: user.uMoneyBalance || 0 });
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const getTransactions = async (req, res) => {
	try {
		const list = await Transaction.find({ userId: req.params.userId })
			.sort({ timestamp: -1 })
			.limit(20);
		res.json({ transactions: list });
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const addMoney = async (req, res) => {
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
};
