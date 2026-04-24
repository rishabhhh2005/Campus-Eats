import User from '../models/user.js';
import Transaction from '../models/transactions.js';

// userId is always derived from the JWT via protect middleware — never from URL params
export const getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('uMoneyBalance');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ balance: user.uMoneyBalance || 0 });
  } catch (error) {
    console.error('getBalance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.userId })
      .sort({ timestamp: -1 })
      .limit(20)
      .lean();
    res.json({ transactions });
  } catch (error) {
    console.error('getTransactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
