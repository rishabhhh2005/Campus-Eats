import User from '../models/user.js';

// userId is always derived from the JWT via protect middleware — never from URL params
export const getLoyaltyStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('loyaltyStamps');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ stamps: user.loyaltyStamps || 0 });
  } catch (error) {
    console.error('getLoyaltyStatus error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRewardBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('rewardPoints');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ points: user.rewardPoints || 0 });
  } catch (error) {
    console.error('getRewardBalance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const redeemRewards = async (req, res) => {
  try {
    const { points } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({ error: 'A positive point value is required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if ((user.rewardPoints || 0) < points) {
      return res.status(400).json({ error: 'Insufficient reward points' });
    }

    user.rewardPoints -= points;
    await user.save();
    res.json({ points: user.rewardPoints });
  } catch (error) {
    console.error('redeemRewards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
